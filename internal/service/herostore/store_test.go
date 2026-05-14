package herostore

import (
	"testing"

	"d2pik/internal/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var validJSON = []byte(`[
	{"id":1,"shortName":"antimage","displayName":"Anti-Mage","attr":"agi","roles":["carry"]},
	{"id":2,"shortName":"axe","displayName":"Axe","attr":"str","roles":["offlane"]}
]`)

func TestNew(t *testing.T) {
	tests := []struct {
		name      string
		input     []byte
		wantErr   bool
		wantCount int
	}{
		{"valid JSON", validJSON, false, 2},
		{"empty array", []byte(`[]`), false, 0},
		{"invalid JSON", []byte(`not json`), true, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s, err := New(tt.input)
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			require.NoError(t, err)
			require.NotNil(t, s)
			assert.Len(t, s.GetHeroes(), tt.wantCount)
		})
	}
}

func TestByID(t *testing.T) {
	s, _ := New(validJSON)

	tests := []struct {
		name          string
		id            int
		wantNil       bool
		wantShortName string
	}{
		{"existing hero", 1, false, "antimage"},
		{"another existing hero", 2, false, "axe"},
		{"non-existing hero", 999, true, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := s.ByID(tt.id)
			if tt.wantNil {
				assert.Nil(t, h)
				return
			}
			require.NotNil(t, h)
			assert.Equal(t, tt.wantShortName, h.ShortName)
		})
	}
}

func TestByShortName(t *testing.T) {
	s, _ := New(validJSON)

	tests := []struct {
		name    string
		input   string
		wantNil bool
		wantID  int
	}{
		{"existing hero", "antimage", false, 1},
		{"another existing hero", "axe", false, 2},
		{"non-existing hero", "unknown_hero", true, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := s.ByShortName(tt.input)
			if tt.wantNil {
				assert.Nil(t, h)
				return
			}
			require.NotNil(t, h)
			assert.Equal(t, tt.wantID, h.ID)
		})
	}
}

func TestGetHeroes(t *testing.T) {
	s, _ := New(validJSON)
	heroes := s.GetHeroes()
	assert.Len(t, heroes, 2)
	assert.Equal(t, 1, heroes[0].ID)
	assert.Equal(t, 2, heroes[1].ID)
}

func TestUpdate(t *testing.T) {
	s, _ := New(validJSON)

	s.Update([]models.Hero{
		{ID: 10, ShortName: "invoker", DisplayName: "Invoker"},
	})

	assert.Len(t, s.GetHeroes(), 1)
	assert.Nil(t, s.ByID(1), "старый герой должен исчезнуть после Update")
	assert.NotNil(t, s.ByShortName("invoker"))
}
