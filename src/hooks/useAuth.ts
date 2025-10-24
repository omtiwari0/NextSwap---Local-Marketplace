import { useState, useEffect } from 'react';
import { Auth } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  const setAuthStore = useAuthStore((s: any) => s.setAuth)

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await Auth.loginEmail(email, password);
      setUser(res.user);
      setAuthStore({ uid: res.user.id, phoneNumber: null }, res.idToken);
    } catch (err) {
      setError(err as unknown);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      const res = await Auth.registerEmail(email, password, phone ?? null);
      setUser(res.user);
      setAuthStore({ uid: res.user.id, phoneNumber: phone ?? null }, res.idToken);
    } catch (err) {
      setError(err as unknown);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      const res = await Auth.loginGoogle()
      setUser(res.user)
      setAuthStore({ uid: res.user.id, phoneNumber: null }, res.idToken)
    } catch (err) {
      setError(err as unknown)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true);
    try {
      await Auth.logout();
      setUser(null);
    } catch (err) {
      setError(err as unknown);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await Auth.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(err as unknown);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error, login, register, loginWithGoogle, logout };
};

export default useAuth;