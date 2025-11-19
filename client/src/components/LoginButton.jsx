import { useAuth } from "@/auth/AuthContext";
import { Button } from "./ui/button";

export default function LoginButton() {
  const { loginWithGitHub } = useAuth();

  return <Button onClick={loginWithGitHub}>Login with GitHub</Button>;
}
