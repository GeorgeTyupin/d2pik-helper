package repository

func GetSetting(key string) (string, error) {
	var settings map[string]string
	if err := loadJSON("settings.json", &settings); err != nil {
		return "", err
	}
	return settings[key], nil
}

func SetSetting(key, value string) error {
	var settings map[string]string
	if err := loadJSON("settings.json", &settings); err != nil {
		return err
	}
	if settings == nil {
		settings = make(map[string]string)
	}
	settings[key] = value
	return saveJSON("settings.json", settings)
}
