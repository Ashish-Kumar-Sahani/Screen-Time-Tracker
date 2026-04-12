import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import StatCard from "../components/ui/StatCard";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import API from "../services/api";

const Dashboard = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [today, setToday] = useState({
    totalScreenTime: 0,
    appCount: 0,
    apps: []
  });
  const [score, setScore] = useState({
    totalTime: 0,
    productiveTime: 0,
    productivityScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [weeklyGraphRes, todayRes, scoreRes] = await Promise.all([
          API.get("/usage/weekly-graph"),
          API.get("/usage/today-summary"),
          API.get("/usage/productivity-score")
        ]);

        const graph = (weeklyGraphRes.data || []).map((row) => {
          const d = new Date(row.usageDate);
          const day = d.toLocaleDateString("en-US", { weekday: "short" });

          return {
            day,
            hours: Number((row.totalTime / 60).toFixed(1)),
            productiveHours: Number((row.productiveTime / 60).toFixed(1))
          };
        });

        setWeeklyData(graph);
        setToday(todayRes.data);
        setScore(scoreRes.data);
      } catch (err) {
        console.error("Dashboard API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-950">
        Loading dashboard...
      </div>
    );
  }

  const todayHours = Number((today.totalScreenTime / 60).toFixed(1));
  const totalWeekHours = Number((score.totalTime / 60).toFixed(1));

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 p-6">
        <Navbar />

        <div className="mt-6">
          {/* PAGE HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Track your productivity this week
            </p>
          </div>

          {/* STAT CARDS */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Today Hours"
              value={`${todayHours}h`}
              icon="⏱️"
              trend={0}
              trendText="today"
            />
            <StatCard
              title="Productivity Score"
              value={`${score.productivityScore}%`}
              icon="📊"
              trend={0}
              trendText="this week"
            />
            <StatCard
              title="Week Total Hours"
              value={`${totalWeekHours}h`}
              icon="📅"
              trend={0}
              trendText="last 7 days"
            />
          </div>

          {/* MAIN CONTENT */}
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md"
            >
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Weekly Usage (Hours)
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#6366f1"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="productiveHours"
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Purple = Total, Green = Productive
              </p>
            </motion.div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Today App Summary
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Total apps used: <span className="font-semibold">{today.appCount}</span>
              </p>

              <div className="space-y-3">
                {today.apps?.length ? (
                  today.apps.map((a, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm text-gray-700 dark:text-gray-200"
                    >
                      <span>{a.app_name}</span>
                      <span className="font-medium">{Math.round(a.total_time)} min</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No usage added today.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;