package repository

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DB struct {
	orm *gorm.DB
}

func Open() (*DB, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("repository: home dir: %w", err)
	}
	dir := filepath.Join(home, ".d2pik")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("repository: mkdir: %w", err)
	}

	g, err := gorm.Open(sqlite.Open(filepath.Join(dir, "d2pik.db")), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, fmt.Errorf("repository: open db: %w", err)
	}
	if err := g.AutoMigrate(&Favorite{}, &Setting{}, &HeroHash{}); err != nil {
		return nil, fmt.Errorf("repository: migrate: %w", err)
	}
	return &DB{orm: g}, nil
}

func (db *DB) Close() error {
	sql, err := db.orm.DB()
	if err != nil {
		return err
	}
	return sql.Close()
}
