
import React from "react";
import "./index.css"

import Navbar from "../../components/navbar/index";
import Dashboard from  "../../components/dashboard/Dashboard";


const Maindash: React.FC = () => {
    return (
        <div className="big-screen2">
            <div>
                <Navbar />
                <div className="details2">
                    <Dashboard />
                </div>
            </div>
        </div>
    );
};

export default Maindash;

