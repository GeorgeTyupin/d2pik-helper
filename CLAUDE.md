# d2pik-helper — документация проекта

## Что это

Десктопное Windows-приложение на Go, которое помогает выбрать героя в Dota 2 на этапе пика.
Пользователь делает скриншот экрана драфта — приложение распознаёт вражеских героев и предлагает
контрпики, учитывая список любимых героев игрока на каждую позицию.

---

## Стек

| Компонент | Выбор | Причина |
|---|---|---|
| Язык | Go 1.26+ | основной стек разработчика |
| UI фреймворк | Wails |
| Распознавание скриншота | Template matching (pHash) | бесплатно, локально, надёжно — layout драфта фиксированный |
| Данные о героях | Stratz GraphQL API (`https://api.stratz.com/api/v1/graphql`) | богатая статистика матчапов, бесплатный доступ |
| Список героев | `data/heroes.json` (в git) + `go:embed` | версионируется, обновляется скриптом раз в патч |
| Пользовательские данные | SQLite `~/.d2pik/d2pik.db` | избранные, настройки, pHash-кеш |

---

## Ключевые возможности

### 1. Ввод через скриншот — template matching (без API)

Пользователь нажимает кнопку «Вставить скриншот» (или Alt+S) — приложение принимает
изображение из буфера обмена или через диалог открытия файла.

#### Почему template matching работает
Экран драфта Dota 2 имеет **фиксированный layout**: слоты героев всегда расположены
в одних и тех же относительных координатах (в % от размера экрана). Мы заранее знаем
где находится каждый слот радиант/дайр/баны → вырезаем регион → сравниваем с базой.

#### Алгоритм распознавания
1. **Нормализация** — скейлим скриншот до референсного разрешения (например 1920×1080)
2. **Кроп слотов** — вырезаем регионы по заранее известным координатам:
   - 5 слотов Radiant (герои команды)
   - 5 слотов Dire (враги)
   - до 12 слотов банов
3. **pHash-сравнение** — для каждого кропа считаем perceptual hash,
   сравниваем с предвычисленными хешами всех ~130 портретов героев
4. **Результат** — берём героя с минимальным хэш-расстоянием (порог ≤ 10)

#### База иконок героев
Список героев (`id`, `shortName`, `displayName`, `attr`, `roles`) хранится в `data/heroes.json`
внутри репозитория и встраивается в бинарник через `go:embed`.
Обновляется вручную командой `go run ./cmd/fetch-heroes` при выходе нового патча.

Портреты загружаются из CDN Dota 2 по запросу:
```
https://cdn.dota2.com/apps/dota2/images/heroes/{shortName}_sb.png
```
pHash предвычисляется при первом обращении и хранится в таблице `hero_hashes`
базы данных `~/.d2pik/d2pik.db`.

#### Библиотеки Go
- `github.com/corona10/goimagehash` — perceptual hash (dHash/pHash)
- `github.com/disintegration/imaging` — ресайз и кроп
- `golang.org/x/image` — чтение PNG/JPEG из буфера обмена

#### Координаты слотов (референс 1920×1080, уточнить эмпирически)
Конкретные пиксельные прямоугольники для каждого слота нужно замерить один раз
по скриншоту реального драфта и зафиксировать в конфиге `slots.json`.
При другом разрешении — масштабировать пропорционально.

### 2. Запрос контрпиков из Stratz API

#### Подтверждённая схема (проверено в GraphiQL)

**Структура типов:**
```
matchUp(heroId) → [HeroDryadType]
  HeroDryadType
    heroId         Short
    matchCountVs   Long
    matchCountWith Long
    vs:   [HeroStatsHeroDryadType]   ← матчапы против
    with: [HeroStatsHeroDryadType]   ← матчапы вместе

  HeroStatsHeroDryadType
    heroId1        Short   ← запрошенный герой (враг / союзник)
    heroId2        Short   ← кандидат на пик
    winsAverage    Decimal ← винрейт heroId1 в этом матчапе
    matchCount     Long
    bracketBasicIds RankBracketBasicEnum
```

