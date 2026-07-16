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

export interface Line {
  id: number;
  name: string;
  area_id: number;
  area?: Area;
}

export interface Station {
  id: number;
  name: string;
  line_id: number;
  line?: Line;
}

export interface Intern {
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

  // Relasi objek (dikembalikan oleh InternResource, bukan string lagi)
  area?: Area | null;
  line?: Line | null;
  station?: Station | null;

  start_contract: string;
  end_contract: string | null;
  is_near_expiry?: boolean;
  days_until_expiry?: number | null;
  department?: Department | null;
  section?: Section | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInternInput {
  npk: string;
  name: string;
  gender: "male" | "female";
  department_id: number | null;
  section_id: number | null;
  role_level?: string | null;
  jabatan: string;
  area_id: number | null;
  line_id?: number | null;
  station_id: number | null;
  start_contract: string;
  end_contract: string | null;
}

export type UpdateInternInput = Partial<CreateInternInput>;

export interface InternListParams {
  page?: number;
  per_page?: number;
  search?: string;
  department_id?: number;
  section_id?: number;
  near_expiry?: boolean;
}
