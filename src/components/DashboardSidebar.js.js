import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Radio, Mic, User, Tv, LogOut, X } from "lucide-react";

function DashboardSidebar({ onLogout, closeSidebar }) {
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/dashboard/stations", label: "Stations", icon: <Radio size={20} /> },
    { to: "/dashboard/shows", label: "Shows", icon: <Mic size={20} /> },
    { to: "/dashboard/presenters", label: "Presenters", icon: <User size={20} /> },
    { to: "/dashboard/ads", label: "Ads", icon: <Tv size={20} /> },
  ];

  return (
    <div className="h-full bg-white border-r shadow-sm w-64 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold text-orange-500">TangazoChapChap</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Dashboard</p>
        </div>
        <button className="md:hidden" onClick={closeSidebar}>
          <X size={22} className="text-gray-600" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? "bg-orange-100 text-orange-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 border-t"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
}

export default DashboardSidebar;
