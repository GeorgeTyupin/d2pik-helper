package profile

import "d2pik/internal/repository"

type ProfileService struct{}

func New() *ProfileService { return &ProfileService{} }

func (s *ProfileService) GetFavorites() (map[int][]int, error) {
	return repository.GetFavorites()
}

func (s *ProfileService) SetFavorites(pos int, ids []int) error {
	return repository.SetFavorites(pos, ids)
}
