// components/ReferralTracker.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Simpan kode referral ke localStorage agar tersimpan saat user bernavigasi atau melakukan donasi
      localStorage.setItem('islami_ref_code', refCode);
    }
  }, [searchParams]);

  return null;
}