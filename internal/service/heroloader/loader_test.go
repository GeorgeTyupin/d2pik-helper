package heroloader

import (
	"io"
	"log/slog"
	"testing"

	"d2pik/internal/client"
	"d2pik/internal/models"

	"github.com/stretchr/testify/assert"
)

var discardLogger = slog.New(slog.NewTextHandler(io.Discard, nil))

func TestCountJSON(t *testing.T) {
	tests := []struct {
		name  string
		input []byte
		want  int
	}{
		{"valid array", []byte(`[{"id":1},{"id":2},{"id":3}]`), 3},
		{"empty array", []byte(`[]`), 0},
		{"invalid JSON", []byte(`not json`), 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, countJSON(tt.input))
		})
	}
}

func TestMergeRoles(t *testing.T) {
	tests := []struct {
		name          string
		hero          models.Hero
		posStats      client.HeroPositionStats
		wantContains  []string
		wantMissing   []string
	}{
		{
			name: "роль назначается при >=10%",
			hero: models.Hero{ID: 1, ShortName: "antimage"},
			posStats: client.HeroPositionStats{
				1: {"POSITION_1": 9100, "POSITION_2": 900}, // 91% и 9%
			},
			wantContains: []string{"carry"},
			wantMissing:  []string{"mid"},
		},
		{
			name: "роль не назначается при <10%",
			hero: models.Hero{ID: 2, ShortName: "axe"},
			posStats: client.HeroPositionStats{
				2: {"POSITION_3": 9200, "POSITION_5": 800}, // 92% и 8%
			},
			wantContains: []string{"offlane"},
			wantMissing:  []string{"hardsupport"},
		},
		{
			name:          "нулевой total — Roles не меняется",
			hero:          models.Hero{ID: 3, ShortName: "lion", Roles: []string{"existing"}},
			posStats:      client.HeroPositionStats{3: {}},
			wantContains:  []string{"existing"},
			wantMissing:   nil,
		},
		{
			name:          "герой отсутствует в stats — Roles не меняется",
			hero:          models.Hero{ID: 99, ShortName: "unknown", Roles: []string{"carry"}},
			posStats:      client.HeroPositionStats{},
			wantContains:  []string{"carry"},
			wantMissing:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			heroes := []models.Hero{tt.hero}
			mergeRoles(heroes, tt.posStats, discardLogger)

			for _, role := range tt.wantContains {
				assert.Contains(t, heroes[0].Roles, role)
			}
			for _, role := range tt.wantMissing {
				assert.NotContains(t, heroes[0].Roles, role)
			}
		})
	}
}
