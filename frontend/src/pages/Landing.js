import React from 'react';
import { useHistory } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const Landing = () => {
  const history = useHistory();

  const handleAdminLogin = () => history.push('/login?role=admin');
  const handleAdminRegister = () => history.push('/admin-register');
  const handleCashierLogin = () => history.push('/login?role=cashier');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white mb-4">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">POS Portal</h1>
          <p className="mt-2 text-slate-600">Choose your role to sign in or create an account.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 items-stretch">
          <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Admin</h2>
                <p className="text-sm text-slate-500">Management and reporting access</p>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button
                onClick={handleAdminLogin}
                className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                Admin Login
              </button>
              <button
                onClick={handleAdminRegister}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Admin Register
              </button>
            </div>
          </section>

          <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Cashier</h2>
                <p className="text-sm text-slate-500">Sales and checkout access</p>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button
                onClick={handleCashierLogin}
                className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                Cashier Login
              </button>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                Cashier accounts are created by admins.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Landing;
