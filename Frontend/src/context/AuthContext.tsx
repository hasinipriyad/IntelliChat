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
  refreshToken,
} from "../api/authService";
import {
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
} from "../api/axios";
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

  // On app mount, try to restore session using a stored refresh token.
  useEffect(() => {
    async function restoreSession() {
      const storedRefreshToken = getRefreshToken();

      if (!storedRefreshToken) {
        setLoading(false);
        return;
      }

      try {
        // Exchange the stored refresh token for a new access token
        const { accessToken: newAccessToken } = await refreshToken(storedRefreshToken);
        setAccessToken(newAccessToken);

        // Now fetch the user
        const { user } = await getMe();
        setUser(user);
      } catch {
        // Refresh token expired or revoked — clear everything
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(payload: LoginPayload) {
    const { user, accessToken, refreshToken: newRefreshToken } = await loginUser(payload);
    // Store tokens
    if (accessToken) setAccessToken(accessToken);
    if (newRefreshToken) setRefreshToken(newRefreshToken);
    setUser(user);
  }

  async function register(payload: RegisterPayload) {
    // Redirect to login after register — no token needed here
    await registerUser(payload);
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
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
