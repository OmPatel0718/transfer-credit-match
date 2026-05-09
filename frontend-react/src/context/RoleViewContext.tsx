import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { basicAuthHeader, getJson } from '../lib/api';

export type Role = 'admin' | 'student' | 'director';
type UserProfileResponse = { userId?: number; name?: string; role: Role; email: string };

type RoleViewContextValue = {
  role: Role;
  isLoggedIn: boolean;
  authEmail: string;
  authPassword: string;
  userId: number | null;
  displayName: string;
  setRole: (role: Role) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setAuthSession: (email: string, password: string) => void;
  setUserIdentity: (userId: number | null, name: string) => void;
  clearAuthSession: () => void;
};

const ROLE_STORAGE_KEY = 'tc_role';
const LOGIN_STORAGE_KEY = 'tc_logged_in';
const AUTH_EMAIL_KEY = 'tc_auth_email';
/** Password kept in sessionStorage only (tab-scoped), not localStorage. */
const AUTH_PASSWORD_KEY = 'tc_auth_password';
const AUTH_USER_ID_KEY = 'tc_user_id';
const AUTH_DISPLAY_NAME_KEY = 'tc_display_name';

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
  const [userId, setUserId] = useState<number | null>(() => {
    const raw = sessionStorage.getItem(AUTH_USER_ID_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  });
  const [displayName, setDisplayName] = useState(() => sessionStorage.getItem(AUTH_DISPLAY_NAME_KEY) ?? '');

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
      setUserId(null);
      setDisplayName('');
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
    setUserId(null);
    setDisplayName('');
    sessionStorage.removeItem(AUTH_EMAIL_KEY);
    sessionStorage.removeItem(AUTH_PASSWORD_KEY);
    sessionStorage.removeItem(AUTH_USER_ID_KEY);
    sessionStorage.removeItem(AUTH_DISPLAY_NAME_KEY);
  };

  const setUserIdentity = (nextUserId: number | null, name: string) => {
    setUserId(nextUserId);
    setDisplayName(name);
    if (nextUserId == null) sessionStorage.removeItem(AUTH_USER_ID_KEY);
    else sessionStorage.setItem(AUTH_USER_ID_KEY, String(nextUserId));
    if (!name) sessionStorage.removeItem(AUTH_DISPLAY_NAME_KEY);
    else sessionStorage.setItem(AUTH_DISPLAY_NAME_KEY, name);
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem(LOGIN_STORAGE_KEY) === 'true';
    if (loggedIn && !sessionStorage.getItem(AUTH_PASSWORD_KEY)) {
      setIsLoggedInState(false);
      localStorage.setItem(LOGIN_STORAGE_KEY, 'false');
    }
  }, []);

  useEffect(() => {
    if (!isLoggedInState || !authEmail || !authPassword) return;
    let cancelled = false;
    getJson<UserProfileResponse>('/api/users/me', { headers: basicAuthHeader(authEmail, authPassword) })
      .then((profile) => {
        if (cancelled || !profile?.role) return;
        if (profile.role !== roleState) {
          setRoleState(profile.role);
          localStorage.setItem(ROLE_STORAGE_KEY, profile.role);
        }
        if (profile.name) {
          setDisplayName(profile.name);
          sessionStorage.setItem(AUTH_DISPLAY_NAME_KEY, profile.name);
        }
        if (profile.userId != null) {
          setUserId(profile.userId);
          sessionStorage.setItem(AUTH_USER_ID_KEY, String(profile.userId));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setIsLoggedInState(false);
        localStorage.setItem(LOGIN_STORAGE_KEY, 'false');
        sessionStorage.removeItem(AUTH_EMAIL_KEY);
        sessionStorage.removeItem(AUTH_PASSWORD_KEY);
        sessionStorage.removeItem(AUTH_USER_ID_KEY);
        sessionStorage.removeItem(AUTH_DISPLAY_NAME_KEY);
        setAuthEmail('');
        setAuthPassword('');
        setUserId(null);
        setDisplayName('');
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedInState, authEmail, authPassword, roleState]);

  const value = useMemo(
    () => ({
      role: roleState,
      isLoggedIn: isLoggedInState,
      authEmail,
      authPassword,
      userId,
      displayName,
      setRole,
      setIsLoggedIn,
      setAuthSession,
      setUserIdentity,
      clearAuthSession,
    }),
    [roleState, isLoggedInState, authEmail, authPassword, userId, displayName],
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
