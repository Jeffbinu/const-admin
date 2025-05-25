import React from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: TabItem[] | any[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className }:any) => {
  return (
    <div className={cn("w-full", className)}>
      <nav className="flex space-x-8 border-b border-gray-200" aria-label="Tabs">
        {tabs.map((tab:any) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 cursor-pointer",  
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                "inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full",
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-6">
        {tabs.find((tab:any) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
Tabs.displayName = "Tabs";
export { Tabs };