import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const user =JSON.parse(localStorage.getItem("user"));
  const profileImage = localStorage.getItem("profileImage"); // 🔥 FIX

  const handleMenuChange = (e) => {
    const value = e.target.value;

    if (value === "profile") navigate("/profile");
    if (value === "settings") navigate("/settings");
    if (value === "logout") {
      logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-900 shadow-md p-4 rounded-xl">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Dashboard
      </h1>

      <div className="flex items-center gap-3">
        <span className="text-gray-600 dark:text-gray-300">Welcome, {user?.name}</span>

        <ThemeToggle />

        <select
          onChange={handleMenuChange}
          defaultValue=""
          className="p-2 border rounded-full outline-none border-gray-300 dark:bg-gray-800 dark:text-white"
        >
          <option value="profile">Profile</option>
          <option value="settings">Settings</option>
          <option value="logout">Logout</option>
        </select>
<img
  src={profileImage || "../../public/icons8-test-account-40.png"} // 🔥 FIX
  alt="profile"
  className="w-10 h-10 rounded-full object-cover"
/>
      </div>
    </div>
  );
};

export default Navbar;