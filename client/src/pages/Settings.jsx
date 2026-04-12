import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import SettingsMenu from "./components/Settings/SettingsMenu";
import ProfileSettings from "./components/Settings/ProfileSettings";
import PasswordSettings from "./components/Settings/PasswordSettings";
import AppearanceSettings from "./components/Settings/ApprearanceSettings";
import NotificationSettings from "./components/Settings/NotificationSettings";
import DataManagementSettings from "./components/Settings/DataManagementSettings";
import AccountSettings from "./components/Settings/AccountSettings";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "password":
        return <PasswordSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "data":
        return <DataManagementSettings />;
      case "account":
        return <AccountSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar />
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Manage your account, preferences and app settings
          </p>

          <div className="grid lg:grid-cols-4 gap-6">
            <SettingsMenu
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
            <div className="lg:col-span-3">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;