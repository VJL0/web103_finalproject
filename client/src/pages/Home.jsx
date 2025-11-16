import LoginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";

export default function Home({ user }) {
  return (
    <div>
      <LoginButton />
      <LogoutButton />
    </div>
  );
}
