import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { LayoutDashboard, Library, PlusCircle, Tags, Menu } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/decks", label: "My decks", icon: Library },
  { to: "/dashboard/decks/new", label: "Create deck", icon: PlusCircle },
  { to: "/dashboard/tags", label: "Tags", icon: Tags },
];

function SidebarLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  const initials = user?.github_username
    ? user.github_username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <>
      {/* 🌟 MOBILE TOP BAR (LIGHT THEME) */}
      <header className="flex h-12 items-center justify-between border-b bg-white px-3 shadow-sm md:hidden">
        <Link to="/dashboard" className="text-sm font-semibold">
          quizlet2.O
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <Avatar className="h-7 w-7">
              {user.avatar_url && (
                <AvatarImage src={user.avatar_url} alt={user.github_username} />
              )}
              <AvatarFallback className="bg-muted text-foreground text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            {/* 🌟 MOBILE SHEET MENU */}
            <SheetContent
              side="left"
              className="flex flex-col p-0 bg-white border-r"
            >
              <SheetHeader className="px-4 pt-4 pb-2 text-left">
                <SheetTitle>quizlet2.O</SheetTitle>
                {user && (
                  <p className="text-xs text-muted-foreground">
                    Signed in as{" "}
                    <span className="font-medium">{user.github_username}</span>
                  </p>
                )}
              </SheetHeader>

              <Separator />

              <ScrollArea className="flex-1 px-3 py-3">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Dashboard
                </p>

                <div className="mt-1 space-y-1">
                  {navItems.map((item) => (
                    <SidebarLink key={item.to} {...item} />
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t px-3 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={logout}
                >
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* 🌟 DESKTOP SIDEBAR (LIGHT THEME) */}
      <aside className="hidden h-screen w-60 flex-col border-r bg-white md:flex">
        {/* User section */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Avatar className="h-9 w-9">
            {user?.avatar_url && (
              <AvatarImage src={user.avatar_url} alt={user.github_username} />
            )}
            <AvatarFallback className="bg-muted text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="text-sm font-semibold">quizlet2.O</div>
            {user && (
              <div className="text-xs text-muted-foreground truncate">
                {user.github_username}
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-3 py-3">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Dashboard
          </p>

          <div className="mt-1 space-y-1">
            {navItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </div>
        </ScrollArea>

        {/* Logout */}
        <div className="border-t px-3 py-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={logout}
          >
            Log out
          </Button>
        </div>
      </aside>
    </>
  );
}
