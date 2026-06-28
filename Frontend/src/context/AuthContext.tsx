import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
} from "../api/authService";
import type { User, LoginPayload, RegisterPayload } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app mount, try to restore the session from the cookie.
  useEffect(() => {
    async function restoreSession() {
      try {
        const { user } = await getMe();
        setUser(user);
      } catch {
        // No valid session (401 after refresh attempt) — stay logged out.
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(payload: LoginPayload) {
    const { user } = await loginUser(payload);
    setUser(user);
  }

  async function register(payload: RegisterPayload) {
    // We redirect to login after register, so we don't set the user here.
    await registerUser(payload);
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      // Clear local state even if the network call fails.
      setUser(null);
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook so components can grab auth state cleanly.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}