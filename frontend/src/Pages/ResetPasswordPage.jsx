import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosInstance from "../Assests/api/axiosInstance";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      alert("Password reset successful. Please sign in.");
      navigate("/auth"); // route to your AuthPage
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Set a new password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4"
          placeholder="New password"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
