import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => client.get('/dashboard/kpis').then((r) => r.data),
    refetchInterval: 60000,
  });
}

export function usePipelineData() {
  return useQuery({
    queryKey: ['dashboard', 'pipeline'],
    queryFn: () => client.get('/dashboard/pipeline').then((r) => r.data),
    refetchInterval: 60000,
  });
}

export function useRouteData() {
  return useQuery({
    queryKey: ['dashboard', 'by-route'],
    queryFn: () => client.get('/dashboard/by-route').then((r) => r.data),
    refetchInterval: 60000,
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => client.get('/dashboard/activity').then((r) => r.data),
    refetchInterval: 30000,
  });
}

export function useConsolidationOpportunities() {
  return useQuery({
    queryKey: ['consolidation'],
    queryFn: () => client.get('/consolidation-opportunities').then((r) => r.data),
    refetchInterval: 120000,
  });
}
