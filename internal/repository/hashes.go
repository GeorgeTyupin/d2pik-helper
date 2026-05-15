package repository

import "strconv"

// HashRepo реализует portraits.HashRepo поверх JSON-хранилища.
type HashRepo struct{}

func (HashRepo) GetHash(heroID int) (uint64, bool, error)  { return GetHash(heroID) }
func (HashRepo) UpsertHash(heroID int, hash uint64) error  { return UpsertHash(heroID, hash) }

func GetHash(heroID int) (uint64, bool, error) {
	var m map[string]uint64
	if err := loadJSON("hashes.json", &m); err != nil {
		return 0, false, err
	}
	v, ok := m[strconv.Itoa(heroID)]
	return v, ok, nil
}

func UpsertHash(heroID int, hash uint64) error {
	var m map[string]uint64
	if err := loadJSON("hashes.json", &m); err != nil {
		return err
	}
	if m == nil {
		m = make(map[string]uint64)
	}
	m[strconv.Itoa(heroID)] = hash
	return saveJSON("hashes.json", m)
}
