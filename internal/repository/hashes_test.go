package repository

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTempDir(t *testing.T) {
	t.Helper()
	dataDirOverride = t.TempDir()
	t.Cleanup(func() { dataDirOverride = "" })
}

func TestGetHash(t *testing.T) {
	tests := []struct {
		name      string
		seed      map[int]uint64
		queryID   int
		wantHash  uint64
		wantFound bool
	}{
		{
			name:      "пустое хранилище",
			seed:      nil,
			queryID:   1,
			wantHash:  0,
			wantFound: false,
		},
		{
			name:      "герой есть",
			seed:      map[int]uint64{42: 0xDEADBEEF},
			queryID:   42,
			wantHash:  0xDEADBEEF,
			wantFound: true,
		},
		{
			name:      "другой герой не виден",
			seed:      map[int]uint64{1: 100, 2: 200},
			queryID:   999,
			wantHash:  0,
			wantFound: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setupTempDir(t)
			for id, h := range tt.seed {
				require.NoError(t, UpsertHash(id, h))
			}

			got, found, err := GetHash(tt.queryID)
			require.NoError(t, err)
			assert.Equal(t, tt.wantFound, found)
			assert.Equal(t, tt.wantHash, got)
		})
	}
}

func TestUpsertHash(t *testing.T) {
	tests := []struct {
		name     string
		ops      []struct{ id int; hash uint64 }
		queryID  int
		wantHash uint64
	}{
		{
			name:     "первая запись",
			ops:      []struct{ id int; hash uint64 }{{1, 111}},
			queryID:  1,
			wantHash: 111,
		},
		{
			name:     "перезапись одного героя",
			ops:      []struct{ id int; hash uint64 }{{7, 111}, {7, 999}},
			queryID:  7,
			wantHash: 999,
		},
		{
			name: "несколько героев изолированы",
			ops:  []struct{ id int; hash uint64 }{{1, 100}, {2, 200}},
			queryID: 2,
			wantHash: 200,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setupTempDir(t)
			for _, op := range tt.ops {
				require.NoError(t, UpsertHash(op.id, op.hash))
			}

			got, found, err := GetHash(tt.queryID)
			require.NoError(t, err)
			assert.True(t, found)
			assert.Equal(t, tt.wantHash, got)
		})
	}
}
