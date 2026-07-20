export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  npk?: string;
  username?: string;
  photo?: string;
  is_admin?: boolean;
  can_view_manpower?: boolean;
  is_active?: boolean;
  last_login_at?: string;
  role: Role;
  area_id?: number | null;
  area?: { id: number; name: string } | null;
  // role_level?: {
  //   id: number;
  //   name: string;
  // };
  department?: {
    id: number;
    name: string;
  };
  section?: {
    id: number;
    name: string;
  };
  permissions?: string[];
}
export interface RoleLevel {
  id: number;
  name: string;
}

export interface LoginCredentials {
  npk: string;
  password: string;
  role_level_id: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: string;
    expires_in: number;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}
