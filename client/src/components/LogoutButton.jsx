// client/src/components/LogoutButton.jsx
import { useAuth } from "../context/AuthContext";

export default function LogoutButton() {
  const { setUser } = useAuth();

  async function handleLogout() {
    await fetch("auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
    >
      Logout
    </button>
  );
}
