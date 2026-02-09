import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const SidebarLayout = () => {
  return (
    <div className="ac-shell">
      <Sidebar />
      <div className="ac-shell-content">
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
