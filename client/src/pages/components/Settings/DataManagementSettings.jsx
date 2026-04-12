import API from "../../../services/api";

const DataManagementSettings = () => {

  const handleClear = async () => {
    if (!window.confirm("Clear all usage history?")) return;

    try {
      await API.delete("/usage/clear");
      alert("Usage history cleared ✅");
    } catch (err) {
      alert("Error clearing data ❌");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Data Management
      </h2>

      <button
        onClick={handleClear}
        className="bg-red-600 text-white px-4 py-2 rounded-xl"
      >
        Clear Usage History
      </button>
    </div>
  );
};

export default DataManagementSettings;