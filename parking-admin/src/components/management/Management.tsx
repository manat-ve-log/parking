import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { message, Modal } from "antd"; // เพิ่ม import Modal และ message
import "./Management.css";
import "bootstrap-icons/font/bootstrap-icons.css";

interface Task {
  id: string;
  CheckIn: string;
  CheckOut?: string;
  licen_plate: string;
  status: string;
  province: string;
  image_base64?: string;
  vehicle_type: "none" | "Car" | "Bus" | "Minitruck" | "Motorcycle" | "Pickup" | "Truck" | "Van";
}

export default function Management() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("ทั้งหมด");
  const [searchPlate, setSearchPlate] = useState("");
  const [editTask, setEditTask] = useState<Task | null>(null);

  const vehicleFilters = ["ทั้งหมด","Car","Bus","Minitruck","Motorcycle","Pickup","Truck","Van"];
  const statusOptions = ["waitforpay", "waiting", "successful"];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasksCollection"), (snapshot) => {
      const data: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(data);
    });

    return () => unsubscribe();
  }, []);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} ชั่วโมง ${m} นาที`;
  };

  const getParkDuration = (checkIn: string) => {
    const start = new Date(checkIn).getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((now - start) / 1000 / 60);
    return diffMinutes >= 0 ? diffMinutes : 0;
  };

  const filteredTasks = tasks.filter(
    (t) =>
      !t.CheckOut &&
      ["waitforpay", "waiting"].includes(t.status) &&
      (filter === "ทั้งหมด" || t.vehicle_type.toLowerCase() === filter.toLowerCase()) &&
      t.licen_plate.toLowerCase().includes(searchPlate.toLowerCase())
  );

  // บันทึก Task
  const handleSave = async () => {
    if (editTask) {
      try {
        const taskRef = doc(db, "tasksCollection", editTask.id);
        await updateDoc(taskRef, {
          CheckIn: editTask.CheckIn,
          CheckOut: editTask.CheckOut,
          licen_plate: editTask.licen_plate,
          status: editTask.status,
          vehicle_type: editTask.vehicle_type,
        });
        setEditTask(null);
        message.success(`บันทึกการเเก้ไขของทะเบียน ${editTask.licen_plate} เรียบร้อย `);
      } catch (error) {
        console.error(error);
        message.error("เกิดข้อผิดพลาดในการบันทึก ❌");
      }
    }
  };

  // ลบ Task ด้วย Modal.confirm
  const handleDelete = () => {
    if (!editTask) return;

    Modal.confirm({
      title: `คุณแน่ใจว่าต้องการลบ Task: ${editTask.licen_plate} ?`,
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          const taskRef = doc(db, "tasksCollection", editTask.id);
          await deleteDoc(taskRef);
          setEditTask(null);
          message.success(`ลบ ข้อมูลของทะเบียน ${editTask.licen_plate} เรียบร้อย `);
        } catch (error) {
          console.error(error);
          message.error("เกิดข้อผิดพลาดในการลบ ❌");
        }
      },
    });
  };

  return (
    <div className="management-container">
      {/* Filter */}
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

      {/* Search */}
      <div style={{ margin: "10px 0" }}>
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
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>เวลาเข้า</th>
              <th>ทะเบียน</th>
              <th>ประเภท</th>
              <th>สถานะ</th>
              <th>ระยะเวลาที่จอด</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>
                  {task.image_base64 ? (
                    <img
                      src={task.image_base64}
                      alt="Vehicle"
                      style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 4 }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{task.CheckIn}</td>
                <td>{task.licen_plate}</td>
                <td>{task.vehicle_type}</td>
                <td>{task.status}</td>
                <td>{formatDuration(getParkDuration(task.CheckIn))}</td>
                <td>
                  <span className="edit-icon" onClick={() => setEditTask(task)}>
                    <i className="bi bi-pen-fill" style={{ color: "#ff7f32", cursor: "pointer" }}></i>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editTask && (
        <div className="modal">
          <div className="modal-content">
            <h3>แก้ไขข้อมูล</h3>

            {editTask.image_base64 && (
              <div className="image-preview-container">
                <img
                  src={editTask.image_base64}
                  alt="Vehicle Preview"
                  className="image-preview"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    marginBottom: "10px",
                    borderRadius: "4px",
                  }}
                />
              </div>
            )}

            <label>เวลาเข้า:</label>
            <input
              type="datetime-local"
              value={editTask.CheckIn}
              onChange={(e) => setEditTask({ ...editTask, CheckIn: e.target.value })}
            />

            <label>เวลาออก:</label>
            <input
              type="datetime-local"
              value={editTask.CheckOut || ""}
              onChange={(e) => setEditTask({ ...editTask, CheckOut: e.target.value })}
            />

            <label>ทะเบียน:</label>
            <input
              type="text"
              value={editTask.licen_plate}
              onChange={(e) => setEditTask({ ...editTask, licen_plate: e.target.value })}
            />

            <label>ประเภท:</label>
            <select
              value={editTask.vehicle_type}
              onChange={(e) =>
                setEditTask({ ...editTask, vehicle_type: e.target.value as Task["vehicle_type"] })
              }
            >
              {vehicleFilters.filter((v) => v !== "ทั้งหมด").map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <label>สถานะ:</label>
            <select
              value={editTask.status}
              onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div
              className="modal-buttons"
              style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}
            >
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: "#ff4d4f",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                }}
              >
                ลบ
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: "#ff7f32",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                  }}
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setEditTask(null)}
                  style={{
                    backgroundColor: "#fff",
                    color: "#ff7f32",
                    border: "1px solid #ff7f32",
                    padding: "6px 12px",
                    borderRadius: "4px",
                  }}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
