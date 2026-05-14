//go:build integration

package client

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Запуск: go test -tags=integration -run TestFetchHeroesIntegration ./internal/client/
// Требует: файл ~/.d2pik/settings.json с полем "stratz_token".
func TestFetchHeroesIntegration(t *testing.T) {
	token := readTokenFromSettings(t)

	heroes, posStats, err := New(token).FetchHeroes()

	require.NoError(t, err)
	assert.GreaterOrEqual(t, len(heroes), 100, "Stratz должен вернуть ≥100 героев")

	// Anti-Mage (id=1) всегда существует и является carry
	var found bool
	for _, h := range heroes {
		if h.ID == 1 {
			assert.Equal(t, "antimage", h.ShortName)
			found = true
			break
		}
	}
	require.True(t, found, "Anti-Mage (id=1) должен присутствовать в ответе")

	stats, ok := posStats[1]
	assert.True(t, ok, "posStats должны содержать данные для Anti-Mage")
	assert.Greater(t, stats["POSITION_1"], int64(0), "Anti-Mage должен иметь матчи на POSITION_1")

	assert.GreaterOrEqual(t, len(posStats), 100, "posStats должны содержать данные для ≥100 героев")
}

func readTokenFromSettings(t *testing.T) string {
	t.Helper()
	home, err := os.UserHomeDir()
	require.NoError(t, err)

	data, err := os.ReadFile(filepath.Join(home, ".d2pik", "settings.json"))
	if os.IsNotExist(err) {
		t.Skip("~/.d2pik/settings.json не найден, пропускаем интеграционный тест")
	}
	require.NoError(t, err)

	var settings struct {
		StratzToken string `json:"stratz_token"`
	}
	require.NoError(t, json.Unmarshal(data, &settings))

	if settings.StratzToken == "" {
		t.Skip("stratz_token не задан в ~/.d2pik/settings.json")
	}
	return settings.StratzToken
}
