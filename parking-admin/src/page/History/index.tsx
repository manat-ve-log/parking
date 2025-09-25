
import React from "react";
import "./index.css"

import Navbar from "../../components/navbar/index";
import History from  "../../components/History/History";


const MainHis: React.FC = () => {
    return (
        <div className="big-screen2">
            <div>
                <Navbar />
                <div className="details2">
                    <History />
                </div>
            </div>
        </div>
    );
};

export default MainHis;

