package controller

import (
	"net/http"
	"ttest/config"
	"ttest/entity"

	"github.com/gin-gonic/gin"
)

func GetVehicleType(c *gin.Context){
	var vehicle_type entity.VehicleType
	id := c.Param("id")

	db := config.DB()	
	if err := db.First(&vehicle_type, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "vehicle type not found"})
		return
	}
	c.JSON(http.StatusOK, vehicle_type)

}

func ListVehicleType(c *gin.Context){
	var vehicle_type []entity.VehicleType
	

	db := config.DB()	
	results := db.Preload("Rate").Find(&vehicle_type)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, vehicle_type)
	
}