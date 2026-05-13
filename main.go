package main

import (
	"embed"
	"io/fs"
	"log"
	"log/slog"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"d2pik/internal/app"
)

//go:embed all:frontend
var assets embed.FS

//go:embed data/heroes.json
var heroesJSON []byte

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	sub, err := fs.Sub(assets, "frontend")
	if err != nil {
		log.Fatal(err)
	}

	a, err := app.New(logger, heroesJSON)
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
