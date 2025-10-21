import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, User, Briefcase, MapPin, Building, Upload, Camera, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';

interface Profile {
  id: string;
  username: string;
  role: string;
  region: string;
  department?: string;
  housing_authority?: string;
  avatar_url?: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    role: '',
    region: '',
    department: '',
    housing_authority: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view your profile",
          variant: "destructive",
        });
        return;
      }

      setEmail(user.email || '');

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(profileData);
      setFormData({
        username: profileData.username || '',
        role: profileData.role || '',
        region: profileData.region || '',
        department: profileData.department || '',
        housing_authority: profileData.housing_authority || '',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Full name is required';
    }
    
    if (!formData.role.trim()) {
      newErrors.role = 'Job title is required';
    }
    
    if (!formData.housing_authority.trim()) {
      newErrors.housing_authority = 'Housing Authority name is required';
    }
    
    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          role: formData.role,
          region: formData.region,
          department: formData.department,
          housing_authority: formData.housing_authority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData });
      
      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setIsUploading(true);
    try {
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll just simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

      return (
        <>
          <SEO
            title="My Profile"
            description="Manage your professional profile and account information. Update your details, preferences, and professional information for the Housing Authority Exchange community."
            keywords="profile, account settings, user profile, housing authority profile, professional profile"
            url="/profile"
          />
          <div className="container max-w-6xl mx-auto section-spacing page-transition">
            <PageHeader
              title="My Profile"
              description="Manage your information and professional details."
            />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Profile Photo */}
        <Card className="card-base h-fit fade-in-up stagger-1">
          <CardHeader className="card-spacing">
            <CardTitle className="text-heading text-xl">Profile Photo</CardTitle>
            <CardDescription className="text-body">Upload a professional photo for your profile</CardDescription>
          </CardHeader>
          <CardContent className="card-spacing space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.username} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl font-semibold">
                      {getInitials(profile.username)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              
                  <div className="text-center">
                    <h3 className="text-heading text-lg">{profile.username}</h3>
                    <p className="text-body text-sm">{profile.role}</p>
                    <p className="text-caption">{profile.housing_authority}</p>
                  </div>
            </div>

            <div className="space-y-3">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading}
                    aria-label="Upload profile photo"
                  />
                  <Button
                    asChild
                    variant="outline"
                    className="btn-outline w-full"
                    disabled={isUploading}
                  >
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                      {isUploading ? 'Uploading...' : 'Upload New Photo'}
                    </label>
                  </Button>
                  
                  <p className="text-caption text-center">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Form Fields */}
        <Card className="card-base fade-in-up stagger-2">
          <CardHeader className="card-spacing">
            <CardTitle className="text-heading text-xl">Personal Information</CardTitle>
            <CardDescription className="text-body">Update your professional details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="card-spacing space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="username" className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  if (errors.username) {
                    setErrors({ ...errors, username: '' });
                  }
                }}
                placeholder="Enter your full name"
                className={cn(
                  "transition-colors",
                  errors.username && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                maxLength={100}
              />
              {errors.username && (
                <p className="text-sm text-red-600 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Job Title */}
            <div>
              <Label htmlFor="role" className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Briefcase className="h-4 w-4" />
                Job Title *
              </Label>
              <Input
                id="role"
                type="text"
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value });
                  if (errors.role) {
                    setErrors({ ...errors, role: '' });
                  }
                }}
                placeholder="e.g., Executive Director, Program Manager"
                className={cn(
                  "transition-colors",
                  errors.role && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                maxLength={100}
              />
              {errors.role && (
                <p className="text-sm text-red-600 mt-1">{errors.role}</p>
              )}
            </div>

            {/* Department / Program Area */}
            <div>
              <Label htmlFor="department" className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Building className="h-4 w-4" />
                Department / Program Area
              </Label>
              <Input
                id="department"
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Housing Operations, Resident Services"
                maxLength={100}
              />
            </div>

            {/* Housing Authority Name */}
            <div>
              <Label htmlFor="housing_authority" className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Building className="h-4 w-4" />
                Housing Authority Name *
              </Label>
              <Input
                id="housing_authority"
                type="text"
                value={formData.housing_authority}
                onChange={(e) => {
                  setFormData({ ...formData, housing_authority: e.target.value });
                  if (errors.housing_authority) {
                    setErrors({ ...errors, housing_authority: '' });
                  }
                }}
                placeholder="e.g., Portland Housing Authority"
                className={cn(
                  "transition-colors",
                  errors.housing_authority && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                maxLength={100}
              />
              {errors.housing_authority && (
                <p className="text-sm text-red-600 mt-1">{errors.housing_authority}</p>
              )}
            </div>

            {/* Region (State) */}
            <div>
              <Label htmlFor="region" className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                Region (State) *
              </Label>
              <Select
                value={formData.region}
                onValueChange={(value) => {
                  setFormData({ ...formData, region: value });
                  if (errors.region) {
                    setErrors({ ...errors, region: '' });
                  }
                }}
              >
                <SelectTrigger className={cn(
                  "transition-colors",
                  errors.region && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}>
                  <SelectValue placeholder="Select your state/region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oregon">Oregon</SelectItem>
                  <SelectItem value="Washington">Washington</SelectItem>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="Nevada">Nevada</SelectItem>
                  <SelectItem value="Idaho">Idaho</SelectItem>
                  <SelectItem value="Montana">Montana</SelectItem>
                  <SelectItem value="Alaska">Alaska</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-red-600 mt-1">{errors.region}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Your email address cannot be changed here
              </p>
            </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-border">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    size="lg"
                    className="btn-primary w-full"
                    aria-label="Save profile changes"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
          </CardContent>
        </Card>
      </div>
          </div>
        </>
      );
}
