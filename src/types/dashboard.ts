export interface FptkSummary {
  total: number;
  by_status: Record<string, number>;
}

export interface FptkTrendPoint {
  month: string;
  label: string;
  total: number;
}

export interface CompetencyTrendPoint {
  month: string;
  label: string;
  avg_score: number;
}

export interface ManpowerSummary {
  employees: number;
  active_employees: number;
  interns: number;
  active_interns: number;
}

export interface DepartmentManpower {
  name: string;
  employees: number;
  interns: number;
}

export interface CompetencySummary {
  total_approved: number;
  pending_qa: number;
}

export interface EvaluationsSummary {
  total: number;
  in_progress: number;
  pending_hr: number;
  approved: number;
  rejected: number;
}

export interface DashboardData {
  widgets: {
    fptk_summary?: FptkSummary;
    fptk_trend?: FptkTrendPoint[];
    manpower_summary?: ManpowerSummary;
    manpower_by_department?: DepartmentManpower[];
    competency_summary?: CompetencySummary;
    competency_trend?: CompetencyTrendPoint[];
    evaluations_summary?: EvaluationsSummary;
  };
  permission_keys: string[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}