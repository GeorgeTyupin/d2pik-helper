package settings

import "d2pik/internal/repository"

type SettingsService struct{}

func New() *SettingsService { return &SettingsService{} }

func (s *SettingsService) GetSetting(key string) (string, error) {
	return repository.GetSetting(key)
}

func (s *SettingsService) SetSetting(key, value string) error {
	return repository.SetSetting(key, value)
}
