package entity

import (
	"time"

	"gorm.io/gorm"
)

type EntryLog struct {
	gorm.Model

	EntryTime time.Time `json:"entry_time"`
	ExitTime time.Time `json:"exit_time"`
	Duration time.Duration `json:"duration"`
	Fee	float32 `json:"fee"`
	PaymentStatus bool `json:"payment_status"`

	VehicleID uint `json:"vehicle_id"`
	Vehicle	Vehicle `gorm:"foreignKey:VehicleID"`
}