package heroloader

import (
	"encoding/json"
	"errors"
	"log/slog"
	"os"
	"path/filepath"

	"d2pik/internal/client"
	"d2pik/internal/models"
	"d2pik/internal/repository"
)

const (
	cacheFile         = "heroes.json"
	positionThreshold = 0.10
)

var stratzPositionToRole = map[string]string{
	"POSITION_1": "carry",
	"POSITION_2": "mid",
	"POSITION_3": "offlane",
	"POSITION_4": "softsupport",
	"POSITION_5": "hardsupport",
}

func mergeRoles(heroes []models.Hero, posStats client.HeroPositionStats, logger *slog.Logger) {
	order := []string{"POSITION_1", "POSITION_2", "POSITION_3", "POSITION_4", "POSITION_5"}
	for i := range heroes {
		byPos := posStats[heroes[i].ID]
		var total int64
		for _, c := range byPos {
			total += c
		}
		if total == 0 {
			continue
		}
		roles := make([]string, 0, 3)
		for _, pos := range order {
			if float64(byPos[pos])/float64(total) >= positionThreshold {
				roles = append(roles, stratzPositionToRole[pos])
			}
		}
		heroes[i].Roles = roles
	}
	logger.Info("heroloader: merged roles from Stratz position stats")
}

// LoadFromCache reads heroes from ~/.d2pik/heroes.json.
// Fast — no network calls. Used at startup to not block the UI.
func LoadFromCache(logger *slog.Logger) []byte {
	data, err := readCache()
	if err == nil && len(data) > 2 {
		logger.Info("heroloader: loaded from cache", "count", countJSON(data))
		return data
	}
	logger.Info("heroloader: no cache, starting with empty hero list")
	return []byte("[]")
}

// FetchAndUpdate fetches fresh heroes + position stats from Stratz in one request
// and calls onDone with the result. Designed to run in a goroutine after startup.
func FetchAndUpdate(logger *slog.Logger, onDone func([]models.Hero)) {
	token, err := repository.GetSetting("stratz_token")
	if err != nil || token == "" {
		logger.Info("heroloader: no token, skipping background update")
		return
	}

	heroes, posStats, err := client.New(token).FetchHeroes()
	if err != nil {
		logger.Warn("heroloader: stratz fetch failed", "err", err)
		return
	}

	mergeRoles(heroes, posStats, logger)

	data, err := json.MarshalIndent(heroes, "", "  ")
	if err != nil {
		return
	}

	if werr := writeCache(data); werr != nil {
		logger.Warn("heroloader: cache write failed", "err", werr)
	}

	logger.Info("heroloader: background update complete", "count", len(heroes))
	if onDone != nil {
		onDone(heroes)
	}
}

func readCache() ([]byte, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(filepath.Join(home, ".d2pik", cacheFile))
	if errors.Is(err, os.ErrNotExist) {
		return nil, err
	}
	return data, err
}

func writeCache(data []byte) error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	dir := filepath.Join(home, ".d2pik")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, cacheFile), data, 0o644)
}

func countJSON(data []byte) int {
	var heroes []models.Hero
	if err := json.Unmarshal(data, &heroes); err != nil {
		return 0
	}
	return len(heroes)
}
