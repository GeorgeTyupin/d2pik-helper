package app

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"d2pik/internal/models"
	"d2pik/internal/service/heroloader"
	"d2pik/internal/service/herostore"
	"d2pik/internal/service/profile"
	"d2pik/internal/service/settings"
)

type App struct {
	ctx    context.Context
	logger *slog.Logger

	*herostore.Store
	*profile.ProfileService
	*settings.SettingsService
}

func New(logger *slog.Logger, heroesJSON []byte) (*App, error) {
	heroes, err := herostore.New(heroesJSON)
	if err != nil {
		return nil, fmt.Errorf("app: herostore: %w", err)
	}
	return &App{
		logger:          logger,
		Store:           heroes,
		ProfileService:  profile.New(),
		SettingsService: settings.New(),
	}, nil
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.logger.Info("app started")

	go heroloader.FetchAndUpdate(a.logger, func(heroes []models.Hero) {
		a.Store.Update(heroes)
		runtime.EventsEmit(ctx, "heroes:updated")
	})
}

func (a *App) Shutdown(_ context.Context) {
	a.logger.Info("app shutdown")
}
