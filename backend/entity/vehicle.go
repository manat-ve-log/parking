package entity

import "gorm.io/gorm"

type Vehicle struct {
	gorm.Model
	Vehicle string      `json:"vehicle"`
	PlateNumber string 	`json:"plate_number"`

	VehicleTypeID uint `json:"vehicle_type_id"`  
	VehicleType   VehicleType `gorm:"foreignKey:VehicleTypeID"`
}