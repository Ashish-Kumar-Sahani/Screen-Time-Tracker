import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const Reports = () => {
  const [usage, setUsage] = useState([]);
  const [limits, setLimits] = useState([]);
  const [limitStatus, setLimitStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("status");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [usageRes, limitsRes, statusRes] = await Promise.all([
          API.get("/usage/all"),
          API.get("/limit/all"),
          API.get("/limit/status")
        ]);

        setUsage(usageRes.data || []);
        setLimits(limitsRes.data || []);
        setLimitStatus(statusRes.data || []);
      } catch (err) {
        console.error("Reports load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "exceeded") {
      return "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700";
    }
    if (status === "warning") {
      return "bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700";
    }
    return "bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700";
  };

  const tabClass = (tabName) =>
    `px-4 py-2 rounded-lg font-medium transition ${
      activeTab === tabName
        ? "bg-indigo-600 text-white"
        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
    }`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 p-6">
        <Navbar />

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            View usage history, app limits and today limit status
          </p>

          {/* Tabs */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab("status")}
              className={tabClass("status")}
            >
              Limit Status
            </button>

            <button
              onClick={() => setActiveTab("usage")}
              className={tabClass("usage")}
            >
              Usage History
            </button>

            <button
              onClick={() => setActiveTab("limits")}
              className={tabClass("limits")}
            >
              App Limits
            </button>
          </div>

          {/* TAB 1: LIMIT STATUS */}
          {activeTab === "status" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Today Limit Status
              </h2>

              {limitStatus.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {limitStatus.map((item, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-4 shadow ${getStatusStyle(item.status)}`}
                    >
                      <h3 className="font-semibold text-lg mb-2">{item.app_name}</h3>
                      <p>Daily Limit: {item.daily_limit} min</p>
                      <p>Today Usage: {item.today_usage} min</p>
                      <p className="mt-2 font-medium capitalize">
                        Status: {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No limit status available.
                </p>
              )}
            </div>
          )}

          {/* TAB 2: USAGE HISTORY */}
          {activeTab === "usage" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Usage History
              </h2>

              {usage.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-600 dark:text-gray-300">
                      <th className="py-3 px-2">App Name</th>
                      <th className="py-3 px-2">Time Spent</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200"
                      >
                        <td className="py-3 px-2">{item.app_name}</td>
                        <td className="py-3 px-2">{item.time_spent} min</td>
                        <td className="py-3 px-2 capitalize">{item.category || "N/A"}</td>
                        <td className="py-3 px-2">
                          {item.usage_date
                            ? new Date(item.usage_date).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No usage history found.
                </p>
              )}
            </div>
          )}

          {/* TAB 3: APP LIMITS */}
          {activeTab === "limits" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                App Limits
              </h2>

              {limits.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-600 dark:text-gray-300">
                      <th className="py-3 px-2">App Name</th>
                      <th className="py-3 px-2">Daily Limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {limits.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200"
                      >
                        <td className="py-3 px-2">{item.app_name}</td>
                        <td className="py-3 px-2">{item.daily_limit} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No app limits found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;