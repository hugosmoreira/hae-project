import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { FloatingActionButton } from './FloatingActionButton';
import logo from '@/assets/logo.png';

interface UserProfile {
  username: string;
  role: string;
  region: string;
}

interface DashboardLayoutProps {
  user: UserProfile;
  onLogout: () => void;
  children: React.ReactNode;
}

export function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // TODO: Implement search functionality
    }
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar user={user} onLogout={onLogout} />
        
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 w-full bg-white border-b border-border/50 shadow-sm">
            {/* Blue accent bar */}
            <div className="h-[3px] bg-gradient-primary w-full" />
            
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger 
                className="lg:hidden hover:bg-primary/10 transition-colors" 
                aria-label="Toggle sidebar navigation"
              />
              
              {/* Logo for mobile/when sidebar hidden */}
              <div className="flex items-center gap-2 lg:hidden">
                <img 
                  src={logo} 
                  alt="Housing Authority Exchange" 
                  className="h-8 w-8"
                />
                <span className="text-sm font-bold text-gradient hidden sm:inline">
                  Housing Authority Exchange
                </span>
              </div>
              
              {/* Spacer */}
              <div className="flex-1" />
              
              {/* Global Search */}
              <div className="flex-1 max-w-md">
                <form onSubmit={handleSearch}>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="search"
                      placeholder="Search discussions, knowledge..."
                      className="pl-10 focus-visible:ring-primary/20 focus-visible:ring-4 focus-visible:border-primary transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search discussions and knowledge base"
                    />
                  </div>
                </form>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-primary/10 hover:text-primary transition-all hover:shadow-[0_0_12px_rgba(0,123,195,0.3)]"
                  aria-label="View notifications (2 unread)"
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center" aria-hidden="true">
                    2
                  </span>
                </Button>

                {/* Profile Avatar */}
                <Avatar 
                  className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/30 transition-all cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`User profile for ${user.username}`}
                >
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        
        <FloatingActionButton />
      </div>
    </SidebarProvider>
  );
}