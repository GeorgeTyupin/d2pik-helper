package repository

func GetFavorites() (map[int][]int, error) {
	var favs map[int][]int
	if err := loadJSON("favorites.json", &favs); err != nil {
		return nil, err
	}
	if favs == nil {
		favs = make(map[int][]int)
	}
	return favs, nil
}

func SetFavorites(position int, heroIDs []int) error {
	favs, err := GetFavorites()
	if err != nil {
		return err
	}
	favs[position] = heroIDs
	return saveJSON("favorites.json", favs)
}
