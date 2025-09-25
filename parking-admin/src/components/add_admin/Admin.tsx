import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Modal, Button, Input, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import "./Admin.css";

interface Admin {
  id: string;
  email: string;
}

export default function AdminPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "permissions"), (snapshot) => {
      const data: Admin[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
      }));
      setAdmins(data);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingAdmin(null);
    setEmailInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setEmailInput(admin.email);
    setIsModalOpen(true);
  };

  // ฟังก์ชันตรวจสอบ Email
  const isValidEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

  const handleSave = async () => {
  if (!emailInput) {
    messageApi.error("กรุณากรอก email");
    return;
  }

  if (!isValidEmail(emailInput)) {
    messageApi.error("รูปแบบ email ไม่ถูกต้อง"); // ข้อความ validate เป็นภาษาอังกฤษ
    return;
  }

  try {
    if (editingAdmin) {
      const docRef = doc(db, "permissions", editingAdmin.id);
      await updateDoc(docRef, { email: emailInput });
      messageApi.success("แก้ไขข้อมูลเรียบร้อย");
    } else {
      await addDoc(collection(db, "permissions"), { email: emailInput });
      messageApi.success("เพิ่ม admin เรียบร้อย");
    }
    setIsModalOpen(false);
  } catch (err) {
    console.error(err);
    messageApi.error("เกิดข้อผิดพลาด");
  }
};

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "คุณแน่ใจหรือไม่ว่าต้องการลบแอดมินนี้?",
      icon: <ExclamationCircleOutlined />,
      content: "เมื่อทำการลบแล้วข้อมูลจะไม่สามารถกู้คืนได้",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          await deleteDoc(doc(db, "permissions", id));
          messageApi.success("ลบ admin เรียบร้อย");
        } catch (err) {
          console.error(err);
          messageApi.error("เกิดข้อผิดพลาด");
        }
      },
    });
  };

  return (
    <div className="admin-container">
      {contextHolder}
      <h2>การจัดการแอดมิน</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={openAddModal}
        style={{ marginBottom: "10px", backgroundColor: "#ff7f32", borderColor: "#ff7f32" }}
      >
        เพิ่มแอดมิน
      </Button>

      <div className="admin-list">
        {admins.map((admin) => (
          <div key={admin.id} className="admin-item">
            <span>{admin.email}</span>
            <div>
              <EditOutlined
                style={{ color: "#ff7f32", marginRight: "10px", cursor: "pointer" }}
                onClick={() => openEditModal(admin)}
              />
              <DeleteOutlined
                style={{ color: "red", cursor: "pointer" }}
                onClick={() => handleDelete(admin.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={editingAdmin ? "แก้ไข Admin" : "เพิ่ม Admin"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Input
          placeholder="Email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
      </Modal>
    </div>
  );
}
