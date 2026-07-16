export interface ReorderPayload {
  orders: { id: number; order: number }[];
}

export interface GroupPayload {
  name: string;
  code: string;
  order?: number;
}

export interface SubgroupPayload {
  name: string;
  roman_code: string;
  order?: number;
}

export interface CriteriaPayload {
  name: string | null;
  subgroup_id: number | null;
  weight: number;
  order?: number;
  is_active?: boolean;
}

export interface ScaleOptionPayload {
  score: number;
  description: string;
}

export interface ScaleOptionsBulkPayload {
  options: ScaleOptionPayload[];
}
