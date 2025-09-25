import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Dashboard from "./page/dashboard/index.tsx";
import Management from "./page/Management/index.tsx";
import History from "./page/History/index.tsx";
import Setting from "./page/setting/index.tsx";
import Chart from "./page/Chart/index.tsx";
import Admin from "./page/admin/index.tsx";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/management"
          element={user ? <Management /> : <Navigate to="/login" />}
        />
        <Route
          path="/history"
          element={user ? <History /> : <Navigate to="/login" />}
        />
        <Route
          path="/setting"
          element={user ? <Setting  /> : <Navigate to="/login" />}
        />
        <Route
          path="/chart"
          element={user ? <Chart  /> : <Navigate to="/login" />}
        />
        <Route
          path="/add_admin"
          element={user ? <Admin  /> : <Navigate to="/login" />}
        />
        {/* <Route path="/history" element={<History />} /> */}
        {/* <Route path="/setting" element={<Setting />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
