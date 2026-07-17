export interface EvaluationEmployee {
  id: number;
  npk: string;
  name: string;
  jabatan: string | null;
  department_id: number | null;
  section_id: number | null;
  join_date: string | null;
  start_contract: string | null;
  end_contract: string | null;
  employment_type: string | null;
}

export interface EvaluationCriteriaScaleOption {
  id: number;
  description: string;
  score: number;
  order: number;
}

export interface EvaluationCriteria {
  id: number;
  name: string;
  subgroup_id: number;
  weight: number;
  scale_type: string;
  scale_options: EvaluationCriteriaScaleOption[];
  is_active: boolean;
}

export interface EvaluationSubgroup {
  id: number;
  name: string;
  description?: string | null;
  order: number;
  roman_code?: string | null;
  criteria: EvaluationCriteria[];
}

export interface EvaluationGroup {
  id: number;
  name: string;
  description?: string | null;
  order: number;
  code?: string | null;
  subgroups: EvaluationSubgroup[];
}

export interface EvaluationScore {
  id: number;
  criteria_id: number;
  score: number | null;
  score_x_weight: number | null;
  filled_by_role: string | null;
  filled_by_user_id: number | null;
  criteria: {
    id: number;
    name: string;
    subgroup_id: number;
    weight: number;
    scale_type: string;
  };
}

export interface EvaluationRecommendation {
  employee_status: string | null;
  extend_pkwt: boolean;
  pkwt_number: string | null;
  extend_months: number | null;
  notes: string | null;
  created_by: number | null;
}

export interface EvaluationApproval {
  id: number;
  role: string;
  user_id: number | null;
  action: string;
  notes: string | null;
  acted_at: string | null;
}

// Ringkasan user approval chain (Leader/Section Head/Manager) — dikirim
// backend sebagai object supaya frontend tidak perlu lookup ID manual.
export interface EvaluationApprover {
  id: number;
  name: string;
  npk: string;
}

export type PendingTrigger = EvaluationEmployee;
export interface Evaluation {
  id: number;
  employee_id: number;
  department_id: number | null;
  department_head_id: number | null;
  leader_id: number | null;
  section_head_id: number | null;
  manager_id: number | null;
  npk: string | null;
  jabatan: string | null;
  join_date: string | null;
  start_date: string | null;
  end_date: string | null;
  pkwt: string | null;
  status: string;
  current_stage: string;
  total_score: number | null;
  reminder_date: string | null;
  reminder_note: string | null;
  reminder_sent_at: string | null;
  is_locked_for_current_user: boolean;
  is_leader_fields_locked: boolean;
  employee: EvaluationEmployee | null;
  // Object approver — leader selalu ada, section_head bisa null (Leader
  // belum punya Approver Section Head di-set), manager bisa null sampai
  // Section Head approve (manager ditentukan dinamis dari approver Section
  // Head yang bertindak, bukan dari Leader).
  leader: EvaluationApprover | null;
  section_head: EvaluationApprover | null;
  manager: EvaluationApprover | null;
  scores: EvaluationScore[];
  recommendation: EvaluationRecommendation | null;
  approvals: EvaluationApproval[];
  created_at: string | null;
  updated_at: string | null;
}

export interface EvaluationListParams {
  page?: number;
  per_page?: number;
  employee_id?: number;
  status?: string;
}

export interface EvaluationCreatePayload {
  employee_id: number;
  department_id?: number | null;
  department_head_id?: number | null;
  npk?: string | null;
  jabatan?: string | null;
  join_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  pkwt?: string | null;
}

export interface EvaluationUpdatePayload {
  department_id?: number | null;
  department_head_id?: number | null;
  section_head_id?: number | null;
  manager_id?: number | null;
  npk?: string | null;
  jabatan?: string | null;
  join_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  pkwt?: string | null;
  reminder_date?: string | null;
  reminder_note?: string | null;
}

export interface EvaluationScorePayload {
  scores: Array<{
    criteria_id: number;
    score: number;
  }>;
}

export interface EvaluationRecommendationPayload {
  employee_status?: string | null;
  extend_pkwt?: boolean;
  pkwt_number?: string | null;
  extend_months?: number | null;
  notes?: string | null;
  created_by?: number | null;
}

export interface EvaluationActionPayload {
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
