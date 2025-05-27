"use client";
import React from "react";

import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  className,
}) => {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <Header title={title} subtitle={subtitle} actions={headerActions} />

        <main className={cn("flex-1 overflow-y-auto p-4 md:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
};

export { Sidebar, Header, DashboardLayout };
