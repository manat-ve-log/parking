package controller

import (
	"fmt"
	"net/http"
	"ttest/config"
	"ttest/entity"

	"github.com/gin-gonic/gin"
)

func GetRateByID(c *gin.Context){
	var rate entity.Rate
	id := c.Param("id")
	db := config.DB()
	if err := db.First(&rate, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "rate not found"})
		return
	}
	c.JSON(http.StatusOK, rate)

}

func ListRate(c *gin.Context){
	var rate entity.Rate
	
	db := config.DB()
	results := db.Find(&rate)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, rate)


}

func CreateRate(c *gin.Context) {
	var rate entity.Rate

	if err := c.ShouldBindJSON(&rate); err != nil {
		fmt.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// บันทึก  ลงฐานข้อมูล
	if err := db.Create(&rate).Error; err != nil {
		fmt.Println("Error creating rate:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("rate created successfully:", rate)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Created success",
		"data":    rate,
	})
}