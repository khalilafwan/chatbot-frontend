import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";

type UserState = {
  username?: string;
  role?: string;
};

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();

  // Ambil hook values (bisa saja menghasilkan fungsi atau nilai langsung)
  const isAuthenticatedHook = useIsAuthenticated();
  const authUserHook = useAuthUser();

  // Normalisasi isAuthenticated: jika hook mengembalikan fungsi -> panggil, jika boolean -> gunakan langsung
  const isAuthenticated =
    typeof isAuthenticatedHook === "function"
      ? Boolean(isAuthenticatedHook)
      : Boolean(isAuthenticatedHook);

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Normalisasi user: jika hook mengembalikan fungsi -> panggil, jika objek -> pakai langsung
  let user: UserState | null = null;
  if (typeof authUserHook === "function") {
    try {
      user = authUserHook() as UserState | null;
    } catch {
      user = null;
    }
  } else {
    user = (authUserHook as unknown) as UserState | null;
  }

  // Jika tidak ada user atau bukan admin -> arahkan ke /chat
  const isAdmin = user && (user.role === "admin" || (user as any).status === "admin");

  if (!isAdmin) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
}
