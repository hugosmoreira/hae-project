import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Info,
  Settings,
  LogOut,
  UserCircle,
  Hash
} from 'lucide-react';
import logo from '@/assets/logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface UserProfile {
  username: string;
  role: string;
  region: string;
}

interface DashboardSidebarProps {
  user: UserProfile;
  onLogout: () => void;
}

const mainNavigationItems = [
  { title: 'Discussions', url: '/discussions', icon: MessageCircle },
  { title: 'Knowledge Base', url: '/knowledge-base', icon: BookOpen },
  { title: 'Chat', url: '/chat', icon: Hash },
  { title: 'Polls', url: '/polls', icon: BarChart3 },
  { title: 'Benchmarks', url: '/benchmarks', icon: TrendingUp },
];

const resourceItems = [
  { title: 'About', url: '/about', icon: Info },
];

const accountItems = [
  { title: 'Profile', url: '/profile', icon: UserCircle, disabled: false },
  { title: 'Settings', url: '/settings', icon: Settings, disabled: false },
];

export function DashboardSidebar({ user, onLogout }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path || (path === '/discussions' && currentPath === '/');
  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className={`${isCollapsed ? 'w-16' : 'w-64'} border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground`} collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo/App Name */}
        <div className="p-4 border-b border-sidebar-border">
          {!isCollapsed ? (
            <NavLink 
              to="/" 
              className="flex items-center gap-3 group"
            >
              <img 
                src={logo} 
                alt="Housing Authority Exchange" 
                className="h-8 w-8 flex-shrink-0"
              />
              <span className="text-base font-bold text-gradient">
                Housing Authority Exchange
              </span>
            </NavLink>
          ) : (
            <NavLink to="/" className="flex justify-center">
              <img 
                src={logo} 
                alt="Housing Authority Exchange" 
                className="h-8 w-8"
              />
            </NavLink>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 space-y-4 py-4">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className={`${isCollapsed ? 'sr-only' : ''} text-sidebar-foreground/70 font-medium`}>
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainNavigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-foreground'
                          }`
                        }
                        title={isCollapsed ? item.title : undefined}
                        aria-label={`Navigate to ${item.title}`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Resources */}
          <SidebarGroup>
            <SidebarGroupLabel className={`${isCollapsed ? 'sr-only' : ''} text-sidebar-foreground/70 font-medium`}>
              Resources
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {resourceItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-foreground'
                          }`
                        }
                        title={isCollapsed ? item.title : undefined}
                        aria-label={`Navigate to ${item.title}`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Account */}
          <SidebarGroup>
            <SidebarGroupLabel className={`${isCollapsed ? 'sr-only' : ''} text-sidebar-foreground/70 font-medium`}>
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {accountItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild={!item.disabled}>
                      {item.disabled ? (
                        <div className="flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground/40 cursor-not-allowed">
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </div>
                      ) : (
                        <NavLink 
                          to={item.url} 
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-foreground'
                            }`
                          }
                          title={isCollapsed ? item.title : undefined}
                          aria-label={`Navigate to ${item.title}`}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed ? (
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {getInitials(user.username)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.username}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user.role} • {user.region}
                  </p>
                </div>
              </div>
              
              <Separator className="bg-sidebar-border" />
              
              {/* Logout Action */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent/20"
                onClick={onLogout}
                aria-label="Log out of your account"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log Out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-2">
                {getInitials(user.username)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full p-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent/20"
                onClick={onLogout}
                title="Log Out"
                aria-label="Log out of your account"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}