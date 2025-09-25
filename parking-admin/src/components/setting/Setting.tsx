import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import "./Setting.css";
import { message } from "antd";
import "antd/dist/reset.css"; // สำหรับ Ant Design v5

interface PriceSetting {
  id: string;
  name: string;
  pricePerMin: number;
}

export default function Setting() {
  const [prices, setPrices] = useState<PriceSetting[]>([]);
  const [editedPrices, setEditedPrices] = useState<{ [key: string]: number }>({});
  const [changedItems, setChangedItems] = useState<{ [key: string]: boolean }>({});

  const [messageApi, contextHolder] = message.useMessage(); // เพิ่ม message API ของ Antd

  const vehicleTypes: string[] = [
    "Car", "Pickup", "Bus", "Truck", "Minitruck", "Van", "Motorcycle"
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasksPrices"), (snapshot) => {
      const data: PriceSetting[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PriceSetting[];
      setPrices(data);

      const initial: { [key: string]: number } = {};
      data.forEach(item => {
        initial[item.name] = item.pricePerMin;
      });
      setEditedPrices(initial);
      setChangedItems({});
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (type: string, value: number) => {
    setEditedPrices(prev => {
      const updated = { ...prev, [type]: value };
      const original = prices.find(p => p.name === type)?.pricePerMin ?? 20;
      setChangedItems(prevChanged => ({
        ...prevChanged,
        [type]: updated[type] !== original
      }));
      return updated;
    });
  };

  const handleSave = async (type: string) => {
    const item = prices.find(p => p.name === type);
    const value = editedPrices[type] ?? 20;

    try {
      if (item) {
        const docRef = doc(db, "tasksPrices", item.id);
        await updateDoc(docRef, { pricePerMin: value });
      } else {
        const newDocRef = doc(collection(db, "tasksPrices"));
        await setDoc(newDocRef, { name: type, pricePerMin: value });
      }

      messageApi.success(`บันทึกราคาของ ${type} เรียบร้อย `, 3);
      setChangedItems(prev => ({ ...prev, [type]: false }));
    } catch (error) {
      console.error("Error saving price:", error);
      messageApi.error(`ไม่สามารถบันทึกราคา ${type} ได้ `, 3);
    }
  };

  const handleCancel = (type: string) => {
    const original = prices.find(p => p.name === type)?.pricePerMin ?? 20;

    setEditedPrices(prev => ({
      ...prev,
      [type]: original
    }));

    setChangedItems(prev => ({ ...prev, [type]: false }));

    messageApi.info(`ยกเลิกการเปลี่ยนแปลงราคา ${type} `, 3);
  };

  return (
    <div className="setting-container">
      {contextHolder} {/* ต้องวางตรงนี้เพื่อให้ message แสดง */}
      <h2 className="page-title">แก้ไขราคา</h2>
      <div className="price-wrapper">
        <div className="price-grid">
          {vehicleTypes.map((type) => (
            <div className="price-card" key={type}>
              <p className="vehicle-label">ประเภทรถ : {type}</p>
              <div className="price-input">
                <span>ราคา/ชั่วโมง : </span>
                <input
                  type="number"
                  value={editedPrices[type] ?? 20}
                  onChange={(e) => handleInputChange(type, Number(e.target.value))}
                /> ฿
              </div>

              {changedItems[type] && (
                <div className="btn-group">
                  <button className="cancel-btn" onClick={() => handleCancel(type)}>
                    ยกเลิก
                  </button>
                  <button className="save-btn" onClick={() => handleSave(type)}>
                    บันทึก
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
