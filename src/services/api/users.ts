import { BaseApiService, type ApiResponse, type PaginationParams, type SortParams, type FilterParams } from './base';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions
type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

type UserRole = Database['public']['Tables']['user_roles']['Row'];
type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];

type UserWithProfile = {
  id: string;
  email?: string;
  created_at: string;
  profile: Profile;
  roles: UserRole[];
};

type UserStats = {
  total_users: number;
  users_by_role: Record<string, number>;
  users_by_region: Record<string, number>;
  active_users: number;
  new_users_this_month: number;
};

type UserActivity = {
  user_id: string;
  username: string;
  role: string;
  region: string;
  last_activity: string;
  discussions_count: number;
  replies_count: number;
  articles_count: number;
  polls_created: number;
  polls_voted: number;
};

type UserSearchResult = {
  id: string;
  username: string;
  role: string;
  region: string;
  avatar_url?: string;
  created_at: string;
  last_activity?: string;
};

export class UsersApiService extends BaseApiService {
  constructor() {
    super('profiles');
  }

  // Get all users with profiles
  async getAllUsers(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: FilterParams
  ): Promise<ApiResponse<UserWithProfile[]>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(*)
        `)
        .order(sort?.column || 'created_at', { ascending: sort?.ascending ?? false });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // Transform data to include user info
      const usersWithProfiles = data?.map(profile => ({
        id: profile.id,
        created_at: profile.created_at,
        profile,
        roles: profile.user_roles || []
      })) || [];

      return { data: usersWithProfiles, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get user by ID with full profile
  async getUserById(id: string): Promise<ApiResponse<UserWithProfile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      const userWithProfile: UserWithProfile = {
        id: data.id,
        created_at: data.created_at,
        profile: data,
        roles: data.user_roles || []
      };

      return { data: userWithProfile, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<UserWithProfile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated', success: false };
      }

      return this.getUserById(user.id);
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Update user profile
  async updateProfile(id: string, updates: ProfileUpdate): Promise<ApiResponse<Profile>> {
    return this.put<Profile>(id, updates);
  }

  // Update current user profile
  async updateCurrentUserProfile(updates: ProfileUpdate): Promise<ApiResponse<Profile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated', success: false };
      }

      return this.updateProfile(user.id, updates);
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Search users
  async searchUsers(
    searchTerm: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<UserSearchResult[]>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          role,
          region,
          avatar_url,
          created_at
        `)
        .or(`username.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%`)
        .order('username');

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as UserSearchResult[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get users by role
  async getUsersByRole(
    role: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<UserWithProfile[]>> {
    return this.getAllUsers(pagination, { column: 'username', ascending: true }, { role });
  }

  // Get users by region
  async getUsersByRegion(
    region: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<UserWithProfile[]>> {
    return this.getAllUsers(pagination, { column: 'username', ascending: true }, { region });
  }

  // Get user roles
  async getUserRoles(userId: string): Promise<ApiResponse<UserRole[]>> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as UserRole[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Assign role to user
  async assignRole(userId: string, role: string): Promise<ApiResponse<UserRole>> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as any
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as UserRole, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Remove role from user
  async removeRole(userId: string, role: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Check if user has role
  async hasRole(userId: string, role: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        return { data: null, error: error.message, success: false };
      }

      return { data: !!data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get user statistics
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      // Get total users count
      const { count: totalUsers, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        return { data: null, error: countError.message, success: false };
      }

      // Get users by role
      const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role');

      if (roleError) {
        return { data: null, error: roleError.message, success: false };
      }

      const usersByRole = roleData?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get users by region
      const { data: regionData, error: regionError } = await supabase
        .from('profiles')
        .select('region');

      if (regionError) {
        return { data: null, error: regionError.message, success: false };
      }

      const usersByRegion = regionData?.reduce((acc, user) => {
        acc[user.region] = (acc[user.region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      if (activeError) {
        return { data: null, error: activeError.message, success: false };
      }

      // Get new users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsers, error: newUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      if (newUsersError) {
        return { data: null, error: newUsersError.message, success: false };
      }

      const stats: UserStats = {
        total_users: totalUsers || 0,
        users_by_role: usersByRole,
        users_by_region: usersByRegion,
        active_users: activeUsers || 0,
        new_users_this_month: newUsers || 0
      };

      return { data: stats, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get user activity
  async getUserActivity(
    userId: string,
    limit: number = 10
  ): Promise<ApiResponse<UserActivity>> {
    try {
      // Get user profile
      const userResult = await this.getUserById(userId);
      if (!userResult.success || !userResult.data) {
        return userResult;
      }

      const user = userResult.data;

      // Get discussions count
      const { count: discussionsCount } = await supabase
        .from('discussions')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      // Get replies count
      const { count: repliesCount } = await supabase
        .from('discussion_replies')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      // Get articles count
      const { count: articlesCount } = await supabase
        .from('knowledge_articles')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      // Get polls created count
      const { count: pollsCreated } = await supabase
        .from('polls')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      // Get polls voted count
      const { count: pollsVoted } = await supabase
        .from('poll_votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const activity: UserActivity = {
        user_id: userId,
        username: user.profile.username,
        role: user.profile.role,
        region: user.profile.region,
        last_activity: user.profile.updated_at,
        discussions_count: discussionsCount || 0,
        replies_count: repliesCount || 0,
        articles_count: articlesCount || 0,
        polls_created: pollsCreated || 0,
        polls_voted: pollsVoted || 0
      };

      return { data: activity, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get all users activity (for admin dashboard)
  async getAllUsersActivity(
    pagination?: PaginationParams
  ): Promise<ApiResponse<UserActivity[]>> {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, role, region, updated_at')
        .order('updated_at', { ascending: false });

      if (profilesError) {
        return { data: null, error: profilesError.message, success: false };
      }

      const activities = await Promise.all(
        profiles.map(async (profile) => {
          const activity = await this.getUserActivity(profile.id);
          return activity.data;
        })
      );

      const validActivities = activities.filter(activity => activity !== null) as UserActivity[];

      return { data: validActivities, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Update user avatar
  async updateAvatar(userId: string, avatarUrl: string): Promise<ApiResponse<Profile>> {
    return this.updateProfile(userId, { avatar_url: avatarUrl });
  }

  // Delete user account
  async deleteUser(userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Delete user profile (this will cascade to related records due to RLS)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<ApiResponse<string[]>> {
    try {
      const rolesResult = await this.getUserRoles(userId);
      if (!rolesResult.success || !rolesResult.data) {
        return rolesResult;
      }

      const roles = rolesResult.data.map(role => role.role);
      
      // Define permissions based on roles
      const permissions: string[] = [];
      
      if (roles.includes('admin')) {
        permissions.push('manage_users', 'manage_content', 'view_analytics', 'manage_settings');
      }
      
      if (roles.includes('moderator')) {
        permissions.push('moderate_content', 'view_analytics');
      }
      
      if (roles.includes('user')) {
        permissions.push('create_content', 'vote', 'comment');
      }

      return { data: permissions, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }
}

// Export singleton instance
export const usersApi = new UsersApiService();
