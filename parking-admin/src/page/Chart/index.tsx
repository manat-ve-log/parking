
import React from "react";
import "./index.css"

import Navbar from "../../components/navbar/index";
import Chart from  "../../components/Chart/chart";


const MainChart: React.FC = () => {
    return (
        <div className="big-screen2">
            <div>
                <Navbar />
                <div className="details2">
                    <Chart />
                </div>
            </div>
        </div>
    );
};

export default MainChart;

