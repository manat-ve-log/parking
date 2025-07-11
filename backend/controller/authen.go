package controller

import (
	"net/http"
	"ttest/config"
	"ttest/entity"
	services "ttest/service"

	"github.com/gin-gonic/gin"
)

func EmployeeSignin(c *gin.Context) {
    var loginData struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }

    if err := c.ShouldBindJSON(&loginData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    var employee entity.Employee

    // Query หา employee โดย username
    if err := config.DB().Where("UserName = ?", loginData.Username).First(&employee).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect username or password"})
        return
    }

    // ตรวจสอบรหัสผ่าน
    if !config.CheckPasswordHash([]byte(loginData.Password), []byte(employee.Password)) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect username or password"})
        return
    }

    jwtWrapper := services.JwtWrapper{
        SecretKey:        config.GetSecretKey(),
        Issuer:           "AuthService",
        ExpirationHours:  0,
        ExpirationMinute: 10,
        ExpirationSeconds: 0,
    }

    tokenString, err := jwtWrapper.GenerateToken(employee.UserName)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "id":       employee.ID,
        "username": employee.UserName,
        "token":    tokenString,
    })
}