import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
const navigate = useNavigate();

const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
});

const [msg, setMsg] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
};

const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");

    if (form.password !== form.confirmPassword) {
    setMsg("Passwords do not match ❌");
    return;
    }

    setLoading(true);

    try {
    await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
    });

    setMsg("Registered successfully ✅");
    setTimeout(() => navigate("/login"), 800);
    } catch (err) {
    setMsg(err?.response?.data?.message || "Register failed ❌");
    } finally {
    setLoading(false);
    }
};

return (
    <div className="register-container flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
    <div className="p-10 justify-center items-center flex flex-col bg-white rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <form onSubmit={handleRegister} className="w-full">
        <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 mb-3 border rounded"
            required
        />

        <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 mb-3 border rounded"
            required
        />

        <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
            required
        />

        <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
            required
        />

        <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded"
        >
            {loading ? "Registering..." : "Register"}
        </button>
        </form>

        {msg && <p className="mt-4 text-sm text-center">{msg}</p>}

        <p className="mt-4">
        Already have an account?{" "}
        <Link to="/" className="text-blue-500 hover:underline">
            Login Now
        </Link>
        </p>
    </div>
    </div>
);
}

export default Register;