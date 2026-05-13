package herostore

import (
	"encoding/json"
	"fmt"

	"d2pik/internal/models"
)

// Store holds the hero list loaded from the embedded heroes.json.
type Store struct {
	heroes  []models.Hero
	byID    map[int]*models.Hero
	byShort map[string]*models.Hero
}

// New parses the embedded heroes.json bytes.
func New(data []byte) (*Store, error) {
	var heroes []models.Hero
	if err := json.Unmarshal(data, &heroes); err != nil {
		return nil, fmt.Errorf("herostore: parse: %w", err)
	}

	s := &Store{
		heroes:  heroes,
		byID:    make(map[int]*models.Hero, len(heroes)),
		byShort: make(map[string]*models.Hero, len(heroes)),
	}
	for i := range s.heroes {
		h := &s.heroes[i]
		s.byID[h.ID] = h
		s.byShort[h.ShortName] = h
	}
	return s, nil
}

// GetHeroes is the Wails-bound method — returns the full hero list.
func (s *Store) GetHeroes() []models.Hero              { return s.heroes }
func (s *Store) ByID(id int) *models.Hero              { return s.byID[id] }
func (s *Store) ByShortName(name string) *models.Hero  { return s.byShort[name] }
