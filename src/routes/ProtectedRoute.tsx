// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   allowedRoles?: string[];
//   adminOnly?: boolean;
//   manpowerOnly?: boolean;
//   assessorOnly?: boolean;
//   qaOnly?: boolean;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
//   children,
//   allowedRoles,
//   adminOnly = false,
//   manpowerOnly = false,
//   assessorOnly = false,
//   qaOnly = false,
// }) => {
//   const { isAuthenticated, isLoading, user } = useAuth();

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   const isAdmin = user?.is_admin === true || user?.role?.name === "Admin";
//   if (qaOnly && !isAdmin && user?.role?.name !== "Quality Assurance") {
//     return <Navigate to="/unauthorized" replace />;
//   }
//   if (adminOnly && !isAdmin) {
//     return <Navigate to="/unauthorized" replace />;
//   }
//   if (manpowerOnly && !isAdmin && !user?.can_view_manpower) {
//     return <Navigate to="/unauthorized" replace />;
//   }
//   if (
//     assessorOnly &&
//     !isAdmin &&
//     !["Leader", "Section Head", "Manager"].includes(user?.role?.name ?? "")
//   ) {
//     return <Navigate to="/unauthorized" replace />;
//   }
//   if (allowedRoles && !allowedRoles.includes(user?.role?.name ?? "")) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePermission } from "../hooks/usePermission";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Permission key (atau array key) yang dibutuhkan untuk akses halaman ini.
   * Kalau tidak diisi, halaman hanya butuh login (tanpa syarat permission spesifik).
   * Kalau array, user lolos jika punya SALAH SATU dari permission tsb.
   *
   * Contoh:
   *   <ProtectedRoute permission="fptk.create">
   *   <ProtectedRoute permission={["evaluations.view", "evaluations.hr_decisions"]}>
   */
  permission?: string | string[];
  /**
   * Untuk halaman Data Master (Users, Area/Line/Station, Competency Matrix,
   * Evaluation Form, Permission Matrix). Halaman-halaman ini TIDAK diatur
   * lewat permission matrix — cukup butuh is_admin. Gunakan prop ini,
   * bukan `permission`, untuk route-route tersebut.
   *
   * Contoh:
   *   <ProtectedRoute adminOnly>
   */
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  adminOnly,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { can } = usePermission();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user?.is_admin) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!can(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
