'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Heading } from '@radix-ui/themes';
import EmailAuth from '../../components/auth/EmailAuth';
import { SpotlightCard } from '../../components/ui/spotlight-card';
import { LockKeyhole } from 'lucide-react';

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

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const returnTo = searchParams.get('returnTo') || '/dashboard';
        router.push(returnTo);
      }
    };

    checkUser();
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BackgroundGradient />
      <SpotlightCard className="w-full max-w-md p-8">
        <Heading size="6" mb="4" align="center">
          Connexion
        </Heading>
        <EmailAuth mode="login" />
      </SpotlightCard>
    </div>
  );
} 