package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"d2pik/internal/models"
)

const stratzGraphQL = "https://api.stratz.com/graphql"

type heroesResponse struct {
	Data struct {
		Constants struct {
			Heroes []heroDTO `json:"heroes"`
		} `json:"constants"`
	} `json:"data"`
}

type heroDTO struct {
	ID          int    `json:"id"`
	ShortName   string `json:"shortName"`
	DisplayName string `json:"displayName"`
}

type Client struct {
	token      string
	httpClient *http.Client
}

func New(token string) *Client {
	return &Client{token: token, httpClient: &http.Client{}}
}

// FetchHeroes fetches the full hero list from Stratz constants.
func (c *Client) FetchHeroes() ([]models.Hero, error) {
	const query = `{ constants { heroes { id shortName displayName } } }`

	body, err := c.query(query)
	if err != nil {
		return nil, err
	}

	var resp heroesResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("stratz: decode heroes: %w", err)
	}

	heroes := make([]models.Hero, 0, len(resp.Data.Constants.Heroes))
	for _, h := range resp.Data.Constants.Heroes {
		if h.ID == 0 || h.ShortName == "" {
			continue
		}
		heroes = append(heroes, models.Hero{
			ID:          h.ID,
			ShortName:   h.ShortName,
			DisplayName: h.DisplayName,
			Roles:       []string{},
		})
	}
	return heroes, nil
}

func (c *Client) query(q string) ([]byte, error) {
	payload, _ := json.Marshal(map[string]string{"query": q})
	req, err := http.NewRequest(http.MethodPost, stratzGraphQL, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("User-Agent", "d2pik-helper/0.1")

	res, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("stratz: request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("stratz: status %d", res.StatusCode)
	}

	var buf bytes.Buffer
	_, err = buf.ReadFrom(res.Body)
	return buf.Bytes(), err
}
