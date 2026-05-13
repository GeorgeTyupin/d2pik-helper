package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

const odotaLaneRoles = "https://api.opendota.com/api/scenarios/laneRoles"

type laneRoleEntry struct {
	HeroID   int     `json:"hero_id"`
	LaneRole int     `json:"lane_role"`
	WinRate  float64 `json:"win_rate"`
}

// HeroLaneRoles maps hero ID → lane role IDs (1=carry, 2=mid, 3=offlane, 4=support).
type HeroLaneRoles map[int][]int

// FetchHeroLaneRoles fetches lane role assignments per hero from OpenDota.
// Makes 4 requests (one per lane role) to get only meaningfully played heroes per position.
// No authentication required.
func FetchHeroLaneRoles() (HeroLaneRoles, error) {
	result := make(HeroLaneRoles)
	for lane := 1; lane <= 4; lane++ {
		entries, err := fetchLaneRole(lane)
		if err != nil {
			return nil, fmt.Errorf("opendota: lane %d: %w", lane, err)
		}
		for _, e := range entries {
			result[e.HeroID] = append(result[e.HeroID], e.LaneRole)
		}
	}
	return result, nil
}

func fetchLaneRole(lane int) ([]laneRoleEntry, error) {
	req, err := http.NewRequest(http.MethodGet, odotaLaneRoles, nil)
	if err != nil {
		return nil, err
	}
	q := req.URL.Query()
	q.Set("lane_role", strconv.Itoa(lane))
	req.URL.RawQuery = q.Encode()
	req.Header.Set("User-Agent", "d2pik-helper/0.1")

	res, err := (&http.Client{}).Do(req)
	if err != nil {
		return nil, fmt.Errorf("request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status %d", res.StatusCode)
	}

	var buf bytes.Buffer
	if _, err = buf.ReadFrom(res.Body); err != nil {
		return nil, err
	}

	var entries []laneRoleEntry
	if err := json.Unmarshal(buf.Bytes(), &entries); err != nil {
		return nil, fmt.Errorf("decode: %w", err)
	}
	return entries, nil
}
