package main

import (
	"crypto/tls"
	"embed"
	"io/fs"
	"log"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"d2pik/internal/app"
	"d2pik/internal/repository"
	"d2pik/internal/service/heroloader"
	"d2pik/internal/service/portraits"
)

//go:embed all:frontend
var assets embed.FS

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	sub, err := fs.Sub(assets, "frontend")
	if err != nil {
		log.Fatal(err)
	}

	home, err := os.UserHomeDir()
	if err != nil {
		log.Fatalf("home dir: %v", err)
	}
	portraitsDir := filepath.Join(home, ".d2pik", "portraits")

	cdnClient := &http.Client{Transport: &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, //nolint:gosec
	}}
	portraitLoader := portraits.New(portraitsDir, cdnClient, repository.HashRepo{})

	portraitsBase, err := portraitLoader.ListenAndServe()
	if err != nil {
		log.Fatalf("portraits server: %v", err)
	}

	heroesJSON := heroloader.LoadFromCache(logger)

	a, err := app.New(logger, heroesJSON, portraitLoader, portraitsBase)
	if err != nil {
		log.Fatalf("app: %v", err)
	}

	err = wails.Run(&options.App{
		Title:     "d2pik",
		Width:     1200,
		Height:    780,
		MinWidth:  900,
		MinHeight: 600,
		Frameless: true,
		AssetServer: &assetserver.Options{
			Assets: sub,
		},
		OnStartup:  a.Startup,
		OnShutdown: a.Shutdown,
		Bind:       []interface{}{a},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
