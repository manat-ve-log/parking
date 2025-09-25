
import React from "react";
import "./index.css"

import Navbar from "../../components/navbar/index";
import Setting from  "../../components/setting/Setting";


const MainSet: React.FC = () => {
    return (
        <div className="big-screen2">
            <div>
                <Navbar />
                <div className="details2">
                    <Setting />
                </div>
            </div>
        </div>
    );
};

export default MainSet;

