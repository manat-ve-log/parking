package controller

import (
	"net/http"
	"ttest/config"
	"ttest/entity"

	"github.com/gin-gonic/gin"
)

func ListVehicle(c *gin.Context) {
	var vehicle  []entity.Vehicle

	db := config.DB()	
	results := db.Preload("VehicleType.Rate").Find(&vehicle)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, vehicle)

}

func GetVehicleByID(c *gin.Context) {

	var vehicle  entity.Vehicle
	id  := c.Param("id")

	db := config.DB()	
	if err := db.First(&vehicle, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "vehicle not found"})
		return
	}
	c.JSON(http.StatusOK, vehicle)

}
