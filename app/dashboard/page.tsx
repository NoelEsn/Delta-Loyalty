'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          router.push('/login');
          return;
        }

        const session = await response.json();

        // Redirect based on role
        if (session.role?.toUpperCase() === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (session.memberId) {
          router.push('/member/dashboard');
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
      <div className="text-gray-300 text-lg">Redirecting...</div>
    </main>
  );
}
