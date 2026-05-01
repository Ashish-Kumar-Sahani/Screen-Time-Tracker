import { useState } from "react";
import defaultImg from "../../../assets/default_Profile.jpg";


const ProfileSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [profile, setProfile] = useState({
    name: storedUser?.name || "username",
    email: storedUser?.email || "user@example.com",
  });
``
  const [imagePreview, setImagePreview] = useState(
    localStorage.getItem("profileImage") || ""
  );

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 🔥 API URLs
  const LOCAL_URL = "http://localhost:5000/api/auth/profile";
  const LIVE_URL =
    "https://screen-time-tracker-vr7o.onrender.com/api/auth/profile";

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login again, token missing ❌");
      return;
    }

    let res;

    try {
      // ✅ First try localhost
      res = await fetch(LOCAL_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
    } catch (err) {
      console.log("Local failed, trying live...");
    }

    try {
      // ✅ If localhost failed OR not ok → try live
      if (!res || !res.ok) {
        res = await fetch(LIVE_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Update failed ❌");
        return;
      }

      // ✅ Save updated user
      localStorage.setItem("user", JSON.stringify(profile));

      alert(data.message || "Profile updated successfully ✅");
    } catch (error) {
      console.error("ERROR:", error);
      alert("Both servers failed ❌");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      localStorage.setItem("profileImage", reader.result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Profile Settings
      </h2>

      <div className="space-y-6">
        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              // 🔥 FIXED PATH
              src={imagePreview || defaultImg}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md"
            />

            <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer shadow">
              📷
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click icon to change profile picture
          </p>
        </div>

        {/* INPUTS */}
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border"
          />

          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;