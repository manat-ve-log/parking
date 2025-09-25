
import React from "react";
import "./index.css"

import Navbar from "../../components/navbar/index";
import Management from  "../../components/management/Management";


const MainManage: React.FC = () => {
    return (
        <div className="big-screen2">
            <div>
                <Navbar />
                <div className="details2">
                    <Management />
                </div>
            </div>
        </div>
    );
};

export default MainManage;

