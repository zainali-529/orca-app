import api from '@/lib/api-instance';
import type { ApiResponse } from '@/lib/types/auth.types';
import type { ClientDashboard } from '@/lib/types/dashboard.types';

// GET /api/dashboard — client personalised dashboard
export const getClientDashboardApi = () =>
  api.get<ApiResponse<ClientDashboard>>('/dashboard');