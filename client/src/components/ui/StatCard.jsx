import { motion } from "framer-motion";

const StatCard = ({ title, value, icon, trend, trendText }) => {
  const isPositive = trend >= 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="relative bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                shadow-md hover:shadow-2xl
                transition-all duration-300
                rounded-2xl p-6 overflow-hidden"
    >
      {/* Subtle Gradient Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 opacity-10 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">
          {title}
        </h3>

        <div className="flex items-center justify-center w-10 h-10
                        rounded-xl bg-indigo-100 dark:bg-indigo-800 text-xl">
          {icon}
        </div>
      </div>

      {/* Animated Value */}
      <p className="text-3xl font-bold mt-4 text-gray-800 dark:text-white">
      {value}
      </p>

      {/* Trend */}
      <p
        className={`text-sm mt-3 font-medium ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? "↑" : "↓"} {Math.abs(trend)}% {trendText}
      </p>
    </motion.div>
  );
};

export default StatCard;