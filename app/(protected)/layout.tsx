'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { Theme } from '@radix-ui/themes';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      }
    };

    checkUser();
  }, [supabase.auth, router]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <Theme appearance="dark">
        <Toaster position="bottom-right" />
        {children}
      </Theme>
    </ThemeProvider>
  );
} 