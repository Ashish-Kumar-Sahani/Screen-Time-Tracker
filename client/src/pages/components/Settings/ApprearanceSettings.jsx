import { useState } from "react";

const AppearanceSettings = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Appearance
      </h2>

      <button
        onClick={toggleMode}
        className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
      >
        Toggle {darkMode ? "Light" : "Dark"} Mode
      </button>
    </div>
  );
};

export default AppearanceSettings;