package main

import (
	"fmt"
	"ttest/config"
	"ttest/controller"

	"github.com/gin-gonic/gin"
)

const PORT = 8080

func main() {
	// เชื่อมต่อ DB
	config.ConnectionDB()

	// AutoMigrate
	config.SetupDatabase()

	r := gin.Default()

	r.POST("/auth/signin", controller.EmployeeSignin)




	r.GET("/vehicle", controller.ListVehicle)
	r.POST("/rate", controller.CreateRate)
	r.GET("/vehicle/type", controller.ListVehicleType)



	// Start server
	err := r.Run(fmt.Sprintf(":%d", PORT))
	if err != nil {
		fmt.Println("Server failed to start:", err)
	}
}
