package app

import (
	"context"
	"log/slog"
)

// App is the composition root and the Wails application struct.
// Public methods are bound to the frontend JS via Wails.
type App struct {
	ctx    context.Context
	logger *slog.Logger
}

func New(logger *slog.Logger) *App {
	return &App{logger: logger}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.logger.Info("app started")
}

func (a *App) Shutdown(_ context.Context) {
	a.logger.Info("app shutdown")
}
