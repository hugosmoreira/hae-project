import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Bell, Moon, Sun, Type, LogOut, Save, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [notifications, setNotifications] = useState({
    newReplies: true,
    mentions: true,
    newPolls: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view settings",
          variant: "destructive",
        });
        return;
      }

      // Load saved preferences from localStorage
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
      const savedFontSize = localStorage.getItem('fontSize') as 'normal' | 'large' || 'normal';
      const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '{"newReplies":true,"mentions":true,"newPolls":true}');
      
      setTheme(savedTheme);
      setFontSize(savedFontSize);
      setNotifications(savedNotifications);
      
      // Apply theme
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Apply font size
      if (savedFontSize === 'large') {
        document.documentElement.classList.add('text-lg');
      } else {
        document.documentElement.classList.remove('text-lg');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: "Success",
        description: "Your password has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    // Save preferences to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    toast({
      title: "Success",
      description: "Your settings have been saved",
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };

  const handleFontSizeChange = (value: 'normal' | 'large') => {
    setFontSize(value);
    if (value === 'large') {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }
    localStorage.setItem('fontSize', value);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Settings"
        description="Manage your account settings, notification preferences, and appearance options. Customize your Housing Authority Exchange experience."
        keywords="settings, account settings, preferences, notifications, appearance, user settings, housing authority settings"
        url="/settings"
      />
      <div className="container max-w-4xl mx-auto section-spacing page-transition">
        <PageHeader
          title="Settings"
          description="Manage your account settings and preferences"
        />

      <div className="space-y-6">
        {/* Account Settings */}
        <Card className="card-base fade-in-up stagger-1">
          <CardHeader className="card-spacing pb-4">
            <CardTitle className="text-heading text-xl flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Account Settings
            </CardTitle>
            <CardDescription className="text-body">Update your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="card-spacing space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                  Current Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="pr-10"
                  />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current')}
                        aria-label={showPasswords.current ? "Hide current password" : "Show current password"}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        )}
                      </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="pr-10"
                  />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new')}
                        aria-label={showPasswords.new ? "Hide new password" : "Show new password"}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        )}
                      </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="pr-10"
                  />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('confirm')}
                        aria-label={showPasswords.confirm ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        )}
                      </Button>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleUpdatePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="btn-primary"
              aria-label="Update your password"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="card-base fade-in-up stagger-2">
          <CardHeader className="card-spacing pb-4">
            <CardTitle className="text-heading text-xl flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription className="text-body">Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="card-spacing space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="newReplies" className="text-sm font-medium text-gray-900">
                  New Replies to My Posts
                </Label>
                <p className="text-sm text-gray-600">
                  Get notified when someone replies to your discussions
                </p>
              </div>
                  <Switch
                    id="newReplies"
                    checked={notifications.newReplies}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, newReplies: checked })
                    }
                    aria-label="Toggle notifications for new replies to your posts"
                  />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="mentions" className="text-sm font-medium text-gray-900">
                  Mentions (@ me)
                </Label>
                <p className="text-sm text-gray-600">
                  Get notified when someone mentions you in a discussion
                </p>
              </div>
                  <Switch
                    id="mentions"
                    checked={notifications.mentions}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, mentions: checked })
                    }
                    aria-label="Toggle notifications for mentions"
                  />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="newPolls" className="text-sm font-medium text-gray-900">
                  New Polls Created
                </Label>
                <p className="text-sm text-gray-600">
                  Get notified when new polls are created in your channels
                </p>
              </div>
                  <Switch
                    id="newPolls"
                    checked={notifications.newPolls}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, newPolls: checked })
                    }
                    aria-label="Toggle notifications for new polls"
                  />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="card-base fade-in-up stagger-3">
          <CardHeader className="card-spacing pb-4">
            <CardTitle className="text-heading text-xl flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription className="text-body">Customize your visual experience</CardDescription>
          </CardHeader>
          <CardContent className="card-spacing space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="theme" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  {theme === 'light' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  Theme
                </Label>
                <p className="text-sm text-gray-600">
                  Switch between light and dark mode
                </p>
              </div>
                  <Switch
                    id="theme"
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    aria-label="Toggle between light and dark theme"
                  />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="fontSize" className="text-sm font-medium text-gray-900">
                Font Size
              </Label>
              <Select value={fontSize} onValueChange={handleFontSizeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                Choose the text size that's most comfortable for you
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSaveSettings}
            size="lg"
            className="btn-primary"
            aria-label="Save all settings changes"
          >
            <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            Save Changes
          </Button>
        </div>

        {/* Logout Button */}
        <div className="flex justify-start pt-4 border-t border-border">
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="lg"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            aria-label="Log out of your account"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}
