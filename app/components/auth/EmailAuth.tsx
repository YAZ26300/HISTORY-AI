'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '../../../lib/supabase';
import { SpotlightButton } from '../ui/spotlight-button';
import { LogIn, UserPlus, KeyRound } from 'lucide-react';

interface EmailAuthProps {
  redirectUrl?: string;
}

export default function EmailAuth({ redirectUrl = '/dashboard' }: EmailAuthProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserSupabaseClient();

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
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          {message && (
            <p className="text-sm text-red-400">{message}</p>
          )}
          <div onClick={(e) => e.preventDefault()}>
            <SpotlightButton
              text={loading ? 'Connexion...' : 'Se connecter'}
              icon={<LogIn className="h-5 w-5" />}
              disabled={loading}
              onClick={() => handleSignIn(new Event('submit') as any)}
              fullWidth={true}
            />
          </div>
          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-blue-400 hover:text-blue-300"
            >
              Créer un compte
            </button>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-blue-400 hover:text-blue-300"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </form>
      )}

      {mode === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes('Vérifiez') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
          <div onClick={(e) => e.preventDefault()}>
            <SpotlightButton
              text={loading ? 'Inscription...' : 'S\'inscrire'}
              icon={<UserPlus className="h-5 w-5" />}
              disabled={loading}
              onClick={() => handleSignUp(new Event('submit') as any)}
              fullWidth={true}
            />
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </form>
      )}

      {mode === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes('Vérifiez') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
          <div onClick={(e) => e.preventDefault()}>
            <SpotlightButton
              text={loading ? 'Envoi...' : 'Réinitialiser le mot de passe'}
              icon={<KeyRound className="h-5 w-5" />}
              disabled={loading}
              onClick={() => handleResetPassword(new Event('submit') as any)}
              fullWidth={true}
            />
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Retour à la connexion
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 