**Основной запрос** — 5 врагов + 4 союзника одним HTTP-запросом через алиасы:
```graphql
{
  heroStats {
    e1: matchUp(heroId: <enemyId1>, take: 130) {
      heroId
      vs { heroId2 winsAverage matchCount }
    }
    e2: matchUp(heroId: <enemyId2>, take: 130) {
      heroId
      vs { heroId2 winsAverage matchCount }
    }
    # ... до e5

    a1: matchUp(heroId: <allyId1>, take: 130) {
      heroId
      with { heroId2 winsAverage matchCount }
    }
    # ... до a4
  }
}
```

> `take: 130` возвращает все доступные пары.
> `bracketBasicIds` не передаём — данные по всем рангам (в ответе поле = `UNCALIBRATED`).

**Получение справочника героев** (маппинг имя → ID, загружается один раз):
```graphql
{
  constants {
    heroes {
      id
      shortName
      displayName
    }
  }
}
```

#### Аутентификация
Stratz требует Bearer-токен. Токен бесплатный, получается на `https://stratz.com/api`.
Хранится в конфиге пользователя, передаётся заголовком:
```
Authorization: Bearer <token>
```

### 3. Логика ранжирования рекомендаций

#### Формула скора

```go
const (
    neutral       = 0.5
    counterWeight = 2.0
    synergyWeight = 1.0
)

finalScore := synergyWeight*(avgWith-neutral) + counterWeight*(neutral-avgVs)
```

Где:
- `avgVs` — среднее `winsAverage` по всем вражеским `vs`-записям для кандидата.
  `winsAverage` = винрейт **врага** в этом матчапе → чем ниже, тем лучше наш кандидат контрит
- `avgWith` — среднее `winsAverage` по всем союзным `with`-записям для кандидата.
  `winsAverage` = винрейт **союзника** вместе с кандидатом → чем выше, тем лучше синергия

Контрпику дан вдвое больший вес (`counterWeight = 2.0`) так как он сильнее влияет на исход.
Веса вынесены в константы для удобной настройки.

#### Алгоритм

```
1. Для каждого кандидата heroId2 вычислить finalScore
2. Отфильтровать уже выбранных/забаненных
3. Разделить на две группы:
   a. любимые герои (из профиля игрока)
   b. все остальные
4. Отсортировать каждую группу по finalScore ↓
5. Вернуть: [любимые] + [остальные]
```

#### Стадии драфта

Анализ работает на **любой стадии** — не только на ласт-пике. Пользователь может
вставить скриншот в любой момент Captain's Mode:

| Стадия | Типичная ситуация | Известно |
|---|---|---|
| Первый пик | 0–1 союзник, 2–3 врага | мало данных, вес контрпика важнее |
| Середина драфта | 2 союзника, 2–3 врага | сбалансированный анализ |
| Ласт-пик | 4 союзника, 4 врага | максимум данных |

Формула скора автоматически адаптируется: при `n` врагах `avgVs` считается по `n`
записям, при `m` союзниках `avgWith` — по `m`. Если союзников нет (`m = 0`),
синергетическая часть формулы обнуляется и остаётся только контрпик.

Технически это значит: `enemies` и `allies` в запросе могут содержать `null`-слоты —
Go-бэкенд должен фильтровать `nil` перед передачей в GraphQL-запрос.

### 4. Профиль игрока (любимые герои)

Хранится в таблице `favorites` базы `~/.d2pik/d2pik.db`:

```sql
-- position: 1 = керри, 5 = хард-саппорт
-- hero_id: числовой Stratz ID
favorites(position INTEGER, hero_id INTEGER, sort_order INTEGER)
```

В UI должен быть простой экран редактирования: выбрать позицию → добавить/удалить героев из списка.

---

## Архитектура (модули)

### UI фреймворк — Wails
Фронтенд на HTML/CSS/JS, бэкенд на Go. Wails прокидывает Go-методы в JS —
фронтенд вызывает их как обычные async-функции. Удобно для тёмной темы и
отображения портретов героев.

### Паттерн сборки — Composition Root
`cmd/main.go` — минимальная точка входа, только запускает приложение.
`internal/app/app.go` — собирает все зависимости, создаёт и связывает все пакеты.
Он же является Wails App struct и экспортирует методы для фронтенда.

