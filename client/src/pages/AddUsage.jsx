import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AddUsage = () => {
const navigate = useNavigate();

const [form, setForm] = useState({
    app_name: "",
    time_spent: "",
    category: "productive"
});

const [loading, setLoading] = useState(false);
const [msg, setMsg] = useState("");

const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
    await API.post("/usage/add", {
        app_name: form.app_name,
        time_spent: Number(form.time_spent),
        category: form.category
    });

    setMsg("✅ Usage added successfully!");
    setForm({ app_name: "", time_spent: "", category: "productive" });

      // Optional: to the Dashboard
    setTimeout(() => navigate("/dashboard"), 800);

    } catch (err) {
    setMsg(err?.response?.data?.message || "❌ Error adding usage");
    } finally {
    setLoading(false);
    }
};

return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-6">
    <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-2xl shadow"
    >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Add Usage
        </h2>

        <label className="text-sm text-gray-600 dark:text-gray-300">App Name</label>
        <input
        name="app_name"
        value={form.app_name}
        onChange={handleChange}
        placeholder="Instagram / VS Code"
        className="w-full p-3 mt-1 mb-4 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        required
        />

        <label className="text-sm text-gray-600 dark:text-gray-300">Time Spent (minutes)</label>
        <input
        name="time_spent"
        type="number"
        value={form.time_spent}
        onChange={handleChange}
        placeholder="45"
        className="w-full p-3 mt-1 mb-4 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        required
        />

        <label className="text-sm text-gray-600 dark:text-gray-300">Category</label>
        <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full p-3 mt-1 mb-6 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
        <option value="productive">Productive</option>
        <option value="distracting">Distracting</option>
        </select>

        <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-semibold"
        >
        {loading ? "Adding..." : "Add Usage"}
        </button>

        {msg && (
        <p className="mt-4 text-sm text-center text-gray-700 dark:text-gray-200">
            {msg}
        </p>
        )}
    </form>
    </div>
);
};

export default AddUsage;