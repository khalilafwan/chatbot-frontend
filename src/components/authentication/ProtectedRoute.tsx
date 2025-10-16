// src/components/ProtectedRoute.tsx
import RequireAuth from '@auth-kit/react-router/RequireAuth';
import { Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  return (
    <RequireAuth fallbackPath="/">
      <Outlet />
    </RequireAuth>
  );
}
