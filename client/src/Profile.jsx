import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="loading-text">Loading profile...</div>;
  }

  return (
    isAuthenticated &&
    user && (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name || "User"}
            className="profile-picture"
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #63b3ed",
            }}
          />
        )}
        <div style={{ textAlign: "center" }}>
          <div className="profile-name" style={{ fontSize: "2rem", fontWeight: "600", color: "#f7fafc", marginBottom: "0.5rem" }}>
            {user.name}
          </div>
          <div className="profile-email" style={{ fontSize: "1.15rem", color: "#a0aec0" }}>
            {user.email}
          </div>
        </div>
      </div>
    )
  );
};

export default Profile;
