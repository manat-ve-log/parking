package entity

import (

	"gorm.io/gorm"
)

type Rate struct {
	gorm.Model
	RatePerHour uint `json:"rate_per_hour"`
	VehicleType []VehicleType `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}