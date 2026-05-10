import { useState } from "react";
import defaultImg from "../../../assets/default_Profile.jpg";
import { supabase } from "../../../supabaseClient";

const ProfileSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

 const [profile, setProfile] = useState({
  name: storedUser?.name || "username",
  email: storedUser?.email || "user@example.com",

  profileImage:
    storedUser?.profileImage ||
    storedUser?.profile_image ||
    "",
});

 const [imagePreview, setImagePreview] = useState(
  storedUser?.profileImage ||
  storedUser?.profile_image ||
  ""
);
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 🔥 API URLs
  const LOCAL_URL = "http://localhost:5000/api/auth/profile";
  const LIVE_URL =
    "https://screen-time-tracker-vr7o.onrender.com/api/auth/profile";

  const tryFetch = async (url, token) => {
    return fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login again, token missing ❌");
      return;
    }

    let res;

    try {
      res = await tryFetch(LOCAL_URL, token);
      if (!res.ok) throw new Error();
    } catch {
      res = await tryFetch(LIVE_URL, token);
    }

    try {
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Update failed ❌");
        return;
      }

      // ✅ Save updated user (with image)
      localStorage.setItem(
  "user",
  JSON.stringify(data.user)
);
// ✅ ALSO save profile image separately
localStorage.setItem(
  "profileImage",
  data.user.profileImage || ""
);

      alert(data.message || "Profile updated successfully ✅");
      window.location.reload();
    }
    catch (error) {
      console.error("ERROR:", error);
      alert("Server error ❌");
    }
  };

  // 🔥 IMAGE UPLOAD (Supabase)
 const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("profile-images")
    .upload(fileName, file);

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  const { data } = supabase.storage
    .from("profile-images")
    .getPublicUrl(fileName);

  const imageUrl = data.publicUrl;

  setImagePreview(imageUrl);
  setProfile((prev) => ({
    ...prev,
    profileImage: imageUrl,
  }));
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
              src={profile.profileImage || imagePreview || defaultImg}
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