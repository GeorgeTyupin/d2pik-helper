// fetch-heroes fetches the hero list from Stratz API and writes data/heroes.json.
// Run from the project root: go run ./cmd/fetch-heroes
package main

import (
	"encoding/json"
	"fmt"
	"os"

	"d2pik/internal/client"
)

func main() {
	token := os.Getenv("STRATZ_TOKEN")
	if token == "" {
		fmt.Fprintln(os.Stderr, "STRATZ_TOKEN env var is required")
		os.Exit(1)
	}

	c := client.New(token)
	heroes, err := c.FetchHeroes()
	if err != nil {
		fmt.Fprintf(os.Stderr, "fetch failed: %v\n", err)
		os.Exit(1)
	}

	const out = "data/heroes.json"
	if err := os.MkdirAll("data", 0o755); err != nil {
		fmt.Fprintf(os.Stderr, "mkdir: %v\n", err)
		os.Exit(1)
	}

	f, err := os.Create(out)
	if err != nil {
		fmt.Fprintf(os.Stderr, "create file: %v\n", err)
		os.Exit(1)
	}
	defer f.Close()

	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	if err := enc.Encode(heroes); err != nil {
		fmt.Fprintf(os.Stderr, "encode: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("wrote %d heroes to %s\n", len(heroes), out)
}
