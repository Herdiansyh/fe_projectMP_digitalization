export interface Requisition {
  no_req: string;
  requester_name: string;
  request_date: string;
  group?: string;
  department?: string;
  section?: string;
  type?: string;
  position?: string;
  status?: string;
  duration?: string;
  level?: string;
  cost_employee?: string;
  fulfilment_time?: string;
  education?: string;
  max_age?: number;
  min_experience?: number;
  technical_skill?: string[];
  soft_skill?: string[];
  description?: string;
  cost_center?: string;
  objective?: string;
  reason?: string;
  employee_out?: string;
  manpower_plan?: string;
  unplanned_reason?: string;
  approval_status: string;
  manager?: string;
  division?: string;
  director?: string;
  supervisor?: string;
  hrd_approved: boolean;
  rejection_reason?: string;
  manager_approved_at?: string;
  division_approved_at?: string;
  director_approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRequisitionInput {
  requester_name: string;
  request_date: string;
  group?: string;
  department?: string;
  section?: string;
  type?: string;
  position?: string;
  status?: string;
  duration?: string;
  level?: string;
  cost_employee?: string;
  fulfilment_time?: string;
  education?: string;
  max_age?: number;
  min_experience?: number;
  technical_skill?: string[];
  soft_skill?: string[];
  description?: string;
  cost_center?: string;
  objective?: string;
  reason?: string;
  employee_out?: string;
  manpower_plan?: string;
  unplanned_reason?: string;
  supervisor?: string;
}

export interface UpdateRequisitionInput {
  requester_name?: string;
  request_date?: string;
  group?: string;
  department?: string;
  section?: string;
  type?: string;
  position?: string;
  status?: string;
  duration?: string;
  level?: string;
  cost_employee?: string;
  fulfilment_time?: string;
  education?: string;
  max_age?: number;
  min_experience?: number;
  technical_skill?: string[];
  soft_skill?: string[];
  description?: string;
  cost_center?: string;
  objective?: string;
  reason?: string;
  employee_out?: string;
  manpower_plan?: string;
  unplanned_reason?: string;
}

export interface ApprovalInput {
  action: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface ApprovalHistory {
  manager: {
    name?: string;
    approved_at?: string;
  };
  division: {
    name?: string;
    approved_at?: string;
  };
  director: {
    name?: string;
    approved_at?: string;
  };
}

export interface RequisitionListParams {
  page?: number;
  per_page?: number;
  status?: string;
  exclude_status?: string;
  manager?: string;
  division?: string;
  director?: string;
  supervisor?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url?: string; label: string; active: boolean }>;
    next_page_url?: string;
    path: string;
    per_page: number;
    prev_page_url?: string;
    to: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface MasterDataItem {
  id: number;
  name: string;
}

export interface EmployeeStatusItem extends MasterDataItem {
  level_default?: number;
}

export interface MasterData {
  companies: MasterDataItem[];
  departments: MasterDataItem[];
  sections: MasterDataItem[];
  employee_statuses: EmployeeStatusItem[];
  role_levels: MasterDataItem[];
}

export interface Approver {
  id: number;
  name: string;
  npk: string;
  role_level_id: number;
}

export interface ApproverList {
  managers: Approver[];
  division_heads: Approver[];
  directors: Approver[];
}

export interface UserContext {
  id: number;
  name: string;
  email: string;
  role_level: {
    id: number;
    name: string;
    is_system: boolean;
  };
}

