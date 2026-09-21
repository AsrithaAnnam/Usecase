import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  Shield,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or Employee ID is required'),

  password: z
    .string()
    .min(1, 'Password is required'),
});

export default function Login() {
  const [role, setRole] = useState('staff');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    clearErrors();
  };

  const onSubmit = async (data) => {
    try {
      const result = await login(
        data.identifier.trim(),
        data.password,
        role
      );

      toast.success('Login successful!');

      if (result?.user?.mustChangePassword) {
        navigate('/change-password', { replace: true });
        return;
      }

      navigate(role === 'admin' ? '/admin' : '/staff', {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorations */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Page heading */}
        <div className="mb-8 text-center">
          <div className="glass mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Building2 className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold">
            Employee Management
          </h1>

          <p className="mt-2 text-white/60">
            Sign in to access your portal
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Role selection */}
          <div
            className="mb-6 flex rounded-xl bg-white/5 p-1"
            role="group"
            aria-label="Select login role"
          >
            <button
              type="button"
              onClick={() => selectRole('staff')}
              aria-pressed={role === 'staff'}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                role === 'staff'
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              Staff
            </button>

            <button
              type="button"
              onClick={() => selectRole('admin')}
              aria-pressed={role === 'admin'}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                role === 'admin'
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Identifier */}
            <div>
              <label
                htmlFor="identifier"
                className="mb-1.5 block text-sm text-white/70"
              >
                Email or Employee ID
              </label>

              <input
                id="identifier"
                type="text"
                {...register('identifier')}
                className={`glass-input ${
                  errors.identifier ? 'border-red-400' : ''
                }`}
                placeholder="Enter email or employee ID"
                autoComplete="username"
                aria-invalid={Boolean(errors.identifier)}
                aria-describedby={
                  errors.identifier ? 'identifier-error' : undefined
                }
              />

              {errors.identifier && (
                <p
                  id="identifier-error"
                  className="mt-1 text-xs text-red-400"
                  role="alert"
                >
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password field */}
<div>
  <label
    htmlFor="password"
    className="mb-1.5 block text-sm text-white/70"
  >
    Password
  </label>

  <div className="relative">
    <input
      id="password"
      type={showPassword ? 'text' : 'password'}
      {...register('password')}
      className={`glass-input pr-12 ${
        errors.password ? 'border-red-400' : ''
      }`}
      placeholder="Enter your password"
      autoComplete="current-password"
    />

    {/* Add/change the grey eye icon here */}
    <button
      type="button"
      onClick={() =>
        setShowPassword((currentValue) => !currentValue)
      }
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-700/30 hover:text-gray-200"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>

  {errors.password && (
    <p className="mt-1 text-xs text-red-400">
      {errors.password.message}
    </p>
  )}
</div>
            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}

              {isSubmitting
                ? 'Signing in...'
                : `Sign in as ${role === 'admin' ? 'Admin' : 'Staff'}`}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-white/40">
            Select the correct role before signing in.
          </p>
        </div>
      </div>
    </main>
  );
}