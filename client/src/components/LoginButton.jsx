// client/src/components/LoginButton.jsx
export default function LoginButton() {
  function handleLogin() {
    window.location.href = "/auth/github";
  }

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
    >
      Login with GitHub
    </button>
  );
}
