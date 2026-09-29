# 🏨 SIPU Management — Sistem Informasi Pengelolaan Unit
### Swiss-Belinn SKA Pekanbaru

[![Tests](https://github.com/febrianatan/SIPUManagement/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/febrianatan/SIPUManagement/actions/workflows/tests.yml)
[![Linter & Code Quality](https://github.com/febrianatan/SIPUManagement/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/febrianatan/SIPUManagement/actions/workflows/lint.yml)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-777BB4?style=flat&logo=php&logoColor=white)](https://www.php.net)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v2-9553E9?style=flat&logo=inertia&logoColor=white)](https://inertiajs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Tentang Proyek

**SIPU Management (Sistem Informasi Pengelolaan Unit)** adalah platform terpadu untuk koordinasi operasional, manajemen proyek, dan pelacakan tugas antar departemen yang dikembangkan khusus untuk **Swiss-Belinn SKA Pekanbaru**.

Sistem ini dirancang untuk mengatasi hambatan komunikasi manual dan memo fisik dengan mendigitalkan alur instruksi kerja, memastikan transparansi akuntabilitas, serta memantau perkembangan proyek operasional hotel secara *real-time*.

---

## ✨ Fitur Unggulan

### 1. 🎯 Manajemen Tugas Berbasis SOP Hotel
- **Status Alur Kerja**: `To Do` ➔ `In Progress` ➔ `Review` *(Opsional)* ➔ `Done`.
- **Tingkat Prioritas**: Rendah (*Low*), Sedang (*Medium*), Tinggi (*High*), dan Mendesak (*Urgent*).
- **Multi-Assignee**: Penugasan tugas ke satu atau beberapa staf lintas departemen.

### 2. ✍️ Sistem Acknowledgement (Konfirmasi Tugas)
- Setiap staf yang ditugaskan (*assignee*) diwajibkan melakukan **Konfirmasi Penerimaan (Acknowledge)** sebelum tugas dapat dipindahkan ke status `In Progress`.
- Mencegah instruksi kerja terabaikan dan meningkatkan kedisiplinan operasional.

### 3. 🔍 Alur Verifikasi & Persetujuan (Review & Approval Workflow)
- Tugas penting dapat ditandai dengan opsi **Perlu Review**.
- Staf pelaksana mengajukan hasil kerja ke status `Review`.
- Pembuat tugas (*creator*) memiliki wewenang untuk:
  - **Approve**: Menyelesaikan tugas secara resmi (*Done*).
  - **Request Revision**: Mengembalikan tugas ke staf pelaksana dengan catatan perbaikan.

### 4. 🏢 Manajemen Proyek Hotel
- Pengelompokan tugas berdasarkan proyek strategis (renovasi unit, pemeliharaan fasilitas rutin, persiapan *event* besar/MICE).
- Pelacakan persentase progres, estimasi waktu, status proyek, dan keterlibatan staf per divisi.

### 5. 💬 Diskusi & Lampiran Berkas Terpusat
- **Komentar Real-time**: Komunikasi langsung di dalam kartu tugas tanpa perlu aplikasi perpesanan terpisah.
- **Lampiran Berkas**: Unggah bukti penyelesaian, foto kondisi unit, invoice, atau dokumen SOP pendukung.

### 6. 📜 Jejak Audit & Log Aktivitas (Activity Timeline)
- Setiap perubahan status, konfirmasi acknowledgement, pengunggahan berkas, dan komentar tercatat secara otomatis beserta waktu dan identitas staf pelaksana.

### 7. 👥 Multi-Departemen & Role-Based Access Control (RBAC)
- **Administrator**: Memiliki hak akses penuh untuk mengelola pengguna, divisi departemen, dan memantau seluruh proyek/tugas.
- **Staff Departemen**: Mengakses tugas yang ditugaskan kepada mereka, tugas yang mereka buat, serta proyek di dalam departemen masing-masing:
  - *Front Office (FO)*
  - *Housekeeping (HK)*
  - *Food & Beverage (FNB)*
  - *Engineering (ENG)*
  - *Accounting (ACC)*
  - *Human Resources (HR)*
  - *Sales & Marketing (SM)*
  - *Information Technology (IT)*
  - *SKA Co Ex (COEX)*

---

## 🛠️ Arsitektur & Teknologi

| Lapisan | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Backend** | [Laravel 12](https://laravel.com) | Framework PHP modern dengan arsitektur MVC, Eloquent ORM, dan Policies |
| **Monolith Bridge** | [Inertia.js v2](https://inertiajs.com) | Menghubungkan Laravel backend dengan React tanpa memerlukan REST API terpisah |
| **Frontend** | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) | UI interaktif dengan *type safety* ketat |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com) | Komponen modern, responsif, dan aksesibel |
| **Database** | SQLite (Default lokal & testing) / PostgreSQL (Supabase) | Penyimpanan data relasional berkinerja tinggi |
| **Testing** | [Pest PHP 3](https://pestphp.com) & [PHPUnit](https://phpunit.de) | 124 pengujian otomatis (818 assertions) |
| **Quality Tools** | Laravel Pint, ESLint, Prettier | Standar penulisan kode PSR-12 dan Clean Code |

---

## 📋 Persyaratan Sistem

Sebelum memulai instalasi, pastikan lingkungan pengembangan telah memenuhi persyaratan berikut:

- **PHP**: `^8.3`
  - Ekstensi PHP wajib: `pdo_sqlite`, `pdo_pgsql` *(jika menggunakan PostgreSQL/Supabase)*, `mbstring`, `xml`, `gd`, `fileinfo`, `exif`, `intl`, `zip`.
- **Composer**: `^2.2`
- **Node.js**: `^20.0` atau `^22.0` (LTS)
- **NPM**: `^10.0`

---

## 🚀 Panduan Instalasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di komputer lokal:

### 1. Kloning Repositori
```bash
git clone https://github.com/febrianatan/SIPUManagement.git
cd SIPUManagement
```

### 2. Pasang Dependensi Backend & Frontend
```bash
# Pasang dependensi PHP (Composer)
composer install

# Pasang dependensi JavaScript (NPM)
npm install
```

### 3. Konfigurasi Environment File
Salin file konfigurasi environment:
```bash
cp .env.example .env
```

Buka file `.env` dan sesuaikan konfigurasi database. Secara *default*, proyek menggunakan SQLite lokal:
```env
DB_CONNECTION=sqlite
# DB_DATABASE=database/database.sqlite
```
*(Opsional: Jika menggunakan PostgreSQL atau Supabase, ubah nilai `DB_CONNECTION=pgsql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` sesuai koneksi database Anda).*

### 4. Generate Kunci Aplikasi
```bash
php artisan key:generate
```

### 5. Buat Database & Jalankan Migrasi + Seeder
Buat file SQLite (jika belum ada) dan jalankan migrasi beserta data awal:
```bash
# Untuk Windows (PowerShell):
New-Item -ItemType File -Path database\database.sqlite -Force

# Untuk Linux / macOS:
touch database/database.sqlite

# Migrasi dan seeding database
php artisan migrate --seed
```

### 6. Jalankan Server Pengembangan
Jalankan backend Laravel dan Vite dev server secara bersamaan:

**Opsi A — Menggunakan perintah terpadu (Rekomendasi):**
```bash
composer run dev
```

**Opsi B — Menjalankan di terminal terpisah:**
```bash
# Terminal 1: Backend Laravel
php artisan serve

# Terminal 2: Frontend Vite
npm run dev
```

Buka browser dan akses aplikasi di: **`http://localhost:8000`**

---

## 🔑 Kredensial Akun Bawaan (Default Seeder)

Setelah menjalankan `php artisan db:seed`, akun demo berikut siap digunakan:

| Peran (Role) | Email | Password | Departemen |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `password` | Akses Seluruh Unit |
| **Staff** | `staff@example.com` | `password` | Information Technology (IT) |

---

## 🧪 Pengujian & Kualitas Kode

Proyek ini dilengkapi dengan rangkaian pengujian otomatis dan linter untuk menjamin stabilitas aplikasi.

### Menjalankan Unit & Feature Tests
```bash
php artisan test
```
*Seluruh 124 pengujian (Unit & Feature) berjalan secara otomatis menggunakan SQLite in-memory database.*

### Memeriksa Format Kode PHP (Laravel Pint)
```bash
# Cek kepatuhan formatting
./vendor/bin/pint --test

# Terapkan perbaikan otomatis
./vendor/bin/pint
```

### Memeriksa Kualitas Kode Frontend (TypeScript & ESLint)
```bash
# Pengecekan tipe data TypeScript
npx tsc --noEmit

# Pengecekan ESLint
npm run lint

# Pengecekan format Prettier
npm run format:check
```

---

## 📁 Struktur Direktori Utama

```text
SIPUManagement/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Controller web & Admin namespace
│   │   └── Requests/          # Form Request validasi data
│   ├── Models/                # Eloquent Models (Task, Project, User, Dept, etc.)
│   └── Policies/              # Otorisasi & hak akses pengguna
├── database/
│   ├── factories/             # Factory untuk dummy data pengujian
│   ├── migrations/            # Skema tabel database relasional
│   └── seeders/               # Data awal departemen & akun pengguna
├── resources/
│   ├── js/
│   │   ├── components/        # Komponen UI umum (Dialog, Table, Badges)
│   │   ├── layouts/           # Layout antarmuka (App, Auth, Admin)
│   │   ├── pages/             # Halaman Inertia React (Tasks, Projects, Admin)
│   │   └── types/             # Deklarasi tipe TypeScript
│   └── css/                   # Konfigurasi Tailwind CSS
├── routes/
│   ├── web.php                # Definisi rute aplikasi & middleware
│   └── auth.php               # Alur autentikasi bawaan
├── tests/
│   ├── Feature/               # Pengujian fungsional modul tugas, proyek, dan hak akses
│   └── Unit/                  # Pengujian unit logic
└── .github/
    └── workflows/             # CI/CD otomatis (tests.yml & lint.yml)
```

---

## 🛡️ Hak Cipta & Lisensi

Proyek ini dikembangkan untuk kebutuhan operasional **Swiss-Belinn SKA Pekanbaru** dan dilisensikan di bawah [Lisensi MIT](LICENSE).
