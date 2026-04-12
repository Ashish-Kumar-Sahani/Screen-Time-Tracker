import { useState } from "react";

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    alerts: true
  });

  const handleChange = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Notification Settings
      </h2>

      <div className="space-y-4">
        
        {/* Email Notifications */}
        <label className="flex items-center justify-between p-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
          <span className="text-gray-700 dark:text-white">
            Email Notifications
          </span>
          <input
            type="checkbox"
            name="email"
            checked={notifications.email}
            onChange={handleChange}
            className="w-5 h-5 accent-indigo-600 cursor-pointer"
          />
        </label>

        {/* Limit Alerts */}
        <label className="flex items-center justify-between p-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
          <span className="text-gray-700 dark:text-white">
            Limit Alerts
          </span>
          <input
            type="checkbox"
            name="alerts"
            checked={notifications.alerts}
            onChange={handleChange}
            className="w-5 h-5 accent-indigo-600 cursor-pointer"
          />
        </label>

      </div>
    </div>
  );
};

export default NotificationSettings;