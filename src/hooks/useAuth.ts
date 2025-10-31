import { useState, useEffect } from 'react';
import { Auth } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  const setAuthStore = useAuthStore((s: any) => s.setAuth)
  const clearAuth = useAuthStore((s: any) => s.clearAuth)
  const token = useAuthStore((s: any) => s.idToken)

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await Auth.loginEmail(email, password);
      setUser(res.user);
      setAuthStore({
        uid: res.user.id,
        email: res.user.email,
        name: (res.user as any).name ?? null,
        phone: (res.user as any).phone ?? null,
        photoUrl: (res.user as any).photoUrl ?? null,
      }, res.idToken);
      return res;
    } catch (err) {
      setError(err as unknown);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      const res = await Auth.registerEmail(email, password, phone ?? null);
      setUser(res.user);
      setAuthStore({ uid: res.user.id, email: res.user.email, phone: phone ?? null }, res.idToken);
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
      setAuthStore({
        uid: res.user.id,
        email: res.user.email,
        name: (res.user as any).name ?? null,
        phone: (res.user as any).phone ?? null,
        photoUrl: (res.user as any).photoUrl ?? null,
      }, res.idToken)
      return res
    } catch (err) {
      setError(err as unknown)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true);
    try {
      await Auth.logout();
      setUser(null);
      clearAuth();
    } catch (err) {
      setError(err as unknown);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true)
      try {
        if (!token) { setUser(null); return }
        const u = await Auth.me(token)
        setUser(u)
        if (u) {
          setAuthStore({ uid: u.id, email: u.email ?? null, name: (u as any).name ?? null, phone: (u as any).phone ?? null, photoUrl: (u as any).photoUrl ?? null }, token)
        }
      } catch (err) {
        setError(err as unknown)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token, setAuthStore]);

  return { user, loading, error, login, register, loginWithGoogle, logout };
};

export default useAuth;