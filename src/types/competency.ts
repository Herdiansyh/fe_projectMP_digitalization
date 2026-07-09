export interface CompetencyCheckpoint {
  id: number;
  category_id: number;
  description: string;
  sequence?: number | null;
  main_process?: string | null;
  weight: number;
  order: number;
}

export interface CompetencyCategory {
  id: number;
  matrix_id: number;
  name: string;
  order: number;
  checkpoints: CompetencyCheckpoint[];
}

export interface CompetencyMatrix {
  id: number;
  station_id: number;
  station?: { id: number; name: string };
  name: string;
  is_active: boolean;
  categories: CompetencyCategory[];
}

export interface LatestAssessment {
  id: number;
  period_label: string;
  assessed_at: string;
  final_score: number;
}

export interface AssessableSubject {
  id: number;
  npk: string;
  name: string;
  subject_type: "employee" | "intern";
  station_id: number;
  station?: { id: number; name: string };
  latest_assessment: LatestAssessment | null;
}

export interface CategoryScore {
  category_id: number;
  category_name: string;
  total_point: number;
  checkpoint_count: number;
  average: number;
}

export interface AssessmentHistoryItem {
  id: number;
  period_label: string;
  assessed_at: string;
  notes: string | null;
  final_score: number;
  category_scores: CategoryScore[];
  assessor: { id: number; name: string };
}
