import LoginButton from "@/components/LoginButton";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-9/10 flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="text-sm text-gray-600">
          Use your GitHub account to continue
        </p>

        <LoginButton />
      </div>
    </div>
  );
}
