import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext.jsx';
import { showToast } from '../utils/toast.js';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Warehouse,
} from 'lucide-react';

const demoAccounts = [
  {
    label: 'Admin',
    email: 'admin@military.com',
    password: 'Admin@123',
    detail: 'Full system access',
  },
  {
    label: 'Logistics',
    email: 'logistics1@military.com',
    password: 'Officer@123',
    detail: 'Purchases and transfers',
  },
  {
    label: 'Commander',
    email: 'commander1@military.com',
    password: 'Officer@123',
    detail: 'Base operations',
  },
];

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'admin@military.com',
      password: 'Admin@123',
    },
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const fillDemoAccount = (account) => {
    setValue('email', account.email, { shouldValidate: true });
    setValue('password', account.password, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      showToast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_38%,rgba(16,185,129,0.22),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.2),rgba(20,83,45,0.38))]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-emerald-300/30 bg-emerald-400/10">
                <ShieldCheck className="h-7 w-7 text-emerald-300" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-200">
                  Command Ledger
                </p>
                <h1 className="text-2xl font-bold tracking-tight">
                  Military Asset Manager
                </h1>
              </div>
            </div>

            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
                Operational Control
              </p>
              <h2 className="text-5xl font-bold leading-tight tracking-tight">
                Asset visibility for every base, transfer, and assignment.
              </h2>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: 'Bases', value: '03', icon: Warehouse },
                  { label: 'Roles', value: '03', icon: BadgeCheck },
                  { label: 'Audit', value: 'Live', icon: Radar },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-md border border-white/10 bg-white/10 p-4 backdrop-blur"
                    >
                      <Icon className="mb-4 h-5 w-5 text-emerald-200" />
                      <p className="text-2xl font-bold">{item.value}</p>
                      <p className="text-sm text-slate-300">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6 text-sm text-slate-300">
              <span>MongoDB Atlas</span>
              <span>Render API</span>
              <span>Vercel Frontend</span>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-800 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">
                  Command Ledger
                </p>
                <h1 className="text-xl font-bold text-slate-950">
                  Military Asset Manager
                </h1>
              </div>
            </div>

            <div className="command-surface rounded-lg p-6 sm:p-8">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Secure access
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                  Sign in
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Use your assigned role credentials to enter the asset command console.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="field-label mb-2 block">Email</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="field-input"
                    placeholder="admin@military.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="field-label mb-2 block">Password</label>
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className="field-input"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="primary-button w-full"
                >
                  {isLoading ? 'Authenticating...' : 'Enter dashboard'}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Demo access</p>
                  <p className="text-xs font-medium text-slate-500">Click to fill</p>
                </div>
                <div className="space-y-2">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => fillDemoAccount(account)}
                      className="flex w-full items-center justify-between rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-left transition hover:border-emerald-700/30 hover:bg-emerald-50"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {account.label}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {account.email}
                        </span>
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {account.detail}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Protected logistics workspace for authorized personnel.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};
