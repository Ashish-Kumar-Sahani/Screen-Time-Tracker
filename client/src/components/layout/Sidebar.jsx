import {
  LayoutDashboard,
  BarChart2,
  Settings,
  LogOut,
  Plus,
  SquarePen
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();                  // context logout
    localStorage.clear();      // remove token
    navigate("/");        // go to login page
  };

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-slate-900 text-white p-6 shadow-2xl">
      <h2 className="text-2xl font-bold mb-12 tracking-wide">
        ScreenTracker
      </h2>

      <ul className="space-y-4">

        <li>
          <NavLink to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg">
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/add-usage" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg">
            <Plus size={18} /> Add Usage
          </NavLink>
        </li>

        <li>
          <NavLink to="/set-limit" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg">
            <SquarePen size={18} /> Set Limit
          </NavLink>
        </li>
        <li>
          <NavLink to="/report" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg">
            <BarChart2 size={18} /> Report
          </NavLink>
        </li>

        <li>
          <NavLink to="/settings" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg">
            <Settings size={18} /> Settings
          </NavLink>
        </li>

        <li
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 hover:bg-white/10 hover:text-red-400 rounded-lg cursor-pointer"
        >
          <LogOut size={18} /> Logout
        </li>

      </ul>
    </div>
  );
};

export default Sidebar;