export interface CompetencyCheckpoint {
  id: number;
  category_id: number;
  description: string;
  sequence?: number | null;
  main_process?: string | null;
  weight: number;
  order: number;
}
export type AssessmentStatus = "pending_qa" | "approved";

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
  status: AssessmentStatus;
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
  status: AssessmentStatus;
  final_score: number;
  category_scores: CategoryScore[];
  assessor: { id: number; name: string };
  qa_reviewer: { id: number; name: string } | null;
}

export interface QaQueueItem {
  id: number;
  period_label: string;
  assessed_at: string;
  notes: string | null;
  assessor: { id: number; name: string };
  subject: { id: number; npk: string; name: string };
  subject_type: "employee" | "intern";
  matrix_id: number;
  leader_category_scores: CategoryScore[];
  leader_scores: Record<number, number>;
}

export interface MySubmissionItem {
  id: number;
  period_label: string;
  assessed_at: string;
  status: AssessmentStatus;
  final_score: number;
  subject: {
    id: number;
    npk: string;
    name: string;
    station?: { id: number; name: string };
  };
  subject_type: "employee" | "intern";
  qa_at: string | null;
  qa_reviewer?: { id: number; name: string } | null;
}

export interface AssessmentDetail {
  id: number;
  period_label: string;
  assessed_at: string;
  notes: string | null;
  status: AssessmentStatus;
  assessor: { id: number; name: string };
  qa_reviewer: { id: number; name: string } | null;
  qa_at: string | null;
  matrix: CompetencyMatrix;
  leader_scores: Record<number, number>;
  qa_scores: Record<number, number>;
  category_scores: CategoryScore[];
  final_score: number;
}
export interface MyReviewItem {
  id: number;
  period_label: string;
  assessed_at: string;
  qa_at: string;
  final_score: number;
  subject: {
    id: number;
    npk: string;
    name: string;
    station?: { id: number; name: string };
  };
  subject_type: "employee" | "intern";
  assessor: { id: number; name: string };
}

export type MonitoringStatus = "not_assessed" | "pending_qa" | "completed";
export interface StationCompetencySummary {
  station_id: number;
  station_name: string;
  final_score: number;
  period_label: string;
  assessed_at: string;
}
export interface MonitoringItem {
  subject_type: "employee" | "intern";
  subject_id: number;
  npk: string;
  name: string;
  station: string | null;
  line: string | null;
  area: string | null;
  status: MonitoringStatus;
  period_label: string | null;
  assessed_at: string | null;
  assessor: { id: number; name: string } | null;
  qa_at: string | null;
  qa_reviewer: { id: number; name: string } | null;
  final_score: number | null;
}
