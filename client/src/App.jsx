import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ExplorePage from "./ExplorePage";
import Dashboard from "./Dashboard";

function App() {
  const { isAuthenticated, isLoading, error, logout } = useAuth0();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <div className="error-title">Oops!</div>
          <div className="error-message">Something went wrong</div>
          <div className="error-sub-message">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<ExplorePage />} />

      {/* Protected dashboard (requires login) */}
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated ? (
            <Dashboard
              onLogout={() =>
                logout({
                  logoutParams: { returnTo: window.location.origin },
                })
              }
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
