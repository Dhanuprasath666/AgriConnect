import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const isFarmer = path.startsWith("/farmer");
  const isConsumer = path.startsWith("/consumer");

  const dashboardRoute = isFarmer ? "/farmer/dashboard" : "/consumer";
  const loginRoute = isFarmer ? "/login/farmer" : "/login/consumer";
  const registerRoute = "/register";
  const marketRoute = "/consumer/market";

  return (
    <aside className="ac-sidebar">
      <nav className="ac-sidebar-nav">
        <button
          className="ac-sidebar-link ac-sidebar-icon"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          data-label="Back"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M14.5 6.5L9 12l5.5 5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <NavLink
          to="/"
          aria-label="Home"
          data-label="Home"
          className={({ isActive }) =>
            `ac-sidebar-link ac-sidebar-icon${isActive ? " is-active" : ""}`
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5.5v-6h-3v6H5a1 1 0 0 1-1-1v-9.5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </NavLink>

        <NavLink
          to={registerRoute}
          aria-label="Register"
          data-label="Register"
          className={({ isActive }) =>
            `ac-sidebar-link ac-sidebar-icon${isActive ? " is-active" : ""}`
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </NavLink>

        <NavLink
          to={loginRoute}
          aria-label="Login"
          data-label="Login"
          className={({ isActive }) =>
            `ac-sidebar-link ac-sidebar-icon${isActive ? " is-active" : ""}`
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M14 7l5 5-5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 12h13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 5a2 2 0 0 1 2-2h4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 19a2 2 0 0 0 2 2h4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </NavLink>

        <NavLink
          to={marketRoute}
          aria-label="Market"
          data-label="Market"
          className={({ isActive }) =>
            `ac-sidebar-link ac-sidebar-icon${isActive ? " is-active" : ""}`
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3 9l3-5h12l3 5M5 9h14v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 9v10M15 9v10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </NavLink>

        <NavLink
          to={dashboardRoute}
          aria-label="Dashboard"
          data-label="Dashboard"
          className={({ isActive }) =>
            `ac-sidebar-link ac-sidebar-icon${isActive ? " is-active" : ""}`
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
