'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SpotlightButton } from '../../components/ui/spotlight-button';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/spotlight-card';

// Styles pour le fond animé
const BackgroundGradient = () => (
  <div className="fixed inset-0 z-[-1] bg-black">
    <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900"></div>
    <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] bg-[size:20px_20px] opacity-50"></div>
    {[...Array(5)].map((_, i) => (
      <div 
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${Math.random() * 400 + 100}px`,
          height: `${Math.random() * 400 + 100}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          backgroundColor: ['#3B82F6', '#4338CA', '#6366F1', '#8B5CF6', '#A78BFA'][i % 5],
          filter: 'blur(80px)',
          opacity: 0.15,
          transform: 'translate(-50%, -50%)',
          animation: `float-${i} ${Math.random() * 10 + 15}s ease-in-out infinite alternate`
        }}
      />
    ))}
  </div>
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      setMessage('Votre mot de passe a été mis à jour avec succès');

      // Redirection après 3 secondes
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 3000);
    } catch (error: any) {
      setMessage(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundGradient />
      
      <SpotlightCard 
        className="w-full max-w-md p-8 rounded-2xl border-[#333] bg-[#121212]"
        spotlightColor="rgba(99, 102, 241, 0.4)"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <ShieldCheck size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Réinitialiser le mot de passe
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Entrez votre nouveau mot de passe
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>

          {message && (
            <p className={`text-sm ${success ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <SpotlightButton
            text={loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            icon={<KeyRound className="h-5 w-5" />}
            disabled={loading || success}
            onClick={() => !loading && !success && handleResetPassword(new Event('submit') as any)}
            fullWidth={true}
          />
        </form>
      </SpotlightCard>
    </div>
  );
} 