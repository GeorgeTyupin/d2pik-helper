//go:build integration

package portraits

// Запуск: go test -tags=integration ./internal/service/portraits/

import (
	"context"
	"crypto/tls"
	"net/http"
	"os"
	"path/filepath"
	"testing"

	"d2pik/internal/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDownloadIntegration(t *testing.T) {
	dir := t.TempDir()
	repo := newMapHashRepo()
	// cdn.dota2.com обслуживается Akamai; сертификат выдан на *.akamaized.net,
	// поэтому hostname verification не проходит — отключаем его явно.
	cdnClient := &http.Client{Transport: &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, //nolint:gosec
	}}
	l := New(dir, cdnClient, repo)

	hero := models.Hero{ID: 1, ShortName: "antimage"}

	require.NoError(t, l.Download(context.Background(), hero))

	info, err := os.Stat(filepath.Join(dir, "antimage_sb.png"))
	require.NoError(t, err, "файл портрета должен быть скачан")
	assert.Greater(t, info.Size(), int64(0), "файл не должен быть пустым")

	hash, found, err := repo.GetHash(1)
	require.NoError(t, err)
	assert.True(t, found, "pHash должен быть закеширован")
	assert.NotZero(t, hash, "pHash не должен быть нулём")
}
