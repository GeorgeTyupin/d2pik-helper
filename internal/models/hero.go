package models

// Hero represents a Dota 2 hero as stored in data/heroes.json.
type Hero struct {
	ID          int      `json:"id"`
	ShortName   string   `json:"shortName"`
	DisplayName string   `json:"displayName"`
	Attr        string   `json:"attr"`  // "agi" | "str" | "int" | "all"
	Roles       []string `json:"roles"` // ["carry", "mid", ...]
}

// Draft holds the recognized heroes from a screenshot.
type Draft struct {
	Radiant [5]*Hero
	Dire    [5]*Hero
	Banned  []*Hero
}

// Recommendation is a single hero suggestion with its score.
type Recommendation struct {
	Hero      *Hero
	Score     float64
	IsFavorite bool
}
