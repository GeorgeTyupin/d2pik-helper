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

const cacheFile = "heroes.json"

var laneRoleToPositions = map[int][]string{
	1: {"carry"},
	2: {"mid"},
	3: {"offlane"},
	4: {"softsupport", "hardsupport"},
}

func mergeRoles(heroes []models.Hero, laneRoles client.HeroLaneRoles, logger *slog.Logger) {
	for i := range heroes {
		lanes, ok := laneRoles[heroes[i].ID]
		if !ok {
			continue
		}
		seen := map[string]bool{}
		positions := make([]string, 0, 4)
		for _, lane := range lanes {
			for _, pos := range laneRoleToPositions[lane] {
				if !seen[pos] {
					seen[pos] = true
					positions = append(positions, pos)
				}
			}
		}
		heroes[i].Roles = positions
	}
	logger.Info("heroloader: merged lane roles from OpenDota")
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

// FetchAndUpdate fetches fresh heroes from Stratz + lane roles from OpenDota
// and calls onDone with the result. Designed to run in a goroutine after startup.
// If OpenDota is unavailable, the existing cache is preserved and onDone is not called.
func FetchAndUpdate(logger *slog.Logger, onDone func([]models.Hero)) {
	token, err := repository.GetSetting("stratz_token")
	if err != nil || token == "" {
		logger.Info("heroloader: no token, skipping background update")
		return
	}

	heroes, err := client.New(token).FetchHeroes()
	if err != nil {
		logger.Warn("heroloader: stratz fetch failed", "err", err)
		return
	}

	laneRoles, err := client.FetchHeroLaneRoles()
	if err != nil {
		logger.Warn("heroloader: opendota unavailable, keeping existing cache", "err", err)
		return
	}
	mergeRoles(heroes, laneRoles, logger)

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
