import type { Area } from "./area";

export interface Line {
  id: number;
  area_id: number;
  name: string;
  area?: Area;
  created_at?: string;
  updated_at?: string;
}
