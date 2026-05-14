package client

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeDoer struct {
	statusCode int
	body       string
	err        error
}

func (f *fakeDoer) Do(_ *http.Request) (*http.Response, error) {
	if f.err != nil {
		return nil, f.err
	}
	return &http.Response{
		StatusCode: f.statusCode,
		Body:       io.NopCloser(bytes.NewBufferString(f.body)),
	}, nil
}

const successBody = `{
	"data": {
		"constants": {
			"heroes": [
				{"id": 1, "shortName": "antimage", "displayName": "Anti-Mage"},
				{"id": 2, "shortName": "axe", "displayName": "Axe"},
				{"id": 0, "shortName": "", "displayName": "should be filtered"}
			]
		},
		"heroStats": {
			"stats": [
				{"heroId": 1, "position": "POSITION_1", "matchCount": 50000},
				{"heroId": 2, "position": "POSITION_3", "matchCount": 30000}
			]
		}
	}
}`

func TestFetchHeroes_success(t *testing.T) {
	c := NewWithClient("token", &fakeDoer{statusCode: http.StatusOK, body: successBody})
	heroes, posStats, err := c.FetchHeroes()

	require.NoError(t, err)
	assert.Len(t, heroes, 2, "герой с id=0 и пустым shortName должен быть отфильтрован")
	assert.Equal(t, 1, heroes[0].ID)
	assert.Equal(t, "antimage", heroes[0].ShortName)
	assert.Equal(t, []string{}, heroes[0].Roles)

	assert.EqualValues(t, 50000, posStats[1]["POSITION_1"])
	assert.EqualValues(t, 30000, posStats[2]["POSITION_3"])
}

func TestFetchHeroes_filterEmpty(t *testing.T) {
	body := `{"data":{"constants":{"heroes":[
		{"id":0,"shortName":"zero","displayName":"Zero ID"},
		{"id":5,"shortName":"","displayName":"Empty ShortName"},
		{"id":3,"shortName":"valid","displayName":"Valid"}
	]},"heroStats":{"stats":[]}}}`

	c := NewWithClient("token", &fakeDoer{statusCode: http.StatusOK, body: body})
	heroes, _, err := c.FetchHeroes()

	require.NoError(t, err)
	assert.Len(t, heroes, 1)
	assert.Equal(t, "valid", heroes[0].ShortName)
}

func TestFetchHeroes_errors(t *testing.T) {
	tests := []struct {
		name        string
		doer        *fakeDoer
		errContains string
	}{
		{
			name:        "non-200 status",
			doer:        &fakeDoer{statusCode: http.StatusUnauthorized, body: ``},
			errContains: "401",
		},
		{
			name:        "invalid JSON body",
			doer:        &fakeDoer{statusCode: http.StatusOK, body: `not json`},
			errContains: "",
		},
		{
			name:        "network error",
			doer:        &fakeDoer{err: fmt.Errorf("connection refused")},
			errContains: "connection refused",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, _, err := NewWithClient("token", tt.doer).FetchHeroes()
			require.Error(t, err)
			if tt.errContains != "" {
				assert.ErrorContains(t, err, tt.errContains)
			}
		})
	}
}
