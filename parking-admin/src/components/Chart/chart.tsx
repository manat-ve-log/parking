import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { db } from "../../firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs"; // ใช้สำหรับเปรียบเทียบวันที่
import "antd/dist/reset.css"; // Ant Design v5
import "./chart.css";

interface Payment {
  amount: number;
  createdAt: Timestamp;
  vehicle_type: string;
}

interface Task {
  CheckIn: string;
  vehicle_type: string;
}

export default function ChartPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // ================== FILTER STATES ==================
  const [filterTimeIncome, setFilterTimeIncome] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedIncomeDate, setSelectedIncomeDate] = useState<Dayjs | null>(null); // AntD DatePicker สำหรับรายได้
  const [filterVehicle, setFilterVehicle] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null); // AntD DatePicker สำหรับรถเข้าใช้

  useEffect(() => {
    const fetchData = async () => {
      try {
        const paySnap = await getDocs(collection(db, "taskPaySuccess"));
        const payData: Payment[] = paySnap.docs.map((doc) => {
          const d = doc.data();
          return {
            amount: d.amount / 100,
            createdAt: d.createdAt,
            vehicle_type: d.vehicle_type,
          };
        });
        setPayments(payData);

        const taskSnap = await getDocs(collection(db, "tasksCollection"));
        const taskData: Task[] = taskSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            CheckIn: d.CheckIn,
            vehicle_type: d.vehicle_type,
          };
        });
        setTasks(taskData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // ================== FILTER FUNCTIONS ==================
  const filterByTime = (date: Date, filter: "all" | "today" | "week" | "month") => {
    const now = new Date();
    if (filter === "today") {
      return date.getDate() === now.getDate() &&
             date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear();
    }
    if (filter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return date >= oneWeekAgo;
    }
    if (filter === "month") {
      return date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filterByVehicle = (type: string, vehicleType: string) => {
    if (type === "All") return true;
    return type === vehicleType;
  };

  // ================== FILTERED DATA ==================
  const filteredPayments = payments.filter((p) => {
    const date = p.createdAt.toDate();

    if (!filterByTime(date, filterTimeIncome)) return false;

    if (selectedIncomeDate) {
      return dayjs(date).isSame(selectedIncomeDate, "day");
    }

    return true;
  });

  const filteredTasks = tasks.filter((t) => {
    const taskDate = new Date(t.CheckIn);

    if (!filterByVehicle(filterVehicle, t.vehicle_type)) return false;

    if (selectedDate) {
      return dayjs(taskDate).isSame(selectedDate, "day");
    }

    return true;
  });

  // ================== CHART DATA ==================
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const income = filteredPayments
      .filter((p) => p.createdAt.toDate().getHours() === i)
      .reduce((sum, p) => sum + p.amount, 0);
    return { time: `${i}:00`, income };
  });

  const monthlyData = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ].map((m, i) => {
    const income = payments
      .filter((p) => p.createdAt.toDate().getMonth() === i)
      .reduce((sum, p) => sum + p.amount, 0);
    return { month: m, income };
  });

  const carUsageData = Array.from({ length: 24 }, (_, i) => {
    const count = filteredTasks.filter((t) => {
      const h = new Date(t.CheckIn).getHours();
      return h === i;
    }).length;
    return { time: `${i}:00`, count };
  });

  const vehicleCounts: Record<string, number> = {};
  filteredTasks.forEach((t) => {
    vehicleCounts[t.vehicle_type] = (vehicleCounts[t.vehicle_type] || 0) + 1;
  });
  const pieData = Object.entries(vehicleCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ["#0088FE","#00C49F","#FFBB28","#FF8042","#A569BD","#5DADE2","#F1948A","#ff1900ff","#00ff40ff"];

  // ================== UI ==================
  return (
    <div className="chart-container">
      <h2 className="page-title"><i className="bi bi-bar-chart-line-fill"></i> กราฟข้อมูล</h2>

      <div className="chart-grid">
        {/* รายได้วันนี้ */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title"><i className="bi bi-cash" style={{ marginRight: "20px" }}></i> รายได้</span>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <select
                className="dropdown"
                value={filterTimeIncome}
                onChange={(e) => setFilterTimeIncome(e.target.value as any)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="today">วันนี้</option>
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
              </select>

              <DatePicker
                value={selectedIncomeDate}
                onChange={(date) => setSelectedIncomeDate(date)}
                placeholder="เลือกวันที่"
                style={{ width: 150 }}
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#007bff" dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* รายได้ทั้งหมดต่อเดือน */}
<div className="chart-card">
  <div className="chart-header">
    <span className="chart-title"><i className="bi bi-cash" style={{ marginRight: "20px" }}></i> รายได้ทั้งหมด (ต่อเดือน)</span>
  </div>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={monthlyData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="income" stroke="#ff7f32" dot />
    </LineChart>
  </ResponsiveContainer>
</div>
        {/* รถที่เข้าใช้ */}
        <div className="chart-card wide">
          <div className="chart-header">
            <span className="chart-title"><i className="bi bi-car-front-fill" style={{ marginRight: "20px" }}></i> รถที่เข้าใช้</span>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <select
                className="dropdown"
                value={filterVehicle}
                onChange={(e) => setFilterVehicle(e.target.value)}
              >
                <option value="All">ทั้งหมด</option>
                <option value="Car">Car</option>
                <option value="Truck">Truck</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Van">Van</option>
                <option value="Pickup">Pickup</option>
                <option value="Minitruck">Minitruck</option>
                <option value="Bus">Bus</option>
                <option value="none">none</option>
              </select>

              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                placeholder="เลือกวันที่"
                style={{ width: 150 }}
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={carUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#28a745" dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* สัดส่วนประเภทรถ */}
        <div className="chart-card wide">
          <div className="chart-header">
            <span className="chart-title"><i className="bi bi-car-front-fill" style={{ marginRight: "20px" }}></i> สัดส่วนประเภทรถ</span>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={150}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
