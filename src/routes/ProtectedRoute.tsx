import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  adminOnly?: boolean;
  manpowerOnly?: boolean;
  assessorOnly?: boolean;
  qaOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  adminOnly = false,
  manpowerOnly = false,
  assessorOnly = false,
  qaOnly = false,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const isAdmin = user?.is_admin === true || user?.role?.name === "Admin";
  if (qaOnly && !isAdmin && user?.role?.name !== "Quality Assurance") {
    return <Navigate to="/unauthorized" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (manpowerOnly && !isAdmin && !user?.can_view_manpower) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (assessorOnly && !isAdmin && !["Leader", "Section Head", "Manager"].includes(user?.role?.name ?? "")) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role?.name ?? "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
