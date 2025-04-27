import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import TimeTable from "./components/TimeTable";
import DailyProgress from "./components/DailyProgress";
import SyllabusMapping from "./components/SyllabusMapping";
import MonthlyTargets from "./components/MonthlyTargets";
import "./App.css";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <Router>
      <div className="container">
        <div className="header">
          <h1>UPSC Mirror</h1>
          <button onClick={() => setDarkMode(!darkMode)} className="dark-toggle">
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="navbar">
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>
            Daily Progress
          </NavLink>
          <NavLink to="/time-table" className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>
            Time Table
          </NavLink>
          <NavLink to="/syllabus" className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>
            Syllabus Mapping
          </NavLink>
          <NavLink to="/monthly-targets" className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>
            Monthly Targets
          </NavLink>
        </div>

        <Routes>
          <Route path="/" element={<DailyProgress />} />
          <Route path="/time-table" element={<TimeTable />} />
          <Route path="/syllabus" element={<SyllabusMapping />} />
          <Route path="/monthly-targets" element={<MonthlyTargets />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
