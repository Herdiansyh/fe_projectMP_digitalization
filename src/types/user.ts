export interface UserItem {
  id: number;
  npk: string;
  name: string;
  username: string;
  email: string;
  is_admin: boolean;
  can_view_manpower?: boolean;
  department?: { id: number; name: string } | null;
  section?: { id: number; name: string } | null;
  role_level?: { id: number; name: string } | null;
  director?: { id: number; name: string; npk: string } | null;
  approver_manager?: { id: number; name: string; npk: string } | null;
  approver_division?: { id: number; name: string; npk: string } | null;
  approver_director?: { id: number; name: string; npk: string } | null;
  last_login_at?: string | null;
  area?: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
}

export interface UserListParams {
  search?: string;
  department_id?: number | string;
  section_id?: number | string;
  role_level_id?: number | string;
  is_admin?: boolean | string;
  can_view_manpower?: boolean | string;
  page?: number;
  per_page?: number;
}

export interface UserFormData {
  npk: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  department_id?: number | string | null;
  section_id?: number | string | null;
  role_level_id?: number | string | null;
  director_id?: number | string | null;
  approver_manager_id?: number | string | null;
  approver_division_id?: number | string | null;
  approver_director_id?: number | string | null;
  is_admin?: boolean;
  can_view_manpower?: boolean;
  area_id?: number | string | null;
}

export interface ResetPasswordData {
  password: string;
  password_confirmation: string;
}

export interface UserApiResponse {
  success: boolean;
  message: string;
  data: UserItem;
}

export interface UserListApiResponse {
  success: boolean;
  message: string;
  data: {
    data: UserItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Master data types untuk dropdown
export interface Department {
  id: number;
  name: string;
}
export interface Section {
  id: number;
  name: string;
}
export interface RoleLevel {
  id: number;
  name: string;
}

export interface Area {
  id: number;
  name: string;
}
