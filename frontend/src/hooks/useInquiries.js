import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import client from '../api/client';

export function useInquiries(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, v);
  });

  return useQuery({
    queryKey: ['inquiries', filters],
    queryFn: () => client.get(`/inquiries?${params.toString()}`).then((r) => r.data),
  });
}

export function useInquiry(id) {
  return useQuery({
    queryKey: ['inquiry', id],
    queryFn: () => client.get(`/inquiries/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => client.post('/inquiries', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Inquiry created successfully');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create inquiry'),
  });
}

export function useUpdateInquiry(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => client.put(`/inquiries/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['inquiry', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Inquiry updated');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update inquiry'),
  });
}

export function useUpdateStatus(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status) => client.patch(`/inquiries/${id}/status`, { status }).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['inquiry', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Status updated to ${data.status}`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update status'),
  });
}

export function useDeleteInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => client.delete(`/inquiries/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Inquiry deleted');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete inquiry'),
  });
}

export function useAddRemark(inquiryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (remark) => client.post(`/inquiries/${inquiryId}/remarks`, { remark }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inquiry', inquiryId] });
      qc.invalidateQueries({ queryKey: ['inquiries'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add remark'),
  });
}

export function useLookupData() {
  return useQuery({
    queryKey: ['lookup'],
    queryFn: () => client.get('/users/lookup').then((r) => r.data),
    staleTime: 300000,
  });
}

export function useCheckDuplicate() {
  return useMutation({
    mutationFn: (data) => client.post('/inquiries/check-duplicate', data).then((r) => r.data),
  });
}
