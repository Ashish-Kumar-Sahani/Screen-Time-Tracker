import { useState } from "react";
import API from "../services/api";

const SetLimit = () => {
const [form, setForm] = useState({
    app_name: "",
    daily_limit: ""
});

const [msg, setMsg] = useState("");

const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    await API.post("/limit/set", form);
    setMsg("✅ Limit saved");
    } catch {
    setMsg("❌ Error saving limit");
    }
};

return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
    <h2 className=" text-2xl font-bold flex  text-gray-800 dark:text-white mb-6">Set App Limit</h2>

    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">

        <input
        name="app_name"
        placeholder="App Name"
        onChange={handleChange}
        className="w-full p-3 mt-1 mb-4 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />

        <input
        name="daily_limit"
        type="number"
        placeholder="Limit in minutes"
        onChange={handleChange}
        className="w-full p-3 mt-1 mb-4 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-semibold">
        Save Limit
        </button>

        <p className="mt-4 text-sm text-center text-gray-700 dark:text-gray-200">{msg}</p>

    </form>
    </div>
);
};

export default SetLimit;