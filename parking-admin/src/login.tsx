import { useState } from "react";
import { auth, googleProvider, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import GoogleIcon from "./assets/icons8-google.svg"; // ไฟล์โลโก้ Google ใน assets ของคุณ

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkPermission = async (email: string) => {
    const q = query(collection(db, "permissions"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;
      if (userEmail && (await checkPermission(userEmail))) {
        navigate("/dashboard");
      } else {
        setError("❌ Email นี้ไม่มีสิทธิ์เข้าระบบ");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;
      if (userEmail && (await checkPermission(userEmail))) {
        navigate("/dashboard");
      } else {
        setError("❌ Email นี้ไม่มีสิทธิ์เข้าระบบ");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>PARKING ADMIN</h2>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleLogin}>Login</button>

        <div className="divider">
            <span className="google-text">Sign in with Google</span>
        </div>

        <div className="google-btn" onClick={handleGoogleLogin}>
          <img src={GoogleIcon} alt="Google logo" className="google-logo" />
        </div>
      </div>
    </div>
  );
}

