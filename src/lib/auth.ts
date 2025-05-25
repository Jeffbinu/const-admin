import { User } from './types';
import { dataManager } from './data';

export const auth = {
  async login(username: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const user = await dataManager.authenticate(username, password);
      if (user) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        return { user, error: null };
      }
      return { user: null, error: 'Invalid credentials' };
    } catch (error) {
      return { user: null, error: 'Login failed' };
    }
  },

  logout(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
