import API from "../../../services/api";

const AccountSettings = () => {

  const handleDelete = async () => {
    if (!window.confirm("Delete account permanently?")) return;

    try {
      await API.delete("/auth/delete-account");
      alert("Account deleted Successfully ✅");

      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      alert("Error deleting account");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Account Settings
      </h2>

      <button
        onClick={handleDelete}
        className="bg-red-700 text-white px-4 py-2 rounded-xl"
      >
        Delete Account
      </button>
    </div>
  );
};

export default AccountSettings;