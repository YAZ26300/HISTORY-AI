'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import GoogleLogin from '../../components/auth/GoogleLogin';
import EmailAuth from '../../components/auth/EmailAuth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    }
  }

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">Connexion</h1>
        <p className="text-gray-600 text-center mb-8">
          Connectez-vous pour créer des histoires magiques
        </p>

        <div className="space-y-6">
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setAuthMethod('email')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                authMethod === 'email'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setAuthMethod('google')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                authMethod === 'google'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              Google
            </button>
          </div>

          {authMethod === 'email' ? (
            <EmailAuth redirectUrl={redirectUrl} />
          ) : (
            <div className="flex justify-center">
              <GoogleLogin redirectUrl={redirectUrl} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 