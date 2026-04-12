const SettingsMenu = ({ activeSection, setActiveSection }) => {
  const menuBtnClass = (section) =>
    `w-full text-left px-4 py-3 rounded-xl transition font-medium ${
      activeSection === section
        ? "bg-indigo-600 text-white"
        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="space-y-3">
      <button onClick={() => setActiveSection("profile")} className={menuBtnClass("profile")}>
        Profile Settings
      </button>
      <button onClick={() => setActiveSection("password")} className={menuBtnClass("password")}>
        Change Password
      </button>
      <button onClick={() => setActiveSection("appearance")} className={menuBtnClass("appearance")}>
        Appearance
      </button>
      <button onClick={() => setActiveSection("notifications")} className={menuBtnClass("notifications")}>
        Notifications
      </button>
      <button onClick={() => setActiveSection("data")} className={menuBtnClass("data")}>
        Data Management
      </button>
      <button onClick={() => setActiveSection("account")} className={menuBtnClass("account")}>
        Account
      </button>
    </div>
  );
};

export default SettingsMenu;