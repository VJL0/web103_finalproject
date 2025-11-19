import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ExplorePage from "./ExplorePage";
import Dashboard from "./dashboard";
import QuickPlayPage from "./QuickPlayPage";

function App() {
  const { isAuthenticated, logout } = useAuth0();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
      <Routes>
        {/* Landing / topics / public quizzes */}
        <Route path="/" element={<ExplorePage />} />

        {/* Quick-play trivia using Open Trivia DB (no login required) */}
        <Route path="/quick-play" element={<QuickPlayPage />} />

        {/* Dashboard (protected) */}
        <Route
          path="/dashboard/*"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Optional: /login just routes to home, where the login button lives */}
        <Route path="/login" element={<ExplorePage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
