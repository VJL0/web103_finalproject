import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar (mobile top bar + desktop sidebar) */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-3rem)] p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
