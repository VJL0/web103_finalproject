import { useAuth } from "@/auth/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Loading...</p>;
  if (!user)
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;

  return <Outlet />;
}
