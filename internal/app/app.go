package app

import (
	"context"
	"fmt"
	"log/slog"

	"d2pik/internal/repository"
	"d2pik/internal/service/herostore"
	"d2pik/internal/service/profile"
	"d2pik/internal/service/settings"
)

// App is the main application struct, holding the services and shared resources.
type App struct {
	ctx    context.Context
	logger *slog.Logger
	db     *repository.DB

	// Services
	*herostore.Store
	*profile.ProfileService
	*settings.SettingsService
}

func New(logger *slog.Logger, heroesJSON []byte) (*App, error) {
	db, err := repository.Open()
	if err != nil {
		return nil, fmt.Errorf("app: open db: %w", err)
	}

	heroes, err := herostore.New(heroesJSON)
	if err != nil {
		return nil, fmt.Errorf("app: herostore: %w", err)
	}

	return &App{
		logger:          logger,
		db:              db,
		Store:           heroes,
		ProfileService:  profile.New(db),
		SettingsService: settings.New(db),
	}, nil
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.logger.Info("app started")
}

func (a *App) Shutdown(_ context.Context) {
	if err := a.db.Close(); err != nil {
		a.logger.Error("db close", "err", err)
	}
	a.logger.Info("app shutdown")
}
