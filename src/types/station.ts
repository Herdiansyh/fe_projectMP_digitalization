import type { Line } from "./line";

export interface Station {
  id: number;
  name: string;
  line_id: number;
  line?: Line & { area?: { id: number; name: string } };
  created_at?: string;
  updated_at?: string;
}

export interface StationPayload {
  name: string;
  line_id: number | string;
}

export interface StationListParams {
  search?: string;
  line_id?: number | string;
  area_id?: number | string;
  paginate?: boolean;
  per_page?: number;
}
