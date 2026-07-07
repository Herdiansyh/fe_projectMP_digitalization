// export interface Requisition {
//   no_req: string;
//   requester_name: string;
//   request_date: string;
//   group?: string;
//   department?: string;
//   section?: string;
//   type?: string;
//   position?: string;
//   status?: string;
//   duration?: string;
//   level?: string;
//   cost_employee?: string;
//   fulfilment_time?: string;
//   education?: string;
//   max_age?: number;
//   min_experience?: number;
//   technical_skill?: string[];
//   soft_skill?: string[];
//   description?: string;
//   cost_center?: string;
//   objective?: string;
//   reason?: string;
//   employee_out?: string;
//   manpower_plan?: string;
//   unplanned_reason?: string;
//   approval_status: string;
//   manager?: string;
//   division?: string;
//   director?: string;
//   supervisor?: string;
//   hrd_approved: boolean;
//   hrd_processed_by?: string;
//   hrd_processed_at?: string;
//   rejection_reason?: string;
//   manager_approved_at?: string;
//   division_approved_at?: string;
//   director_approved_at?: string;
//   apprenticeship_period?: boolean;
//   replacement_employee?: {
//     id: number;
//     npk: string;
//     name: string;
//   } | null;
//   created_at: string;
//   updated_at: string;
// }

import type { Station } from "./station";

// export interface CreateRequisitionInput {
//   requester_name: string;
//   request_date: string;
//   group?: string;
//   department?: string;
//   section?: string;
//   type?: string;
//   position?: string;
//   status?: string;
//   duration?: string;
//   level?: string;
//   cost_employee?: string;
//   fulfilment_time?: string;
//   education?: string;
//   max_age?: number;
//   min_experience?: number;
//   technical_skill?: string[];
//   soft_skill?: string[];
//   description?: string;
//   cost_center?: string;
//   objective?: string;
//   reason?: string;
//   employee_out?: string;
//   manpower_plan?: string;
//   unplanned_reason?: string;
//   supervisor?: string;
//   replacement_employee_id?: number | null;
//   apprenticeship_period?: boolean;
// }

// export interface UpdateRequisitionInput {
//   requester_name?: string;
//   request_date?: string;
//   group?: string;
//   department?: string;
//   section?: string;
//   type?: string;
//   position?: string;
//   status?: string;
//   duration?: string;
//   level?: string;
//   cost_employee?: string;
//   fulfilment_time?: string;
//   education?: string;
//   max_age?: number;
//   min_experience?: number;
//   technical_skill?: string[];
//   soft_skill?: string[];
//   description?: string;
//   cost_center?: string;
//   objective?: string;
//   reason?: string;
//   employee_out?: string;
//   manpower_plan?: string;
//   unplanned_reason?: string;
//   replacement_employee_id?: number | null;
//   apprenticeship_period?: boolean;
// }

// export interface ApprovalInput {
//   action: "approved" | "rejected";
//   rejection_reason?: string;
// }

// export interface ApprovalHistory {
//   manager: {
//     name?: string;
//     approved_at?: string;
//   };
//   division: {
//     name?: string;
//     approved_at?: string;
//   };
//   director: {
//     name?: string;
//     approved_at?: string;
//   };
// }

// export interface RequisitionListParams {
//   page?: number;
//   per_page?: number;
//   status?: string;
//   exclude_status?: string;
//   manager?: string;
//   division?: string;
//   director?: string;
//   supervisor?: string;
// }

// export interface PaginatedResponse<T> {
//   success: boolean;
//   data: {
//     current_page: number;
//     data: T[];
//     first_page_url: string;
//     from: number;
//     last_page: number;
//     last_page_url: string;
//     links: Array<{ url?: string; label: string; active: boolean }>;
//     next_page_url?: string;
//     path: string;
//     per_page: number;
//     prev_page_url?: string;
//     to: number;
//     total: number;
//   };
// }

// export interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
// }

// export interface MasterDataItem {
//   id: number;
//   name: string;
// }

// export interface EmployeeStatusItem extends MasterDataItem {
//   level_default?: number;
// }

// export interface MasterData {
//   companies: MasterDataItem[];
//   departments: MasterDataItem[];
//   sections: MasterDataItem[];
//   employee_statuses: EmployeeStatusItem[];
//   role_levels: MasterDataItem[];
// }

// export interface Approver {
//   id: number;
//   name: string;
//   npk: string;
//   role_level_id: number;
// }

// export interface ApproverList {
//   managers: Approver[];
//   division_heads: Approver[];
//   directors: Approver[];
// }

// export interface UserContext {
//   id: number;
//   name: string;
//   email: string;
//   role_level: {
//     id: number;
//     name: string;
//     is_system: boolean;
//   };
// }

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
  hrd_processed_by?: string;
  hrd_processed_at?: string;
  rejection_reason?: string;
  manager_approved_at?: string;
  division_approved_at?: string;
  director_approved_at?: string;
  apprenticeship_period?: boolean;
  replacement_employee?: {
    id: number;
    npk: string;
    name: string;
  } | null;

  // ── Manpower assignment (HRD isi NPK/kontrak → requester isi area/line) ──
  assigned_npk?: string | null;
  assigned_name?: string | null;
  assigned_start_contract?: string | null;
  assigned_end_contract?: string | null;
  hrd_assigned_at?: string | null;
  hrd_assigned_by?: string | null;
  assigned_area?: string | null;
  assigned_line?: string | null;
  area_line_filled_at?: string | null;
  employee_id?: number | null;
  intern_id?: number | null;
  /** true jika HRD sudah isi NPK/kontrak tapi area/line belum diisi requester */
  needs_area_line?: boolean;

  created_at: string;
  updated_at: string;
  assigned_station?: string | null; // legacy, dihapus setelah migrasi data selesai
  area_id?: number | null;
  line_id?: number | null;
  station_id?: number | null;
  area?: { id: number; name: string } | null;
  line?: { id: number; name: string } | null;
  station?: { id: number; name: string } | null;
  pending_candidates:
    | {
        npk: string;
        name: string;
        start_contract: string;
        end_contract: string | null;
      }[]
    | null;
  employees: ManpowerRecord[];
  interns: ManpowerRecord[];
}

export interface ManpowerRecord {
  id: number;
  npk: string;
  name: string;
  start_contract: string;
  end_contract: string | null;
  area?: { id: number; name: string } | null;
  line?: { id: number; name: string } | null;
  station?: { id: number; name: string } | null;
}
export interface AssignManpowerInput {
  npk: string;
  name: string;
  start_contract: string;
  end_contract?: string | null;
}

export interface AssignAreaLineInput {
  area_id: number;
  line_id?: number | null;
  station_id?: number | null;
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
  replacement_employee_id?: number | null;
  apprenticeship_period?: boolean;
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
  replacement_employee_id?: number | null;
  apprenticeship_period?: boolean;
}

export interface ApprovalInput {
  action: "approved" | "rejected";
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
  needs_area_line?: boolean;
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
  stations: Station[]; // ← tambahan

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

// types/fptk.ts — tambahkan
export interface AssignManpowerCandidateInput {
  npk: string;
  name: string;
  start_contract: string;
  end_contract: string | null;
}

export interface AssignAreaLineCandidateInput {
  npk: string;
  area_id: number;
  line_id: number | null;
  station_id: number | null;
}
