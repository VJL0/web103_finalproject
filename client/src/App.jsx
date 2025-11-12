import { useAuth0 } from "@auth0/auth0-react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import Profile from "./Profile";
import Dashboard from "./dashboard";

function Landing() {
  return (
    <div className="app-container">
      <div className="main-card-wrapper">
        <img
          src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png"
          alt="Auth0 Logo"
          className="auth0-logo"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <h1 className="main-title">Welcome to QuizPath</h1>

        <div className="action-card">
          <p className="action-text">
            Sign in to create quiz cards and share them with others.
          </p>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}

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
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
        }
      />
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated ? (
            <Dashboard
              onLogout={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
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
