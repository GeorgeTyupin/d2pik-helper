package app

import (
	"context"
	"fmt"
	"log/slog"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"d2pik/internal/models"
	"d2pik/internal/service/heroloader"
	"d2pik/internal/service/herostore"
	"d2pik/internal/service/portraits"
	"d2pik/internal/service/profile"
	"d2pik/internal/service/settings"
)

type App struct {
	ctx             context.Context
	logger          *slog.Logger
	wg              *sync.WaitGroup
	portraitsBase   string

	*herostore.Store
	*profile.ProfileService
	*settings.SettingsService
	PortraitLoader *portraits.Loader
}

func New(logger *slog.Logger, heroesJSON []byte, portraitLoader *portraits.Loader, portraitsBase string) (*App, error) {
	heroes, err := herostore.New(heroesJSON)
	if err != nil {
		return nil, fmt.Errorf("app: herostore: %w", err)
	}
	return &App{
		logger:          logger,
		wg:              &sync.WaitGroup{},
		portraitsBase:   portraitsBase,
		Store:           heroes,
		ProfileService:  profile.New(),
		SettingsService: settings.New(),
		PortraitLoader:  portraitLoader,
	}, nil
}

// PortraitsBaseURL возвращает базовый URL локального сервера портретов.
func (a *App) PortraitsBaseURL() string {
	return a.portraitsBase
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.logger.Info("app started")

	a.wg.Go(func() {
		if err := a.PortraitLoader.DownloadAll(ctx, a.Store.GetHeroes()); err != nil {
			a.logger.Warn("portrait download failed", "err", err)
		}
	})

	a.wg.Go(func() {
		heroloader.FetchAndUpdate(a.logger, func(heroes []models.Hero) {
			a.Store.Update(heroes)
			runtime.EventsEmit(ctx, "heroes:updated")
		})
	})
}

func (a *App) Shutdown(_ context.Context) {
	a.wg.Wait()
	a.logger.Info("app shutdown")
}
