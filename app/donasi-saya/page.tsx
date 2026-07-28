useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. Ambil Profil User
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) setProfile(prof);

        // 2. Ambil Riwayat Donasi (Ambil dari API Sanity / endpoint transaksi user)
        try {
          const res = await fetch(`/api/donations/user?email=${user.email || ''}`);
          const json = await res.json();
          if (json.success && json.data) {
            setDonations(json.data);
          } else {
            // Fallback jika ingin mengecek juga dari tabel Supabase 'donations'
            const { data: donData } = await supabase
              .from('donations')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (donData) setDonations(donData);
          }
        } catch (err) {
          console.error('Gagal memuat riwayat donasi:', err);
        }
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);