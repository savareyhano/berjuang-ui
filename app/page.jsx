'use client';
import LandingLayout from './layouts/LandingLayout';
import Hero from '@/components/landingPage/hero';
import Feature from '@/components/landingPage/features';
import Benefit from '@/components/landingPage/benefits';
import Team from '@/components/landingPage/team';
import useLanguageStore from '@/lib/zustand/useLanguageStore';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useUserStore from '@/lib/zustand/useUserStore';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isHydrated } = useLanguageStore((state) => state);
  const { setUser, setIsLogin } = useUserStore((state) => state);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDataUser = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          withCredentials: true,
        });
        const isPressLogin = localStorage.getItem('isPressLogin') || '';

        if (isPressLogin === 'true') {
          localStorage.removeItem('isPressLogin');
          router.push('/dashboard');
        } else {
          setIsLoading(false);
        }

        setIsLogin(true);
        setUser(data.data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    fetchDataUser();
  }, [router, setIsLogin, setUser]);

  if (isLoading || !isHydrated) return null;

  return (
    <LandingLayout>
      <Hero />
      <Feature />
      <Benefit />
      <Team />
    </LandingLayout>
  );
}
