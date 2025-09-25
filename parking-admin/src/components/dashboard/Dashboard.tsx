import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot} from "firebase/firestore";
import { db } from "../../firebase";
import {  CarOutlined, TruckOutlined } from "@ant-design/icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Dashboard.css";

import "antd/dist/reset.css"; // สำหรับ Ant Design v5

interface Task {
  id: string;
  CheckIn: string | null;
  CheckOut: string | null;
  created_at: string;
  deleted_at: string | null;
  image_base64: string | null;
  is_deleted: boolean;
  licen_plate: string;
  province: string;
  status: string;
  timetotal: number;
  vehicle_type: string;
}

interface Payment {
  id: string;
  amount: number;
  check_in: string;
  check_out: string;
  createdAt: any;
  license_plate: string;
  province: string;
  status: string;
  time: number;
  vehicle_type: string;
}


const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

 

  

  // ดึง Tasks และ Payments
  useEffect(() => {
    const tasksQuery = query(collection(db, "tasksCollection"), orderBy("created_at", "desc"));
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        CheckIn: doc.data().CheckIn ?? null,
        CheckOut: doc.data().CheckOut ?? null,
        created_at: doc.data().created_at ?? "",
        deleted_at: doc.data().deleted_at ?? null,
        image_base64: doc.data().image_base64 ?? null,
        is_deleted: doc.data().is_deleted ?? false,
        licen_plate: doc.data().licen_plate ?? "-",
        province: doc.data().province ?? "-",
        status: doc.data().status ?? "-",
        timetotal: doc.data().timetotal ?? 0,
        vehicle_type: doc.data().vehicle_type ?? "-",
      })) as Task[];
      setTasks(data);
    });

    const paymentsQuery = query(collection(db, "taskPaySuccess"), orderBy("createdAt", "desc"));
    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        amount: doc.data().amount ?? 0,
        check_in: doc.data().check_in ?? "",
        check_out: doc.data().check_out ?? "",
        createdAt: doc.data().createdAt,
        license_plate: doc.data().license_plate ?? "-",
        province: doc.data().province ?? "-",
        status: doc.data().status ?? "-",
        time: doc.data().time ?? 0,
        vehicle_type: doc.data().vehicle_type ?? "-",
      })) as Payment[];
      setPayments(data);
    });

    return () => {
      unsubTasks();
      unsubPayments();
    };
  }, []);

  
  // วันนี้
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayTasks = tasks.filter((t) => new Date(t.CheckIn || t.created_at) >= startOfDay);
  const todayTasksCount = todayTasks.length;
  const totalTimeToday = todayTasks.reduce((sum, t) => sum + t.timetotal, 0);
  const avgHours = Math.floor(totalTimeToday / todayTasksCount / 60) || 0;
  const avgMinutes = Math.floor(totalTimeToday / todayTasksCount % 60) || 0;
  const totalIncome = payments.reduce((sum, p) => sum + p.amount / 100, 0);
  const todayIncome = payments.filter((p) => p.createdAt.toDate() >= startOfDay).reduce((sum, p) => sum + p.amount / 100, 0);

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-content">

        

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          <div className="recent-activity">
            <h3>Recent Activity <span className="dot">🟢</span></h3>
            <table>
              <thead>
                <tr>
                  <th>เวลาเข้า</th>
                  <th>ทะเบียน</th>
                  <th>จังหวัด</th>
                  <th>ประเภท</th>
                  <th>สถานะ</th>
                  <th>เวลาออก</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 15).map((task) => (
                  <tr key={task.id}>
                    <td>{task.CheckIn || "-"}</td>
                    <td>{task.licen_plate}</td>
                    <td>{task.province}</td>
                    <td>{task.vehicle_type}</td>
                    <td>{task.status}</td>
                    <td>{task.CheckOut || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="side-cards">
            <div className="card income">
              <p className="value">฿ {totalIncome.toLocaleString()}</p>
              <span>รายได้ทั้งหมด</span>
            </div>
            <div className="card1-container1">
            <div className="card1">
              <p className="value1">
                <CarOutlined style={{ marginRight: "10px" }} />
                {tasks.filter((t) => t.vehicle_type === "Car" && t.status === "waiting").length}
              </p>
              <span>จำนวนผู้ใช้รถยนต์ (รอชำระเงิน)</span>
            </div>
            <div className="card1">
              <p className="value1">
                <TruckOutlined style={{ marginRight: "10px" }} />
                {tasks.filter((t) => t.vehicle_type === "Bus" && t.status === "waiting").length}
              </p>
              <span>จำนวนผู้ใช้รถบัส (รอชำระเงิน)</span>
            </div>
            <div className="card1">
              <p className="value1">
                <TruckOutlined style={{ marginRight: "10px" }} />
                {tasks.filter((t) => t.vehicle_type === "Minitruck" && t.status === "waiting").length}
              </p>
              <span>จำนวนผู้ใช้รถบรรทุกเล็ก (รอชำระเงิน)</span>
            </div>
            <div className="card1">
              <p className="value1">
                <CarOutlined style={{ marginRight: "10px" }} />
                {tasks.filter((t) => t.vehicle_type === "Pickup" && t.status === "waiting").length}
              </p>
              <span>จำนวนผู้ใช้รถกระบะ (รอชำระเงิน)</span>
            </div>
            <div className="card1">
              <p className="value1">
                <CarOutlined style={{ marginRight: "10px" }} />
                {tasks.filter((t) => t.vehicle_type === "Van" && t.status === "waiting").length}
              </p>
              <span>จำนวนผู้ใช้รถตู้ (รอชำระเงิน)</span>
            </div>
            <div className="card1">
              <p className="value1">
                <i className="bi bi-bicycle" style={{ marginRight: "10px" }}></i>
                {tasks.filter((t) => t.vehicle_type === "Motorcycle" && t.status === "waiting").length}
              </p>
              <span>จำนวนผู้ใช้รถจักรยานยนต์ (รอชำระเงิน)</span>
            </div>
            <div className="card1">
              <p className="value1">
                <TruckOutlined style={{ marginRight: "10px" }} />
                {tasks.filter((t) => t.vehicle_type === "Truck" && t.status === "waiting").length}
              </p>
              <span>จำนวนผู้ใช้รถบรรทุก (รอชำระเงิน)</span>
            </div>
          </div>
          </div>
        </div>

        <div className="bottom-stats">
          <div className="card wide">
            <p className="value">฿ {todayIncome.toLocaleString()}</p>
            <span>รายได้วันนี้</span>
          </div>
          <div className="card wide">
            <p className="value">{todayTasksCount}</p>
            <span>จำนวนรถเข้า-ออก วันนี้</span>
          </div>
          <div className="card wide">
            <p className="value">{avgHours} hr {avgMinutes} min</p>
            <span>เวลาเข้าออกเฉลี่ยวันนี้</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
