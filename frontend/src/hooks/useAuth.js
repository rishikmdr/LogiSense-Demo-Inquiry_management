import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../api/client';
import useAuthStore from '../store/authStore';

export function useAuth() {
  const { token, user, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ username, password }) =>
      client.post('/auth/login', { username, password }).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success(`Welcome back, ${data.user.full_name}!`);
      navigate('/');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Login failed');
    },
  });

  const logout = async () => {
    try { await client.post('/auth/logout'); } catch (_) {}
    storeLogout();
    navigate('/login');
  };

  return {
    token,
    user,
    isAuthenticated: !!token,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    logout,
  };
}
