export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
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
export interface Operator {
  id: number;
  name: string;
  nrp: string;
  created_by: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OperatorFormData {
  name: string;
  nrp: string;
}

export interface OperatorPagination {
  total: number;
  last_page: number;
  current_page: number;
  per_page: number;
}

export interface OperatorApiResponse {
  success: boolean;
  message: string;
  data: Operator;
}

export interface OperatorListApiResponse {
  success: boolean;
  message: string;
  data: Operator[];
  pagination?: OperatorPagination;
}
