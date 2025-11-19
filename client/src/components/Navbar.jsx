import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { Menu } from "lucide-react";

function NavLinkItem({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Button
      variant="ghost"
      asChild
      className={`text-sm font-medium ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Link to={to}>{label}</Link>
    </Button>
  );
}

export default function Navbar() {
  const { user, loginWithGitHub, logout } = useAuth();

  const initials = user?.github_username
    ? user.github_username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-3 sm:px-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
              beta
            </span>
            <span className="text-base font-semibold sm:text-lg">
              quizlet2.O
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLinkItem to="/explore" label="Explore" />

          {!user && (
            <Button onClick={loginWithGitHub} size="sm">
              Sign in with GitHub
            </Button>
          )}

          {user && (
            <>
              <NavLinkItem to="/dashboard" label="Dashboard" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-8 w-8">
                      {user.avatar_url && (
                        <AvatarImage
                          src={user.avatar_url}
                          alt={user.github_username}
                        />
                      )}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Signed in as
                    <div className="font-medium text-foreground">
                      {user.github_username}
                    </div>
                  </div>
                  <Separator className="my-1" />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </nav>

        {/* Mobile nav (sheet) */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <Avatar className="h-8 w-8">
              {user.avatar_url && (
                <AvatarImage src={user.avatar_url} alt={user.github_username} />
              )}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetHeader className="mb-4">
                <SheetTitle>quizlet2.O</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-2">
                <Button variant="ghost" asChild onClick={() => {}}>
                  <Link to="/">Home</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/explore">Explore</Link>
                </Button>

                {user ? (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    <Separator className="my-2" />
                    <Button
                      variant="destructive"
                      onClick={logout}
                      className="justify-start"
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={loginWithGitHub}
                    className="mt-2"
                    variant="default"
                  >
                    Sign in with GitHub
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
