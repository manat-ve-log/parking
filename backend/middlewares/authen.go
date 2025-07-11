package middlewares

import (
    "net/http"
    "strings"
    "ttest/entity"
    "ttest/service"
    "ttest/config" 
    "github.com/gin-gonic/gin"
    "fmt" 
    "time" 
)

// Authorizes เป็นฟังก์ชันตรวจเช็คโทเค็น
func Authorizes2() gin.HandlerFunc {
    return func(c *gin.Context) {
        var loginData struct {
            ID string `json:"id"`
            
        }
        

        if err := c.ShouldBindJSON(&loginData); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
            return
        }
        // รับค่า Authorization header
        clientToken := c.Request.Header.Get("Authorization")

        // ตรวจสอบว่ามี Authorization header หรือไม่
        if clientToken == "" {
            fmt.Println("No Authorization header provided") // พิมพ์ข้อความเมื่อไม่มี header
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
            return
        }

        

        // ตรวจสอบรูปแบบของโทเค็น
        if !strings.HasPrefix(clientToken, "Bearer ") {
            fmt.Println("Incorrect Format of Authorization Token") // พิมพ์ข้อความเมื่อรูปแบบไม่ถูกต้อง
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format of Authorization Token"})
            return
        }

        // ตัด "Bearer " ออกเพื่อให้เหลือแค่โทเค็น
        clientToken = strings.TrimSpace(strings.TrimPrefix(clientToken, "Bearer "))

        // สร้าง JwtWrapper สำหรับการตรวจสอบโทเค็น
        jwtWrapper := services.JwtWrapper{
            SecretKey: config.GetSecretKey(), // ใช้คีย์จาก config
            Issuer:    "AuthService",
        }

        // ตรวจสอบความถูกต้องของโทเค็นและดึงข้อมูล Expiration (exp)
        claims, err := jwtWrapper.ValidateToken(clientToken)
        if err != nil {
            fmt.Printf("Token validation error: %v\n", err) // พิมพ์ข้อผิดพลาดที่เกิดขึ้น
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
            return
        }

        // ดึง ID จาก claims ของ JWT
        userId := loginData.ID // ค่าของ ID จากโทเค็น

        db := config.DB()
        var employee entity.Employee

        if err := db.Preload("Position").Preload("Department").Preload("Status").Where("id = ?", loginData.ID).First(&employee).Error; err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
            c.Abort()
            return
        }

        // ค้นหาผู้ใช้ตาม ID และ preload ข้อมูล
        if err := db.Model(&entity.Employee{}).Where("id = ?", userId).Select("status_id").First(&employee).Error; err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
            c.Abort()
            return
        }

        
        // ดึงเวลาหมดอายุ (exp) ของโทเค็น
        expTime := time.Unix(claims.ExpiresAt, 0)
        timeRemaining := expTime.Sub(time.Now())

        if timeRemaining <= 0 {
            fmt.Println("Token has expired") // พิมพ์ข้อความเมื่อโทเค็นหมดอายุ
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token has expired"})
            return
        }

        // แสดงเวลาที่เหลือ
        fmt.Printf("Token is valid. Time remaining: %v\n", timeRemaining)

        // ส่งข้อมูลเวลาหมดอายุใน response body เป็น JSON
        c.JSON(http.StatusOK, gin.H{
            "message":            "Token validated successfully",
            "time_remaining":     timeRemaining.String(),
            "expires_at":         expTime.Format(time.RFC3339),
        })

        c.Next() // ถ้าโทเค็นถูกต้องให้ดำเนินการต่อไป
    }
}