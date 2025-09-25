import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { Modal, Button, Table, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs"; // สำหรับจัดการวันที่
import "./History.css";

interface HistoryTask {
  id: string;
  amount: number;
  check_in: string;
  check_out: string;
  createdAt: any;
  license_plate: string;
  province: string;
  status: string;
  time: number;
  vehicle_type:
    | "none"
    | "Car"
    | "Bus"
    | "Minitruck"
    | "Motorcycle"
    | "Pickup"
    | "Truck"
    | "Van";
  id_taskcollection?: string;
  reference_number_1?: string;
  reference_number_2?: string | null;
  image_base64?: string;
}

export default function History() {
  const [tasks, setTasks] = useState<HistoryTask[]>([]);
  const [filter, setFilter] = useState("ทั้งหมด");
  const [searchPlate, setSearchPlate] = useState("");
  const [selectedTask, setSelectedTask] = useState<HistoryTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null); // สำหรับฟิลเตอร์วัน

  const vehicleFilters = ["ทั้งหมด", "Car", "Bus", "Minitruck", "Motorcycle", "Pickup", "Truck", "Van"];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "taskPaySuccess"), (snapshot) => {
      const data: HistoryTask[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HistoryTask[];
      setTasks(data);
    });
    return () => unsubscribe();
  }, []);

  const formatDurationFromMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    const s = Math.floor((minutes * 60) % 60);
    return `${h} ชั่วโมง ${m} นาที ${s} วินาที`;
  };

  // ฟิลเตอร์ tasks รวม: รถ, ป้ายทะเบียน, วันที่
  const filteredTasks = tasks.filter((t) => {
    const vehicleMatch = filter === "ทั้งหมด" || t.vehicle_type.toLowerCase() === filter.toLowerCase();
    const plateMatch = t.license_plate.toLowerCase().includes(searchPlate.toLowerCase());

    let dateMatch = true;
    if (selectedDate) {
      const taskDate = t.createdAt?.toDate?.() ?? new Date(t.createdAt);
      dateMatch = dayjs(taskDate).isSame(selectedDate, "day");
    }

    return vehicleMatch && plateMatch && dateMatch;
  });

  const showDetails = async (task: HistoryTask) => {
    let taskWithImage = { ...task };

    if (task.id_taskcollection) {
      try {
        const ref = doc(db, "tasksCollection", task.id_taskcollection);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          taskWithImage = { ...taskWithImage, ...snap.data() } as HistoryTask;
        }
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    }

    setSelectedTask(taskWithImage);
    setIsModalOpen(true);
  };

  const detailColumns: ColumnsType<{ key: string; label: string; value: any }> = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
      width: "40%",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <div className="history-container">
      {/* Filter รถ */}
      <div className="filter-buttons">
        {vehicleFilters.map((btn) => (
          <button
            key={btn}
            className={filter === btn ? "active" : ""}
            onClick={() => setFilter(btn)}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* ค้นหาป้ายทะเบียน + เลือกวัน */}
      <div style={{ margin: "10px 0", display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="text"
          placeholder="ค้นหาป้ายทะเบียน..."
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value)}
          style={{
            width: "200px",
            padding: "5px 8px",
            border: "1px solid #ff7f32",
            borderRadius: "4px",
            color: "#ff7f32",
            backgroundColor: "#fff",
          }}
        />
        <DatePicker
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          format="YYYY-MM-DD"
          placeholder="เลือกวันที่"
        />
      </div>

      {/* ตารางหลัก */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>เวลาเข้า</th>
              <th>เวลาออก</th>
              <th>ป้ายทะเบียน</th>
              <th>ประเภท</th>
              <th>สถานะ</th>
              <th>ระยะเวลาที่จอด</th>
              <th>จำนวนเงิน (฿)</th>
              <th>ตรวจสอบ</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.check_in}</td>
                <td>{task.check_out}</td>
                <td>{task.license_plate}</td>
                <td>{task.vehicle_type}</td>
                <td>{task.status}</td>
                <td>{formatDurationFromMinutes(task.time)}</td>
                <td>
                  {(task.amount / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>
                  <Button
                    type="primary"
                    style={{ backgroundColor: "#ff7f32", borderColor: "#ff7f32" }}
                    onClick={() => showDetails(task)}
                  >
                    ดู
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal + Table รายละเอียด */}
      <Modal
        title="ตรวจสอบข้อมูล"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedTask && (
          <Table
            columns={detailColumns}
            dataSource={[
              { key: "amount", label: "จำนวนเงิน", value: (selectedTask.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " บาท" },
              { key: "check_in", label: "Check In", value: selectedTask.check_in },
              { key: "check_out", label: "Check Out", value: selectedTask.check_out },
              { key: "createdAt", label: "ชำระเมื่อ", value: selectedTask.createdAt?.toDate?.().toString() ?? selectedTask.createdAt },
              { key: "id_taskcollection", label: "ID", value: selectedTask.id_taskcollection },
              { key: "license_plate", label: "ทะเบียน", value: selectedTask.license_plate },
              { key: "province", label: "จังหวัด", value: selectedTask.province },
              { key: "reference_number_1", label: "หมายเลขอ้างอิงการชำระเงิน 1", value: selectedTask.reference_number_1 },
              { key: "reference_number_2", label: "หมายเลขอ้างอิงการชำระเงิน 2", value: selectedTask.reference_number_2 ?? "-" },
              { key: "status", label: "สถานะ", value: selectedTask.status },
              { key: "time", label: "เวลาจอด", value: formatDurationFromMinutes(selectedTask.time) },
              { key: "vehicle_type", label: "ประเภท", value: selectedTask.vehicle_type },
              { key: "image", label: "รูปอ้างอิง", value: selectedTask.image_base64 ? <img src={selectedTask.image_base64} alt="Vehicle" style={{ width: "200px", borderRadius: "8px", border: "1px solid #ddd" }} /> : "-" },
            ]}
            pagination={false}
            bordered
            size="middle"
          />
        )}
      </Modal>
    </div>
  );
}