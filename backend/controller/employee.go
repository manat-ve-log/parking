package controller

import (
	"net/http"
	"ttest/config"
	"ttest/entity"

	"github.com/gin-gonic/gin"
)

func GetEmployee(c *gin.Context) {
	var employee []entity.Employee

	db := config.DB()
	results := db.Find(&employee)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, employee)

}

func GetEmployeeByID(c *gin.Context) {
	db := config.DB()
	id := c.Param("id")
	var employee entity.Employee
	if err := db.First(&employee, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
		return
	}
	c.JSON(http.StatusOK, employee)
}

func CreateEmployee(c *gin.Context) {
	db := config.DB()

	var input entity.Employee
	// Bind JSON input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Create new Employee
	employee := entity.Employee{
		FirstName:      input.FirstName,
		LastName:		input.LastName,
		UserName: 		input.UserName,	
		
	}

	// Save Employee to database
	if err := db.Create(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Employee"})
		return
	}

	c.JSON(http.StatusCreated, employee)
}
