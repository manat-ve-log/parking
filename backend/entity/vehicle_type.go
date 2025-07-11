package entity

import "gorm.io/gorm"

type VehicleType struct {
	gorm.Model
	Name     string `json:"name"` 
	RateID   uint
	Rate     Rate
}