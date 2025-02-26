'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SpotlightButton } from '../ui/spotlight-button';
import { Mail } from 'lucide-react';

interface EmailAuthProps {
  mode: 'login' | 'signup' | 'reset';
}

export default function EmailAuth({ mode }: EmailAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Vérifiez votre email pour confirmer votre inscription.');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage('Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}
      
      {message && (
        <div className="p-3 rounded bg-green-500/10 border border-green-500/20 text-green-500">
          {message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg bg-[var(--input-background)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {mode !== 'reset' && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-[var(--input-background)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <SpotlightButton
        type="submit"
        text={loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'S\'inscrire' : 'Réinitialiser'}
        icon={<Mail className="w-5 h-5" />}
        disabled={loading}
        fullWidth={true}
      />
    </form>
  );
} 