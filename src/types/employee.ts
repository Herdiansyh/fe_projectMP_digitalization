export interface Employee {
  id: number;
  npk: string;
  name: string;
  gender: "male" | "female";
  department_id: number | null;
  section_id: number | null;
  role_level?: string | null;
  jabatan: string | null;
  area: string | null;
  line?: string | null;
  station: string | null;
  employment_type: "permanent" | "contract" | "apprentice";
  start_contract: string;
  end_contract: string | null;
  created_at: string;
  updated_at: string;

  // Relasi (dari resource)
  department?: { id: number; name: string };
  section?: { id: number; name: string };

  // Accessor dari backend
  is_near_expiry?: boolean;
  days_until_expiry?: number | null;
}

export interface CreateEmployeeInput {
  npk: string;
  name: string;
  gender: "male" | "female";
  department_id?: number | null;
  section_id?: number | null;
  role_level?: string | null;
  jabatan?: string | null;
  area?: string | null;
  station?: string | null;
  employment_type: "permanent" | "contract" | "apprentice";
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
  area?: string | null;
  station?: string | null;
  employment_type?: "permanent" | "contract" | "apprentice";
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
}
