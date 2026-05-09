import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoleView } from '../context/RoleViewContext';
import { ApiError, postJsonData } from '../lib/api';
import type { Role } from '../context/RoleViewContext';

type LoginFormData = {
  email: string;
  password: string;
};

type LoginFormErrors = {
  email?: string;
  password?: string;
};

type LoginResponse = {
  userId?: number;
  name?: string;
  email?: string;
  role?: Role;
  message?: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setRole, setAuthSession, setUserIdentity } = useRoleView();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateForm = (): LoginFormErrors => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password.trim()) {
  newErrors.password = 'Password is required.';
}

    return newErrors;
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoginError('');
    setIsSubmitting(true);
    try {
      const response = await postJsonData<LoginResponse>('/api/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });
      const role: Role =
        response?.role === 'admin' || response?.role === 'director' || response?.role === 'student'
          ? response.role
          : 'student';
      setRole(role);
      setAuthSession(formData.email.trim(), formData.password);
      setUserIdentity(response?.userId ?? null, response?.name?.trim() ?? '');
      setIsLoggedIn(true);
      if (role === 'admin' || role === 'director') navigate('/dashboard');
      else navigate('/');
    } catch (e) {
      if (e instanceof ApiError) {
        setLoginError(e.body || 'Login failed.');
      } else {
        setLoginError('Network error. Is the backend running?');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '2.5rem 1rem',
      }}
    >
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1
          style={{
            marginBottom: '0.5rem',
            fontSize: '2rem',
            fontWeight: 700,
          }}
        >
          Sign in
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Enter your credentials to access Transfer Credit Match.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '1.75rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        

  {loginError && (
    <div
      style={{
        background: "#fdecea",
        border: "1px solid #f5c2c7",
        color: "#b42318",
        padding: "0.75rem",
        borderRadius: "8px",
        fontSize: "0.9rem"
      }}
    >
      {loginError}
    </div>
  )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            htmlFor="email"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            style={{
              height: 44,
              padding: '0 0.85rem',
              borderRadius: '8px',
              border: errors.email ? '1px solid #d32f2f' : '1px solid #cfcfcf',
              fontSize: '1rem',
              outline: 'none',
              backgroundColor: '#fff',
            }}
          />

          {errors.email && (
            <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>
              {errors.email}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              Password
            </label>

            <a
              href="#"
              style={{
                fontSize: '0.875rem',
                color: '#1976d2',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </a>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              style={{
                height: 44,
                width: '100%',
                padding: '0 3rem 0 0.85rem',
                borderRadius: '8px',
                border: errors.password ? '1px solid #d32f2f' : '1px solid #cfcfcf',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#fff',
                boxSizing: 'border-box',
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#555',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {errors.password && (
            <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>
              {errors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            height: 46,
            borderRadius: '999px',
            border: 'none',
            backgroundColor: isSubmitting ? '#6b7280' : '#111827',
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginTop: '0.25rem',
          }}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p
          style={{
            textAlign: 'center',
            margin: 0,
            color: '#555',
            fontSize: '0.95rem',
          }}
        >
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#1976d2',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create an account
          </Link>
        </p>

      </form>
    </div>
  );
}

export default LoginPage;