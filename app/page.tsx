'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/boards');
    } else {
      router.push('/auth');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}
