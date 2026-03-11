import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/industrial.css";

const IndustrialModules = () => {

  const navigate = useNavigate();

  return (
    <div className="im-page-wrapper">
      <div className="im-modules-container">

        <div className="im-module-card im-module-a">
          <div className="im-overlay"></div>
          <div className="im-card-content">
            <h2>Module-A</h2>
            <p>Process Monitoring</p>
          </div>
        </div>

        <div className="im-module-card im-module-b">
          <div className="im-overlay"></div>
          <div className="im-card-content">
            <h2>Module-B</h2>
            <p>Process Controlling</p>
          </div>
        </div>

        {/* CLICKABLE MODULE */}
        <div
          className="im-module-card im-module-c"
          onClick={() => navigate("/upload-dataset")}
        >
          <div className="im-overlay"></div>
          <div className="im-card-content">
            <h2>Module-C</h2>
            <p>Quality Predicting</p>
          </div>
        </div>

        <div className="im-module-card im-module-d">
          <div className="im-overlay"></div>
          <div className="im-card-content">
            <h2>Module-D</h2>
            <p>Defect Categorizing</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IndustrialModules;
