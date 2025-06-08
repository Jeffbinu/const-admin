'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  isSidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  actions, 
  isSidebarCollapsed = false 
}) => {
  const [notificationCount, setNotificationCount] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Load user data (in production, this might come from context or props)
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Fallback user data
        setUser({ name: 'John Doe', email: 'john@omegabuilders.com' });
      }
    } catch (error) {
      console.warn('Could not load user data:', error);
      setUser({ name: 'User', email: 'user@omegabuilders.com' });
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleNotificationClick = () => {
    // In production, you might open a notifications panel
    console.log('Notifications clicked');
    // For demo, reduce count
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    // Navigate to profile page
    console.log('Navigate to profile');
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    // Navigate to settings page
    console.log('Navigate to settings');
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    // Clear auth data and redirect
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header 
      className={cn(
        "bg-white shadow-sm border-b border-gray-200 relative z-30",
        // Add left padding on mobile to account for menu button
        "pl-16 md:pl-0"
      )}
      style={{
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div 
        className={cn(
          "flex items-center justify-between py-4",
          // Adjust padding based on sidebar state - more space when collapsed
          isSidebarCollapsed ? "px-4 md:px-6" : "px-6 md:px-8"
        )}
        style={{
          transition: 'padding 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Left side - Title and Subtitle */}
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Right side - Actions and User Menu */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Custom Actions */}
          {actions && (
            <div className="hidden md:flex items-center space-x-2">
              {actions}
            </div>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={handleNotificationClick}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>

          {/* User Menu */}
          <div className="relative" data-user-menu>
            <Button
              variant="ghost"
              onClick={handleUserMenuToggle}
              className={cn(
                "flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200",
                showUserMenu && "bg-gray-100 text-gray-900"
              )}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium truncate max-w-24">
                  {user?.name || 'User'}
                </p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200 hidden md:block",
                showUserMenu && "rotate-180"
              )} />
            </Button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'user@omegabuilders.com'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  >
                    Settings
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Actions (if any) */}
      {actions && (
        <div className="md:hidden px-6 pb-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 pt-4">
            {actions}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;