import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Generic types for API responses
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type SortParams = {
  column: string;
  ascending?: boolean;
};

export type FilterParams = {
  [key: string]: any;
};

// Base API class with common functionality
export class BaseApiService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Generic GET request
  protected async get<T>(
    selectQuery?: string,
    filters?: FilterParams,
    sort?: SortParams,
    pagination?: PaginationParams
  ): Promise<ApiResponse<T[]>> {
    try {
      let query = supabase.from(this.tableName);

      if (selectQuery) {
        query = query.select(selectQuery);
      } else {
        query = query.select('*');
      }

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.ilike(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.column, { ascending: sort.ascending ?? true });
      }

      // Apply pagination
      if (pagination) {
        const { page = 1, limit = 50, offset } = pagination;
        if (offset !== undefined) {
          query = query.range(offset, offset + limit - 1);
        } else {
          const start = (page - 1) * limit;
          query = query.range(start, start + limit - 1);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Supabase API Error in ${this.tableName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          data: null, 
          error: error.message || 'Database query failed', 
          success: false 
        };
      }

      return { data: data as T[], error: null, success: true };
    } catch (error: any) {
      console.error(`Unexpected error in ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error.message || 'An unexpected error occurred', 
        success: false 
      };
    }
  }

  // Generic GET by ID
  protected async getById<T>(id: string, selectQuery?: string): Promise<ApiResponse<T>> {
    try {
      let query = supabase.from(this.tableName);

      if (selectQuery) {
        query = query.select(selectQuery);
      } else {
        query = query.select('*');
      }

      const { data, error } = await query.eq('id', id).single();

      if (error) {
        console.error(`Supabase API Error in ${this.tableName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          data: null, 
          error: error.message || 'Database query failed', 
          success: false 
        };
      }

      return { data: data as T, error: null, success: true };
    } catch (error: any) {
      console.error(`Unexpected error in ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error.message || 'An unexpected error occurred', 
        success: false 
      };
    }
  }

  // Generic POST request
  protected async post<T>(data: any, selectQuery?: string): Promise<ApiResponse<T>> {
    try {
      let query = supabase.from(this.tableName).insert(data);

      if (selectQuery) {
        query = query.select(selectQuery);
      } else {
        query = query.select('*');
      }

      const { data: result, error } = await query.single();

      if (error) {
        console.error(`Supabase API Error in ${this.tableName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          data: null, 
          error: error.message || 'Database query failed', 
          success: false 
        };
      }

      return { data: result as T, error: null, success: true };
    } catch (error: any) {
      console.error(`Unexpected error in ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error.message || 'An unexpected error occurred', 
        success: false 
      };
    }
  }

  // Generic PUT request
  protected async put<T>(id: string, data: any, selectQuery?: string): Promise<ApiResponse<T>> {
    try {
      let query = supabase.from(this.tableName).update(data).eq('id', id);

      if (selectQuery) {
        query = query.select(selectQuery);
      } else {
        query = query.select('*');
      }

      const { data: result, error } = await query.single();

      if (error) {
        console.error(`Supabase API Error in ${this.tableName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          data: null, 
          error: error.message || 'Database query failed', 
          success: false 
        };
      }

      return { data: result as T, error: null, success: true };
    } catch (error: any) {
      console.error(`Unexpected error in ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error.message || 'An unexpected error occurred', 
        success: false 
      };
    }
  }

  // Generic DELETE request
  protected async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from(this.tableName).delete().eq('id', id);

      if (error) {
        console.error(`Supabase API Error in ${this.tableName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          data: null, 
          error: error.message || 'Database query failed', 
          success: false 
        };
      }

      return { data: true, error: null, success: true };
    } catch (error: any) {
      console.error(`Unexpected error in ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error.message || 'An unexpected error occurred', 
        success: false 
      };
    }
  }

  // Generic search function
  protected async search<T>(
    searchTerm: string,
    searchColumns: string[],
    selectQuery?: string,
    filters?: FilterParams
  ): Promise<ApiResponse<T[]>> {
    try {
      let query = supabase.from(this.tableName);

      if (selectQuery) {
        query = query.select(selectQuery);
      } else {
        query = query.select('*');
      }

      // Build search conditions
      const searchConditions = searchColumns
        .map(column => `${column}.ilike.%${searchTerm}%`)
        .join(',');

      query = query.or(searchConditions);

      // Apply additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Supabase API Error in ${this.tableName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          data: null, 
          error: error.message || 'Database query failed', 
          success: false 
        };
      }

      return { data: data as T[], error: null, success: true };
    } catch (error: any) {
      console.error(`Unexpected error in ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error.message || 'An unexpected error occurred', 
        success: false 
      };
    }
  }

  // Generic count function
  protected async count(filters?: FilterParams): Promise<ApiResponse<number>> {
    try {
      let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.ilike(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        console.error(`Supabase API Error in ${this.tableName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          data: null, 
          error: error.message || 'Database query failed', 
          success: false 
        };
      }

      return { data: count || 0, error: null, success: true };
    } catch (error: any) {
      console.error(`Unexpected error in ${this.tableName}:`, error);
      return { 
        data: null, 
        error: error.message || 'An unexpected error occurred', 
        success: false 
      };
    }
  }
}

// Utility function for handling API errors
export const handleApiError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error_description) return error.error_description;
  return 'An unexpected error occurred';
};

// Utility function for creating query strings
export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};
