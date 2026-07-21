export interface Area {
  id: number;
  name: string;
}

export interface Line {
  id: number;
  name: string;
}

export interface Station {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  npk: string;
  name: string;
  gender: "male" | "female";
  department_id: number | null;
  section_id: number | null;
  role_level?: string | null;
  jabatan: string | null;

  // Foreign keys (baru)
  area_id?: number | null;
  line_id?: number | null;
  station_id?: number | null;

  employment_type: "permanent" | "contract" | "apprentice";
  join_date: string;
  start_contract: string;
  end_contract: string | null;
  created_at: string;
  updated_at: string;
  // Status aktif/nonaktif
  is_active: boolean;
  deactivated_at: string | null;
  deactivated_reason: string | null;

  // Relasi (dari resource)
  department?: { id: number; name: string };
  section?: { id: number; name: string };
  area?: Area | null;
  line?: Line | null;
  station?: Station | null;

  // Accessor dari backend
  is_near_expiry?: boolean;
  days_until_expiry?: number | null;

  replaced_by?: {
    no_req: string;
    employees: {
      id: number;
      npk: string;
      name: string;
      start_contract: string;
    }[];
  } | null;
}

export interface CreateEmployeeInput {
  npk: string;
  name: string;
  gender: "male" | "female";
  department_id?: number | null;
  section_id?: number | null;
  role_level?: string | null;
  jabatan?: string | null;
  area_id?: number | null;
  line_id?: number | null;
  station_id?: number | null;
  employment_type: "permanent" | "contract" | "apprentice";
  join_date: string;
  start_contract: string;
  end_contract?: string | null;
}

export interface UpdateEmployeeInput {
  npk?: string;
  name?: string;
  gender?: "male" | "female";
  department_id?: number | null;
  section_id?: number | null;
  role_level?: string | null;
  jabatan?: string | null;
  area_id?: number | null;
  line_id?: number | null;
  station_id?: number | null;
  employment_type?: "permanent" | "contract" | "apprentice";
  join_date?: string;
  start_contract?: string;
  end_contract?: string | null;
}

export interface EmployeeListParams {
  page?: number;
  per_page?: number;
  search?: string;
  department_id?: number;
  section_id?: number;
  employment_type?: string;
  near_expiry?: boolean;
  is_active?: boolean;
}
