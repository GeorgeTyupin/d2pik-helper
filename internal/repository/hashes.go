package repository

type HeroHash struct {
	HeroID int    `gorm:"primaryKey"`
	PHash  string `gorm:"not null"`
}

func (db *DB) GetHash(heroID int) (string, error) {
	var h HeroHash
	if err := db.orm.First(&h, "hero_id = ?", heroID).Error; err != nil {
		return "", nil
	}
	return h.PHash, nil
}

func (db *DB) UpsertHash(heroID int, phash string) error {
	return db.orm.Save(&HeroHash{HeroID: heroID, PHash: phash}).Error
}
