package portraits

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"image/png"
	"io"
	"log/slog"
	"net"
	"net/http"
	"os"
	"path/filepath"

	"d2pik/internal/models"

	"github.com/corona10/goimagehash"
)

type HashRepo interface {
	GetHash(heroID int) (uint64, bool, error)
	UpsertHash(heroID int, hash uint64) error
}

type Loader struct {
	portraitsDir string
	client       *http.Client
	hashRepo     HashRepo
	baseURL      string
}

func New(portraitsDir string, client *http.Client, hashRepo HashRepo) *Loader {
	return &Loader{
		portraitsDir: portraitsDir,
		client:       client,
		hashRepo:     hashRepo,
		baseURL:      "https://cdn.dota2.com",
	}
}

// Download скачивает портрет героя, сохраняет файл и кеширует pHash.
// Если файл и hash уже есть — пропускает.
func (l *Loader) Download(ctx context.Context, hero models.Hero) error {
	filePath := filepath.Join(l.portraitsDir, hero.ShortName+"_full.png")

	_, hashFound, err := l.hashRepo.GetHash(hero.ID)
	if err != nil {
		return err
	}
	if hashFound {
		if _, err := os.Stat(filePath); err == nil {
			return nil
		}
	}

	url := fmt.Sprintf("%s/apps/dota2/images/heroes/%s_full.png", l.baseURL, hero.ShortName)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	resp, err := l.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("portraits: CDN returned %d for %s", resp.StatusCode, hero.ShortName)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	img, err := png.Decode(bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("portraits: decode %s: %w", hero.ShortName, err)
	}

	if err := os.MkdirAll(l.portraitsDir, 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(filePath, body, 0o644); err != nil {
		return err
	}

	hash, err := goimagehash.PerceptionHash(img)
	if err != nil {
		return fmt.Errorf("portraits: phash %s: %w", hero.ShortName, err)
	}
	return l.hashRepo.UpsertHash(hero.ID, hash.GetHash())
}

// DownloadAll скачивает портреты всех переданных героев.
// Ошибки отдельных героев (404 и т.п.) логируются и пропускаются.
// Возвращает ошибку только при отмене контекста.
func (l *Loader) DownloadAll(ctx context.Context, heroes []models.Hero) error {
	for _, h := range heroes {
		if err := l.Download(ctx, h); err != nil {
			if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
				return err
			}
			slog.Warn("portrait: skipped", "hero", h.ShortName, "err", err)
		}
	}
	return nil
}

// ListenAndServe запускает HTTP-сервер для раздачи портретов и возвращает его базовый URL.
func (l *Loader) ListenAndServe() (string, error) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return "", err
	}
	go http.Serve(ln, http.FileServer(http.Dir(l.portraitsDir))) //nolint:errcheck
	return fmt.Sprintf("http://127.0.0.1:%d", ln.Addr().(*net.TCPAddr).Port), nil
}
