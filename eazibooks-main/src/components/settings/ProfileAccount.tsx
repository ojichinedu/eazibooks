import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { User, Mail, Lock, Upload, Loader2, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../utils/supabase/client';
import { useAuth } from '../../utils/AuthContext';
import { withTimeout, queryCache } from '../../utils/queryHelpers';

export function ProfileAccount() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // Check cache first
      const cacheKey = 'user-profile';
      const cached = queryCache.get(cacheKey);
      
      if (cached) {
        setProfile(cached);
        setIsLoading(false);
        // Load in background to refresh
        loadProfileFromDatabase(cacheKey);
        return;
      }

      await loadProfileFromDatabase(cacheKey);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setLoadError(error.message);
      
      if (error.message === 'Request timeout') {
        toast.error('Loading timed out. Please check your internet connection.');
      } else if (!error.message?.includes('Database not set up')) {
        toast.error('Failed to load profile. Check your Supabase connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfileFromDatabase = async (cacheKey: string) => {
    await withTimeout(
      (async () => {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!authUser) throw new Error('No authenticated user');

        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email, phone, avatar_url')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          const newProfile = {
            fullName: profileData?.full_name || user?.name || '',
            email: profileData?.email || authUser.email || '',
            phone: profileData?.phone || '',
            avatarUrl: profileData?.avatar_url || ''
          };

          setProfile(newProfile);
          // Cache the result
          queryCache.set(cacheKey, newProfile, 5 * 60 * 1000); // 5 minutes
        } catch (dbError: any) {
          console.warn('Database error loading profile:', dbError);
          
          if (dbError.message?.includes('relation') || dbError.message?.includes('does not exist')) {
            throw new Error('Database not set up');
          } else if (dbError.code !== 'PGRST116') {
            throw dbError;
          }
          
          // Set default values if profile doesn't exist
          setProfile({
            fullName: user?.name || '',
            email: authUser.email || '',
            phone: '',
            avatarUrl: ''
          });
        }
      })(),
      5000, // 5 second timeout
      'Request timeout'
    );
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profile.fullName,
            phone: profile.phone,
            avatar_url: profile.avatarUrl
          })
          .eq('id', authUser.id);

        if (error) throw error;
        
        // Clear cache and update local state
        queryCache.clear('user-profile');
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;
      
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        toast.error('Please log in to upload avatar');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('user-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
          toast.error('Storage bucket not set up. Please create "user-assets" bucket in Supabase Storage.');
        } else {
          toast.error(`Upload failed: ${uploadError.message}`);
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('user-assets')
        .getPublicUrl(filePath);

      setProfile({ ...profile, avatarUrl: publicUrl });
      toast.success('Avatar uploaded successfully! Remember to save your profile.');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      if (!error.message?.includes('Storage')) {
        toast.error('Failed to upload avatar. Check console for details.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
        {loadError && (
          <div className="mt-4 p-4 border rounded-lg bg-muted max-w-md">
            <p className="text-sm text-destructive mb-2">{loadError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadProfile}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-start gap-6">
            {profile.avatarUrl ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2">
                <img 
                  src={profile.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                PNG, JPG or GIF. Maximum size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Enter new password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Active Sessions</h3>
              <p className="text-sm text-muted-foreground">
                View and manage your active login sessions
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
