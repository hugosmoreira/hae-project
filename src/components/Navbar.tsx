import React, { useState } from 'react';
import { Search, User, Settings, MessageCircle, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import logo from '@/assets/logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavLink } from 'react-router-dom';

interface User {
  username: string;
  role: string;
  region: string;
}

interface NavbarProps {
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
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

  const navLinks = [
    { to: '/discussions', label: 'Discussions' },
    { to: '/knowledge-base', label: 'Knowledge Base' },
    { to: '/polls', label: 'Polls' },
    { to: '/benchmarks', label: 'Benchmarks' },
    { to: '/about', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-border/50 shadow-sm">
      {/* Blue accent bar */}
      <div className="h-[3px] bg-gradient-primary w-full" />
      
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink 
              to="/" 
              className="flex items-center gap-3 group"
            >
              <img 
                src={logo} 
                alt="Housing Authority Exchange" 
                className="h-8 w-8"
              />
              <span className="text-lg font-bold text-gradient">
                Housing Authority Exchange
              </span>
            </NavLink>
          </div>

          {/* Navigation Links - Only show when logged in */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-civic-blue ${
                      isActive 
                        ? 'text-civic-blue border-b-2 border-civic-blue' 
                        : 'text-muted-foreground'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Search and Auth */}
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search discussions, knowledge..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-civic-blue text-white">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.role} • {user.region}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                    <span className="ml-auto text-xs text-muted-foreground">MVP</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={onLogin}>
                  Log In
                </Button>
                <Button onClick={() => window.location.href = '/auth'}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search discussions, knowledge..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;