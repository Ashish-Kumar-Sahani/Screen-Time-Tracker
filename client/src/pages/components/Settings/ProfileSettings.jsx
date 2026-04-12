import { useState } from "react";
const ProfileSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
const [profile, setProfile] = useState({
  name: storedUser?.name || "username",
  email: storedUser?.email || "user@example.com"
});
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const [imagePreview, setImagePreview] = useState(
    localStorage.getItem("profileImage") || ""
  );
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login again, token missing ❌");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", { // ✅ FIXED
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email
        })
      });

      const data = await res.json();
      console.log("SERVER RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Update failed ❌");
        return;
      }

      alert(data.message || "Profile updated successfully ✅");

    } catch (error) {
      console.error("ERROR:", error);
      alert("Server error ❌");
    }
  };  // 🔥 IMAGE UPLOAD HANDLER
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
      localStorage.setItem("profileImage", reader.result); // save
    };

    reader.readAsDataURL(file);
  };

  return (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">

  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
    Profile Settings
  </h2>

  <div className="space-y-6">

    {/* 🔥 PROFILE IMAGE */}
    <div className="flex flex-col items-center gap-4">
      
      <div className="relative">
        <img
          src={imagePreview || "/assets/default_Profile.jpg"}
          alt="profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md"
        />

        {/* Upload Icon Overlay */}
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
        placeholder="Enter your name"
        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 
        dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <input
        type="email"
        name="email"
        value={profile.email}
        onChange={handleChange}
        placeholder="Enter your email"
        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700
        dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

    </div>

    {/* BUTTON */}
    <button
      onClick={handleSave}
      className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-200
      text-white py-3 rounded-xl font-medium shadow-md"
    >
      Save Changes
    </button>

  </div>
</div>
  );
};

export default ProfileSettings;