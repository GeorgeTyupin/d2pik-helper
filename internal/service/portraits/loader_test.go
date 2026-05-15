package portraits

import (
	"bytes"
	"context"
	"image"
	"image/color"
	"image/png"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sync/atomic"
	"testing"

	"d2pik/internal/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// makePNG создаёт минимальный валидный PNG 1×1 для тестов.
func makePNG() []byte {
	img := image.NewRGBA(image.Rect(0, 0, 1, 1))
	img.Set(0, 0, color.White)
	var buf bytes.Buffer
	_ = png.Encode(&buf, img)
	return buf.Bytes()
}

// mapHashRepo — in-memory реализация HashRepo для тестов.
type mapHashRepo struct {
	m map[int]uint64
}

func newMapHashRepo() *mapHashRepo { return &mapHashRepo{m: make(map[int]uint64)} }

func (r *mapHashRepo) GetHash(heroID int) (uint64, bool, error) {
	v, ok := r.m[heroID]
	return v, ok, nil
}

func (r *mapHashRepo) UpsertHash(heroID int, hash uint64) error {
	r.m[heroID] = hash
	return nil
}

// cdnServer поднимает тестовый HTTP-сервер, отдающий PNG на /apps/dota2/images/heroes/*.
// Возвращает сервер и указатель на счётчик запросов.
func cdnServer(t *testing.T) (*httptest.Server, *atomic.Int32) {
	t.Helper()
	var count atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		count.Add(1)
		w.Header().Set("Content-Type", "image/png")
		_, _ = w.Write(makePNG())
	}))
	t.Cleanup(srv.Close)
	return srv, &count
}

func newTestLoader(t *testing.T, srv *httptest.Server, repo HashRepo) *Loader {
	t.Helper()
	dir := t.TempDir()
	return &Loader{
		portraitsDir: dir,
		client:       srv.Client(),
		hashRepo:     repo,
		baseURL:      srv.URL,
	}
}

// --- Download: отдельные тесты на разные аспекты поведения ---

func TestDownload_FetchesFromCDN(t *testing.T) {
	srv, count := cdnServer(t)
	hero := models.Hero{ID: 1, ShortName: "antimage"}
	l := newTestLoader(t, srv, newMapHashRepo())

	require.NoError(t, l.Download(context.Background(), hero))

	assert.Equal(t, int32(1), count.Load(), "должен быть ровно 1 HTTP-запрос")
	_, err := os.Stat(filepath.Join(l.portraitsDir, "antimage_sb.png"))
	assert.NoError(t, err, "файл должен быть создан")
}

func TestDownload_UsesCache(t *testing.T) {
	srv, count := cdnServer(t)
	hero := models.Hero{ID: 1, ShortName: "axe"}
	repo := newMapHashRepo()
	l := newTestLoader(t, srv, repo)

	require.NoError(t, l.Download(context.Background(), hero))
	require.NoError(t, l.Download(context.Background(), hero))

	assert.Equal(t, int32(1), count.Load(), "второй вызов не должен идти в сеть")
}

func TestDownload_ComputesAndCachesHash(t *testing.T) {
	srv, _ := cdnServer(t)
	hero := models.Hero{ID: 42, ShortName: "lina"}
	repo := newMapHashRepo()
	l := newTestLoader(t, srv, repo)

	require.NoError(t, l.Download(context.Background(), hero))

	_, found, err := repo.GetHash(42)
	require.NoError(t, err)
	assert.True(t, found, "hash должен быть закеширован после скачивания")
}

var allHeroes = []models.Hero{
	{ID: 1, ShortName: "antimage"},
	{ID: 2, ShortName: "axe"},
	{ID: 3, ShortName: "lina"},
}

func TestDownloadAll_DownloadsAll(t *testing.T) {
	srv, count := cdnServer(t)
	l := newTestLoader(t, srv, newMapHashRepo())

	require.NoError(t, l.DownloadAll(context.Background(), allHeroes))

	assert.Equal(t, int32(3), count.Load())
	for _, h := range allHeroes {
		_, err := os.Stat(filepath.Join(l.portraitsDir, h.ShortName+"_sb.png"))
		assert.NoError(t, err, "файл %s должен существовать", h.ShortName)
	}
}

func TestDownloadAll_SkipsCached(t *testing.T) {
	srv, count := cdnServer(t)
	l := newTestLoader(t, srv, newMapHashRepo())

	require.NoError(t, l.Download(context.Background(), allHeroes[0]))
	count.Store(0)

	require.NoError(t, l.DownloadAll(context.Background(), allHeroes))

	assert.Equal(t, int32(2), count.Load(), "уже закешированный герой не должен скачиваться повторно")
}

// --- ListenAndServe ---

func TestListenAndServe_ServesFile(t *testing.T) {
	pngBytes := makePNG()
	srv, _ := cdnServer(t)
	l := newTestLoader(t, srv, newMapHashRepo())

	err := os.WriteFile(filepath.Join(l.portraitsDir, "antimage_sb.png"), pngBytes, 0o644)
	require.NoError(t, err)

	base, err := l.ListenAndServe()
	require.NoError(t, err)

	resp, err := http.Get(base + "/antimage_sb.png")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestListenAndServe_NotFound(t *testing.T) {
	srv, _ := cdnServer(t)
	l := newTestLoader(t, srv, newMapHashRepo())

	base, err := l.ListenAndServe()
	require.NoError(t, err)

	resp, err := http.Get(base + "/unknown_sb.png")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}
