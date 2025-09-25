
import React from "react";
import "./index.css"

import Navbar from "../../components/navbar/index";
import Admin from  "../../components/add_admin/Admin";


const MainAdd: React.FC = () => {
    return (
        <div className="big-screen2">
            <div>
                <Navbar />
                <div className="details2">
                    <Admin />
                </div>
            </div>
        </div>
    );
};

export default MainAdd;