### Структура

```
d2pik-helper/
├── cmd/
│   ├── main.go               # точка входа — только запуск
│   └── fetch-heroes/
│       └── main.go           # скрипт: Stratz → data/heroes.json
├── data/
│   └── heroes.json           # снапшот героев (committed, go:embed)
├── frontend/                  # Wails assetdir (HTML/CSS/JS)
│   ├── index.html             # точка входа фронтенда
│   └── static/
│       ├── css/
│       │   └── app.css        # все стили, CSS-переменные, 9 тем
│       ├── js/
│       │   ├── hero-data.js   # позиции, темы, scoreAgainst stub; HEROES грузятся через Wails
│       │   ├── i18n.js        # RU/EN строки, хук useT(), LangContext
│       │   ├── components.js  # ScoreBar, HeroPortrait (CDN img + fallback), иконки
│       │   ├── screen-draft.js
│       │   ├── screen-results.js
│       │   ├── screen-profile.js
│       │   ├── screen-settings.js
│       │   └── app.js         # шелл: TitleBar, Sidebar, роутинг экранов
│       └── assets/
├── internal/
│   ├── app/
│   │   └── app.go       # composition root + Wails App struct
│   ├── models/
│   │   └── hero.go      # типы: Hero, Draft, Recommendation
│   ├── service/
│   │   └── herostore/
│   │       └── store.go # загружает embedded heroes.json → []Hero
│   ├── repository/
│   │   ├── db.go        # открытие ~/.d2pik/d2pik.db, миграции
│   │   ├── profile.go   # GetFavorites / SetFavorites
│   │   ├── settings.go  # GetSetting / SetSetting
│   │   └── hashes.go    # GetHash / UpsertHash
│   ├── vision/
│   │   └── recognizer.go  # распознавание героев из скриншота (pHash)
│   ├── client/
│   │   └── stratz.go    # GraphQL-клиент Stratz API
│   └── core/
│       └── picker.go    # логика ранжирования + интеграция с профилем
├── go.mod
└── CLAUDE.md
```

---

## Конфигурация окружения

Настройки хранятся в таблице `settings` базы `~/.d2pik/d2pik.db`.
Через UI (экран Settings) или переменными окружения при первом запуске:

| Ключ / переменная | Описание |
|---|---|
| `stratz_token` / `STRATZ_TOKEN` | Bearer-токен Stratz API |
| `theme` | Выбранная тема оформления |

---

## Флоу работы (happy path)

```
[Пользователь] → Alt+S (хоткей) или кнопка «Скриншот»
      ↓
[vision.Recognizer] → Claude Vision API
      ↓ JSON {radiant, dire, banned}
[stratz.HeroStore] → маппинг имён → ID
      ↓
[stratz.Client] → GraphQL matchUp для каждого вражеского героя
      ↓ матрица матчапов
[picker.Ranker] → скоринг + приоритет любимых героев из профиля
      ↓
[ui.Result] → список рекомендаций сгруппирован по позициям:
              ★ Любимые подходящие
              ○ Остальные подходящие
```

---

## Что нужно изучить перед реализацией

1. **Introspection схемы Stratz** — выполнить в GraphiQL:
   ```graphql
   { __schema { queryType { fields { name description args { name type { name kind } } } } } }
   ```
   Найти поля, связанные с: `matchUp`, `compositionPick`, `teamVsTeam`, `laneOutcome`.

2. **Rate limits Stratz API** — уточнить лимиты бесплатного токена и реализовать кеширование
   матчапов на сессию (данные не меняются в рамках одного патча).

3. **Fyne vs. Walk** — если потребуется системный трей или глобальные хоткеи на Windows,
   возможно использование `github.com/getlantern/systray` + webview вместо Fyne.

---

## Возможные расширения (не в первой версии)

- Telegram-бот как альтернативный интерфейс (тот же `picker` и `stratz` пакеты)
- Автоматический захват скриншота по Alt+Tab (Windows API)
- Учёт патч-версии при кешировании
- Импорт любимых героев из профиля Stratz по Steam ID
