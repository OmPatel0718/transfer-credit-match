import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'admin' | 'student' | 'director';

type RoleViewContextValue = {
  role: Role;
  isLoggedIn: boolean;
  authEmail: string;
  authPassword: string;
  setRole: (role: Role) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setAuthSession: (email: string, password: string) => void;
  clearAuthSession: () => void;
};

const ROLE_STORAGE_KEY = 'tc_role';
const LOGIN_STORAGE_KEY = 'tc_logged_in';
const AUTH_EMAIL_KEY = 'tc_auth_email';
/** Password kept in sessionStorage only (tab-scoped), not localStorage. */
const AUTH_PASSWORD_KEY = 'tc_auth_password';

const RoleViewContext = createContext<RoleViewContextValue | undefined>(undefined);

function getInitialRole(): Role {
  const storedRole = localStorage.getItem(ROLE_STORAGE_KEY);
  if (storedRole === 'admin' || storedRole === 'director') return storedRole;
  return 'student';
}

function getInitialLoginState() {
  return localStorage.getItem(LOGIN_STORAGE_KEY) === 'true';
}

function readSessionCredentials(): { email: string; password: string } {
  return {
    email: sessionStorage.getItem(AUTH_EMAIL_KEY) ?? '',
    password: sessionStorage.getItem(AUTH_PASSWORD_KEY) ?? '',
  };
}

export function RoleViewProvider({ children }: { children: ReactNode }) {
  const [roleState, setRoleState] = useState<Role>(getInitialRole);
  const [isLoggedInState, setIsLoggedInState] = useState(getInitialLoginState);
  const [authEmail, setAuthEmail] = useState(() => readSessionCredentials().email);
  const [authPassword, setAuthPassword] = useState(() => readSessionCredentials().password);

  const setRole = (role: Role) => {
    setRoleState(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  };

  const setIsLoggedIn = (isLoggedIn: boolean) => {
    setIsLoggedInState(isLoggedIn);
    localStorage.setItem(LOGIN_STORAGE_KEY, String(isLoggedIn));
    if (!isLoggedIn) {
      sessionStorage.removeItem(AUTH_EMAIL_KEY);
      sessionStorage.removeItem(AUTH_PASSWORD_KEY);
      setAuthEmail('');
      setAuthPassword('');
    }
  };

  const setAuthSession = (email: string, password: string) => {
    setAuthEmail(email);
    setAuthPassword(password);
    sessionStorage.setItem(AUTH_EMAIL_KEY, email);
    sessionStorage.setItem(AUTH_PASSWORD_KEY, password);
  };

  const clearAuthSession = () => {
    setAuthEmail('');
    setAuthPassword('');
    sessionStorage.removeItem(AUTH_EMAIL_KEY);
    sessionStorage.removeItem(AUTH_PASSWORD_KEY);
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem(LOGIN_STORAGE_KEY) === 'true';
    if (loggedIn && !sessionStorage.getItem(AUTH_PASSWORD_KEY)) {
      setIsLoggedInState(false);
      localStorage.setItem(LOGIN_STORAGE_KEY, 'false');
    }
  }, []);

  const value = useMemo(
    () => ({
      role: roleState,
      isLoggedIn: isLoggedInState,
      authEmail,
      authPassword,
      setRole,
      setIsLoggedIn,
      setAuthSession,
      clearAuthSession,
    }),
    [roleState, isLoggedInState, authEmail, authPassword],
  );

  return <RoleViewContext.Provider value={value}>{children}</RoleViewContext.Provider>;
}

export function useRoleView() {
  const context = useContext(RoleViewContext);
  if (!context) {
    throw new Error('useRoleView must be used within a RoleViewProvider');
  }
  return context;
}
