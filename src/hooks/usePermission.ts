import { useAuth } from "../contexts/AuthContext";

export const usePermission = () => {
  const { user } = useAuth();

  const can = (permission?: string | string[]): boolean => {
    if (!permission) return true; // tidak ada syarat permission = bebas akses (asal sudah login)

    const required = Array.isArray(permission) ? permission : [permission];
    const owned = user?.permissions ?? [];

    return required.some((p) =>
      p === "manpower" ? !!user?.can_view_manpower : owned.includes(p),
    );
  };

  return {
    can,
    permissions: user?.permissions ?? [],

    isAdmin: !!user?.is_admin,
  };
};
