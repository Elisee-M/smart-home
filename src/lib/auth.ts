import { firebaseUtils } from './firebase';

export interface User {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userKey: string | null;
}

const AUTH_STORAGE_KEY = 'smart_home_auth';

export const authUtils = {
  // Verify user credentials
  async verifyCredentials(email: string, password: string): Promise<{ user: User; userKey: string } | null> {
    try {
      const credentials = await firebaseUtils.readOnce('credentials');
      
      if (!credentials) return null;

      for (const [userKey, userData] of Object.entries(credentials) as [string, User][]) {
        if (userData.email === email && userData.password === password) {
          return { user: userData, userKey };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return null;
    }
  },

  // Save auth state to storage
  saveAuthState(user: User, userKey: string) {
    const authState: AuthState = {
      isAuthenticated: true,
      user,
      userKey
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  },

  // Load auth state from storage
  loadAuthState(): AuthState {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
    
    return {
      isAuthenticated: false,
      user: null,
      userKey: null
    };
  },

  // Clear auth state
  clearAuthState() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Change password
  async changePassword(userKey: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await firebaseUtils.readOnce(`credentials/${userKey}`);
      
      if (!user || user.password !== oldPassword) {
        return false;
      }

      await firebaseUtils.write(`credentials/${userKey}/password`, newPassword);
      
      // Update local storage
      const authState = this.loadAuthState();
      if (authState.user) {
        authState.user.password = newPassword;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      }
      
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  },

  // Add new user (admin only)
  async addUser(userKey: string, userData: User): Promise<boolean> {
    try {
      await firebaseUtils.write(`credentials/${userKey}`, userData);
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<Record<string, User> | null> {
    try {
      return await firebaseUtils.readOnce('credentials');
    } catch (error) {
      console.error('Error getting users:', error);
      return null;
    }
  },

  // Delete user (admin only)
  async deleteUser(userKey: string): Promise<boolean> {
    try {
      await firebaseUtils.write(`credentials/${userKey}`, null);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
};