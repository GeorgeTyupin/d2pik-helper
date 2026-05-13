package profile

import "d2pik/internal/repository"

type ProfileService struct {
	db *repository.DB
}

func New(db *repository.DB) *ProfileService {
	return &ProfileService{db: db}
}

func (s *ProfileService) GetFavorites() (map[int][]int, error) {
	return s.db.GetFavorites()
}

func (s *ProfileService) SetFavorites(position int, heroIDs []int) error {
	return s.db.SetFavorites(position, heroIDs)
}
