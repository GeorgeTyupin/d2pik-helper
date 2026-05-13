package repository

import "gorm.io/gorm"

type Favorite struct {
	Position  int `gorm:"primaryKey"`
	HeroID    int `gorm:"primaryKey"`
	SortOrder int `gorm:"default:0"`
}

func (db *DB) GetFavorites() (map[int][]int, error) {
	var rows []Favorite
	if err := db.orm.Order("position, sort_order").Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make(map[int][]int)
	for _, r := range rows {
		out[r.Position] = append(out[r.Position], r.HeroID)
	}
	return out, nil
}

func (db *DB) SetFavorites(position int, heroIDs []int) error {
	return db.orm.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("position = ?", position).Delete(&Favorite{}).Error; err != nil {
			return err
		}
		for i, id := range heroIDs {
			if err := tx.Create(&Favorite{Position: position, HeroID: id, SortOrder: i}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
