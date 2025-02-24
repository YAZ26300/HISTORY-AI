'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface EmailAuthProps {
  redirectUrl?: string;
}

export default function EmailAuth({ redirectUrl = '/dashboard' }: EmailAuthProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      window.location.href = redirectUrl;
    } catch (error: any) {
      setMessage(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectUrl}`,
        },
      });

      if (error) throw error;

      setMessage('Vérifiez votre email pour confirmer votre inscription');
    } catch (error: any) {
      setMessage(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setMessage('Vérifiez votre email pour réinitialiser votre mot de passe');
    } catch (error: any) {
      setMessage(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {mode === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          {message && (
            <p className="text-sm text-red-600">{message}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-blue-600 hover:text-blue-800"
            >
              Créer un compte
            </button>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-blue-600 hover:text-blue-800"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </form>
      )}

      {mode === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes('Vérifiez') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </form>
      )}

      {mode === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes('Vérifiez') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Envoi...' : 'Réinitialiser le mot de passe'}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Retour à la connexion
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 