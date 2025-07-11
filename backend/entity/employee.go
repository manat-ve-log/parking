package entity

import (
	"time"

	"gorm.io/gorm"
)

type Employee struct {
	gorm.Model
	FirstName string
	LastName string

	UserName string `gorm:"column:username;unique" json:"username"`
	Password string

	ResetToken       string    `gorm:"size:36" json:"reset_token"`         // UUID ขนาด 36 ตัว
	ResetTokenExpiry time.Time `json:"reset_token_expiry"` 
}