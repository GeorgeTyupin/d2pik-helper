package settings

import "d2pik/internal/repository"

type SettingsService struct {
	db *repository.DB
}

func New(db *repository.DB) *SettingsService {
	return &SettingsService{db: db}
}

func (s *SettingsService) GetSetting(key string) (string, error) {
	return s.db.GetSetting(key)
}

func (s *SettingsService) SetSetting(key, value string) error {
	return s.db.SetSetting(key, value)
}
