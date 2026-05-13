package repository

type Setting struct {
	Key   string `gorm:"primaryKey"`
	Value string
}

func (db *DB) GetSetting(key string) (string, error) {
	var s Setting
	if err := db.orm.First(&s, "key = ?", key).Error; err != nil {
		return "", nil
	}
	return s.Value, nil
}

func (db *DB) SetSetting(key, value string) error {
	return db.orm.Save(&Setting{Key: key, Value: value}).Error
}
