"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface SidebarProps {
  className?: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Configurations", href: "/dashboard/configurations", icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Event handlers
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // Clear auth data
      ["isAuthenticated", "user", "token"].forEach(key => {
        localStorage.removeItem(key);
      });
      
      setIsMobileMenuOpen(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  }, []);

  // Effects
  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Memoized active items
  const activeItems = useMemo(() => {
    return NAVIGATION_ITEMS.map(item => ({
      ...item,
      isActive: pathname === item.href || 
        (item.href !== "/dashboard" && pathname.startsWith(item.href))
    }));
  }, [pathname]);

  // Navigation item component
  const NavigationItem = React.memo(({ 
    item, 
    isActive, 
    isMobile,
    onClick 
  }: {
    item: NavigationItem & { isActive: boolean };
    isActive: boolean;
    isMobile: boolean;
    onClick?: () => void;
  }) => (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center text-sm font-medium rounded-lg transition-all duration-200 ease-out px-3 py-2.5",
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <item.icon
        className={cn(
          "flex-shrink-0 h-5 w-5 mr-3 transition-colors duration-200",
          isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
        )}
      />

      <span className="truncate transition-opacity duration-200">
        {item.name}
      </span>

      {item.badge && (
        <span
          className={cn(
            "ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full",
            isActive ? "bg-blue-500 text-blue-100" : "bg-gray-200 text-gray-600"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  ));

  NavigationItem.displayName = "NavigationItem";

  // Sidebar content component
  const SidebarContent = React.memo(({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-6 border-b border-gray-200 h-16">
        <span className="text-xl font-bold text-gray-900 truncate">
          Omega Builders
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-1">
        {activeItems.map((item) => (
          <NavigationItem
            key={item.name}
            item={item}
            isActive={item.isActive}
            isMobile={isMobile}
            onClick={isMobile ? handleMobileMenuClose : undefined}
          />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
          <span className="transition-opacity duration-200">
            Logout
          </span>
        </Button>
      </div>
    </div>
  ));

  SidebarContent.displayName = "SidebarContent";

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 z-40",
          className
        )}
      >
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white shadow-sm overflow-hidden">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
          className="bg-white shadow-lg border-gray-200 hover:bg-gray-50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 flex z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={handleMobileMenuClose}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-out shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMobileMenuClose}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <SidebarContent isMobile />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;