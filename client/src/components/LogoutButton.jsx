// client/src/components/LogoutButton.jsx
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/api/http";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const { setUser } = useAuth();

  async function handleLogout() {
    await fetch(api("/auth/logout"), {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  return (
    <Button onClick={handleLogout} variant="destructive">
      Logout
    </Button>
  );
}
