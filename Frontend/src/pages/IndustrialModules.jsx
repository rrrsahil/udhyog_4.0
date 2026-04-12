import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/industrial.css";

const IndustrialModules = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Defect Prognosis",
      desc: "Predict defect probabilities using ML",
      route: "/prognosis",
      className: "im-module-a",
    },
    {
      title: "Property Prognosis",
      desc: "Predict mechanical properties dynamically",
      route: "/property-prognosis",
      className: "im-module-b",
    },
    {
      title: "Defect Diagnosis",
      desc: "Analyze root cause of defects",
      route: "/analysis",
      className: "im-module-c",
    },
    {
      title: "Mechanical Diagnosis",
      desc: "Analyze mechanical behavior",
      route: "/mechanical",
      className: "im-module-d",
    },
  ];

  return (
    <div className="im-page-wrapper">
      <div className="im-modules-container">
        {modules.map((mod, index) => (
          <div
            key={index}
            className={`im-module-card ${mod.className}`}
            onClick={() => navigate(mod.route)}
          >
            <div className="im-overlay"></div>
            <div className="im-card-content">
              <h2>{mod.title}</h2>
              <p>{mod.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndustrialModules;