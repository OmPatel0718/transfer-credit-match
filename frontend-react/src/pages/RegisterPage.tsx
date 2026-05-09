import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, postJsonText } from '../lib/api';

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
};

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): RegisterFormErrors => {
    const newErrors: RegisterFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role.';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleChange = (field: keyof RegisterFormData, value: string) => {
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
    setRegisterError('');
    setRegisterSuccess('');

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const message = await postJsonText('/api/auth/register', {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      setRegisterSuccess(message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) {
      if (e instanceof ApiError) {
        setRegisterError(e.body || 'Registration failed.');
      } else {
        setRegisterError('Network error. Is the backend running on port 8080?');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 520,
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
          Create an account
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Fill out the form below to register for Transfer Credit Match.
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
        {registerError && (
          <div
            style={{
              background: '#fdecea',
              border: '1px solid #f5c2c7',
              color: '#b42318',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          >
            {registerError}
          </div>
        )}
        {registerSuccess && (
          <div
            style={{
              background: '#ecfdf3',
              border: '1px solid #6ee7b7',
              color: '#166534',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          >
            {registerSuccess}
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="firstName" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              style={{
                height: 44,
                padding: '0 0.85rem',
                borderRadius: '8px',
                border: errors.firstName ? '1px solid #d32f2f' : '1px solid #cfcfcf',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#fff',
              }}
            />
            {errors.firstName && (
              <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>
                {errors.firstName}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="lastName" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              style={{
                height: 44,
                padding: '0 0.85rem',
                borderRadius: '8px',
                border: errors.lastName ? '1px solid #d32f2f' : '1px solid #cfcfcf',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#fff',
              }}
            />
            {errors.lastName && (
              <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>
                {errors.lastName}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="email" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
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
          <label htmlFor="role" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            style={{
              height: 44,
              padding: '0 0.85rem',
              borderRadius: '8px',
              border: errors.role ? '1px solid #d32f2f' : '1px solid #cfcfcf',
              fontSize: '1rem',
              outline: 'none',
              backgroundColor: '#fff',
            }}
          >
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="director">Program Director</option>
            <option value="admin">Administrator</option>
          </select>
          {errors.role && (
            <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>
              {errors.role}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="password" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            htmlFor="confirmPassword"
            style={{ fontWeight: 600, fontSize: '0.95rem' }}
          >
            Confirm password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              style={{
                height: 44,
                width: '100%',
                padding: '0 3rem 0 0.85rem',
                borderRadius: '8px',
                border: errors.confirmPassword
                  ? '1px solid #d32f2f'
                  : '1px solid #cfcfcf',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#fff',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
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
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.confirmPassword && (
            <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>
              {errors.confirmPassword}
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
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        <p
          style={{
            textAlign: 'center',
            margin: 0,
            color: '#555',
            fontSize: '0.95rem',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#1976d2',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </p>

      </form>
    </div>
  );
}

export default RegisterPage;