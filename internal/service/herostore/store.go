package herostore

import (
	"encoding/json"
	"fmt"
	"sync"

	"d2pik/internal/models"
)

type Store struct {
	mu      sync.RWMutex
	heroes  []models.Hero
	byID    map[int]*models.Hero
	byShort map[string]*models.Hero
}

func New(data []byte) (*Store, error) {
	var heroes []models.Hero
	if err := json.Unmarshal(data, &heroes); err != nil {
		return nil, fmt.Errorf("herostore: parse: %w", err)
	}
	s := &Store{}
	s.set(heroes)
	return s, nil
}

// Update replaces the hero list atomically. Safe for concurrent use.
func (s *Store) Update(heroes []models.Hero) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.set(heroes)
}

func (s *Store) set(heroes []models.Hero) {
	byID := make(map[int]*models.Hero, len(heroes))
	byShort := make(map[string]*models.Hero, len(heroes))
	for i := range heroes {
		h := &heroes[i]
		byID[h.ID] = h
		byShort[h.ShortName] = h
	}
	s.heroes = heroes
	s.byID = byID
	s.byShort = byShort
}

func (s *Store) GetHeroes() []models.Hero {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.heroes
}

func (s *Store) ByID(id int) *models.Hero {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.byID[id]
}

func (s *Store) ByShortName(name string) *models.Hero {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.byShort[name]
}
