import type { ReactNode } from "react";
import {
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiClipboard,
} from "react-icons/fi";

export type DashboardWidgetKey =
  | "fptk_summary"
  | "manpower_summary"
  | "competency_summary"
  | "evaluations_summary";

interface WidgetMeta {
  key: DashboardWidgetKey;
  title: string;
  icon: ReactNode;
  href: string;
  guard: (can: (permission?: string | string[]) => boolean) => boolean;
}

export const DASHBOARD_WIDGETS: WidgetMeta[] = [
  {
    key: "fptk_summary",
    title: "FPTK",
    icon: <FiFileText size={18} color="#1A5EA8" />,
    href: "/fptklist",
    guard: (can) => can("fptk.view_list"),
  },
  {
    key: "manpower_summary",
    title: "Manpower",
    icon: <FiUsers size={18} color="#15803d" />,
    href: "/employees",
    guard: (can) => can("manpower"),
  },
  {
    key: "competency_summary",
    title: "Kompetensi",
    icon: <FiBarChart2 size={18} color="#b45309" />,
    href: "/assessment-monitoring",
    guard: (can) => can("competency.monitor"),
  },
  {
    key: "evaluations_summary",
    title: "Evaluasi",
    icon: <FiClipboard size={18} color="#6d28d9" />,
    href: "/evaluations",
    guard: (can) => can("evaluations.view"),
  },
];

export function getVisibleWidgets(
  can: (permission?: string | string[]) => boolean,
): WidgetMeta[] {
  return DASHBOARD_WIDGETS.filter((widget) => widget.guard(can));
}
