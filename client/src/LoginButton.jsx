import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleGoogleLogin = () => {
    loginWithRedirect({
      connection: "google-oauth2", // Auth0's default Google connection name
    });
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="button login"
    >
      Continue with Google
    </button>
  );
};

export default LoginButton;
