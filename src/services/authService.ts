import { User } from '../types';

const API_BASE = 'https://api.pyroguard.app';

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  private constructor() {
    this.loadUserSession();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadUserSession() {
    try {
      const savedLocal = localStorage.getItem('pyroguard_current_user');
      const savedSession = sessionStorage.getItem('pyroguard_current_user');
      const saved = savedLocal || savedSession;
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load user session:', e);
    }
  }

  public subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public async login(email: string, pass: string, remember: boolean): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const endpoints = [
        `${API_BASE}/api/login`,
        `${API_BASE}/login`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
          });

          const data = await res.json();
          if (res.ok && data.success && data.user) {
            this.currentUser = data.user;
            if (remember) {
              localStorage.setItem('pyroguard_current_user', JSON.stringify(data.user));
            } else {
              sessionStorage.setItem('pyroguard_current_user', JSON.stringify(data.user));
            }
            this.notify();
            return { success: true, user: data.user };
          } else if (data.error) {
            return { success: false, error: data.error };
          }
        } catch (err) {
          console.warn('Endpoint failed:', url, err);
        }
      }

      return { success: false, error: 'Gagal terhubung ke server autentikasi (API /login).' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Terjadi kesalahan saat login.' };
    }
  }

  public async register(name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    try {
      const endpoints = [
        `${API_BASE}/api/register`,
        `${API_BASE}/register`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: pass }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            return { success: true };
          } else if (data.error) {
            return { success: false, error: data.error };
          }
        } catch (err) {
          console.warn('Endpoint failed:', url, err);
        }
      }

      return { success: false, error: 'Gagal terhubung ke server registrasi (API /register).' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Terjadi kesalahan saat mendaftar.' };
    }
  }

  public async forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const endpoints = [
        `${API_BASE}/api/forgot-password`,
        `${API_BASE}/forgot-password`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            return { success: true, message: data.message || 'Instruksi pemulihan password telah dikirim.' };
          } else if (data.error) {
            return { success: false, error: data.error };
          }
        } catch (err) {
          console.warn('Endpoint failed:', url, err);
        }
      }

      return { success: false, error: 'Gagal menghubungi server untuk reset password.' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Terjadi kesalahan.' };
    }
  }

  public logout() {
    this.currentUser = null;
    localStorage.removeItem('pyroguard_current_user');
    sessionStorage.removeItem('pyroguard_current_user');
    this.notify();
  }
}

export const authService = AuthService.getInstance();
