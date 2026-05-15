package repository

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

// dataDirOverride allows tests to redirect storage to a temp directory.
var dataDirOverride string

func dataDir() (string, error) {
	if dataDirOverride != "" {
		return dataDirOverride, os.MkdirAll(dataDirOverride, 0o755)
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	d := filepath.Join(home, ".d2pik")
	return d, os.MkdirAll(d, 0o755)
}

func loadJSON(name string, v any) error {
	d, err := dataDir()
	if err != nil {
		return err
	}
	data, err := os.ReadFile(filepath.Join(d, name))
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

func saveJSON(name string, v any) error {
	d, err := dataDir()
	if err != nil {
		return err
	}
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(d, name), data, 0o644)
}
