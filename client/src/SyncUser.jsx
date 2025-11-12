import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export default function SyncUser() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated) return;
      try {
        const token = await getAccessTokenSilently({
          audience: import.meta.env.VITE_AUTH0_AUDIENCE, // must match server/.env AUTH0_AUDIENCE
        });
        await fetch("http://localhost:3000/api/users/me", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error("User sync failed:", e);
      }
    };
    run();
  }, [isAuthenticated, getAccessTokenSilently]);

  return null;
}
