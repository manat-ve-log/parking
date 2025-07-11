package config

import (
	"fmt"
	"ttest/entity"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("parking.db?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("เชื่อมต่อ SQLite ไม่ได้: " + err.Error())
	}
	
	fmt.Println("connected database")
	db = database
}

func SetupDatabase() {
	// AutoMigrate ตารางทั้งหมด โดยไม่ต้องใส่ EmployeeDisease เพราะ GORM จะสร้างให้อัตโนมัติ
	db.AutoMigrate(
		&entity.Employee{},
		&entity.Rate{},
		&entity.VehicleType{},
		&entity.Vehicle{},
		&entity.EntryLog{},
	)

	hashedPassword, _ := HashPassword("123456")
	User1 := entity.Employee{FirstName: "user1",LastName:"user",UserName:"banana",Password:hashedPassword}
	db.FirstOrCreate(&User1, entity.Employee{UserName: "banana"})

	Rate1 := entity.Rate{RatePerHour: 10}
	db.FirstOrCreate(&Rate1, entity.Rate{RatePerHour: 10})
	vehicleTypes := []entity.VehicleType{
		{Name: "รถยนต์", RateID: 1},
		{Name: "รถกระบะ", RateID: 1},
		{Name: "มอเตอร์ไซค์", RateID: 1},
		{Name: "รถบรรทุก", RateID: 1},
		{Name: "รถบัส / รถโดยสาร", RateID: 1},
		{Name: "รถตู้", RateID: 1},
		{Name: "รถพ่วง / หัวลาก", RateID: 1},
		{Name: "รถสามล้อ", RateID: 1},
		{Name: "รถจักรยาน", RateID: 1},
		{Name: "อื่น ๆ", RateID: 1},
	}

	for _, v := range vehicleTypes {
		db.FirstOrCreate(&v, entity.VehicleType{Name: v.Name})
	}

	car1 := entity.Vehicle{Vehicle: "car",PlateNumber: "a1224",VehicleTypeID: 1}
	db.FirstOrCreate(&car1, entity.Vehicle{Vehicle: "car"})
	
}