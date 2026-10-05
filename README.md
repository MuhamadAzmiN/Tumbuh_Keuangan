# 🎯 PENCATATAN AZMI

Aplikasi personal finance tracker modern dan minimalis untuk memantau pencapaian target tabungan **Rp50.000.000** selama 12 bulan masa kontrak kerja (Oktober 2026 – September 2027).

---

## ⚡ Ringkasan Target & Perhitungan

- **Target Akhir**: Rp50.000.000
- **Saldo Awal**: Rp10.950.000
- **Target Nabung Gaji**: Rp2.000.000 / bulan
- **Target Freelance**: Rp1.300.000 / bulan
- **Total Target Bulanan**: Rp3.300.000 / bulan
- **Formula Saldo Aktual**: `Saldo Awal + Total Transaksi Riil`
- *Catatan Penting*: Checklist target bulanan berfungsi murni sebagai tracking tugas pribadi dan **tidak menambah saldo**. Saldo hanya bertambah saat Anda mencatat transaksi riil.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Database & Auth**: Supabase PostgreSQL dengan Row Level Security (RLS)
- **Deployment**: Vercel Ready

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Jalankan Langsung (Mode Demo Offline)

Aplikasi ini sudah dilengkapi dengan mode demo otomatis jika kredensial Supabase belum diisi. Anda dapat langsung menjalankan dan mengujinya:

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda, lalu klik tombol **"Uji Coba Langsung (Mode Demo Cepat)"**.

---

### 2. Menghubungkan ke Supabase (Database Produksi)

1. Buat project baru di [Supabase](https://supabase.com/).
2. Buka menu **SQL Editor** di Supabase Dashboard, lalu salin dan jalankan seluruh isi file migrasi:
   [`supabase/migrations/01_initial_schema.sql`](file:///c:/Users/Project/pencatatan_keuangan_azmi/supabase/migrations/01_initial_schema.sql)
3. Buat file `.env.local` di root proyek ini (gunakan referensi [`.env.example`](file:///c:/Users/Project/pencatatan_keuangan_azmi/.env.example)):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

4. Restart dev server:
```bash
npm run dev
```

---

## ☁️ Cara Deploy ke Vercel

1. Push repository ini ke GitHub / GitLab.
2. Buka [Vercel Dashboard](https://vercel.com/) dan pilih **Add New Project**.
3. Import repository Anda.
4. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase Anda
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key Supabase Anda
5. Klik **Deploy**. Selesai!

---

## 📁 Struktur Halaman & Fitur

- [`/dashboard`](file:///c:/Users/Project/pencatatan_keuangan_azmi/app/dashboard/page.jsx): Primary Balance section, persentase tabungan, target bulan ini, status otomatis (🟢 On Track / 🟡 Behind / 🏆 Target Reached), jadwal pengingat, dan riwayat transaksi terbaru.
- [`/plan`](file:///c:/Users/Project/pencatatan_keuangan_azmi/app/plan/page.jsx): Rencana 12 bulan (Oktober 2026 – September 2027) dengan target gaji Rp2.000.000, freelance Rp1.300.000, komparasi transaksi riil, dan checklist target.
- [`/transactions`](file:///c:/Users/Project/pencatatan_keuangan_azmi/app/transactions/page.jsx): Daftar transaksi, pencarian, filter kategori & bulan, modal tambah & edit transaksi, serta validasi nominal.
- [`/progress`](file:///c:/Users/Project/pencatatan_keuangan_azmi/app/progress/page.jsx): Tahapan milestone (Rp10,95 JT → Rp20 JT → Rp30 JT → Rp40 JT → 🏆 Rp50 JT) serta grafik perbandingan lintasan ideal vs saldo aktual.
- [`/settings`](file:///c:/Users/Project/pencatatan_keuangan_azmi/app/settings/page.jsx): Konfigurasi target keuangan, jadwal reminder, Export data `road-to-50jt-backup.json`, Import data backup dengan konfirmasi, dan Logout.
- [`/login`](file:///c:/Users/Project/pencatatan_keuangan_azmi/app/login/page.jsx): Supabase email & password authentication serta opsi mode demo.

---

## 🔒 Keamanan & Row Level Security (RLS)

- Seluruh tabel database dilindungi oleh RLS (`auth.uid() = user_id`).
- Pengguna hanya dapat membaca, menambah, mengubah, dan menghapus datanya sendiri.
- Tidak ada service role key yang diekspos di sisi klien.
