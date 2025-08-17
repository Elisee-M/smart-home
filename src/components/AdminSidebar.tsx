import { useState } from 'react';
import { Home, Bell, Settings, UserPlus, Users, TrendingUp } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
}

const navigationItems = [
  { 
    id: 'dashboard', 
    title: 'Dashboard', 
    icon: Home,
    description: 'Overview & sensors'
  },
  { 
    id: 'notifications', 
    title: 'Notifications', 
    icon: Bell,
    description: 'Alerts & history'
  },
  { 
    id: 'password', 
    title: 'Change Password', 
    icon: Settings,
    description: 'Security settings'
  },
  { 
    id: 'add-user', 
    title: 'Add New User', 
    icon: UserPlus,
    description: 'User management'
  },
  { 
    id: 'admin-management', 
    title: 'Admin Management', 
    icon: Users,
    description: 'Manage admins'
  },
  { 
    id: 'history', 
    title: 'History', 
    icon: TrendingUp,
    description: 'Data trends'
  },
];

export function AdminSidebar({ activeTab, onTabChange, userName }: AdminSidebarProps) {
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-white/20">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-bold text-white font-orbitron">Smart Home</h2>
            {userName && (
              <p className="text-sm text-white/80 font-space">Welcome, {userName}</p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 font-orbitron">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className={`w-full text-white hover:bg-white/20 transition-colors ${
                      activeTab === item.id 
                        ? 'bg-white/30 text-white font-medium border-l-2 border-accent' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <div className="group-data-[collapsible=icon]:hidden flex-1 text-left">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-white/60">{item.description}</div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}