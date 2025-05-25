'use client';
import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Plus, FileText, Send, ChevronDown } from 'lucide-react';

export default function DashboardPage() {
  const quickActions = [
    {
      title: 'New Project',
      description: 'Create a new construction project',
      icon: Plus,
      href: '/dashboard/projects',
      color: 'bg-blue-500',
    },
    {
      title: 'Generate Estimation',
      description: 'Create project cost estimation',
      icon: FileText,
      href: '/dashboard/projects',
      color: 'bg-green-500',
    },
    {
      title: 'Send Agreement',
      description: 'Generate and send project agreement',
      icon: Send,
      href: '/dashboard/projects',
      color: 'bg-purple-500',
    },
  ];

  return (
    <DashboardLayout
      title="Welcome back, User 👋"
      subtitle="Here's what's happening with your projects today"
    >
      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div className="group cursor-pointer">
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`p-4 rounded-full ${action.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 text-center">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  New project "Riverside Residences" created
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Agreement signed for "Greenfield Mall"
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Estimation template updated
                </p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
            <p className="text-xs text-green-600 mt-1">+2 this month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">5</p>
            <p className="text-xs text-blue-600 mt-1">In progress</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">4</p>
            <p className="text-xs text-gray-600 mt-1">This quarter</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹2.4M</p>
            <p className="text-xs text-green-600 mt-1">+15% growth</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}