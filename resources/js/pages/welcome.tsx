import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Award, Building2, CheckCircle2, Clock, FileCheck2, Hotel, Layers, ShieldCheck } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: CheckCircle2,
            title: 'Manajemen Tugas Presisi',
            description:
                'Distribusikan instruksi kerja operasional antar divisi dengan status tracking terstruktur (To Do, In Progress, Review, Done).',
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        },
        {
            icon: FileCheck2,
            title: 'Sistem Acknowledgement',
            description: 'Pastikan setiap staf telah menerima dan memahami instruksi kerja secara transparan melalui konfirmasi penerimaan tugas.',
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        },
        {
            icon: Building2,
            title: 'Kolaborasi Antar Departemen',
            description: 'Integrasi menyeluruh antara Housekeeping, Front Office, F&B, Engineering, Sales, dan IT dalam satu ekosistem terpadu.',
            color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        },
        {
            icon: Layers,
            title: 'Monitoring Proyek Hotel',
            description: 'Pantau progres pemeliharaan fasilitas, acara skala besar, dan proyek renovasi unit dengan estimasi waktu yang akurat.',
            color: 'text-red-500 bg-red-500/10 border-red-500/20',
        },
    ];

    const stats = [
        { value: '100%', label: 'Akuntabilitas Tugas', sub: 'Dengan audit log transparan' },
        { value: 'Multi-Divisi', label: 'Kolaborasi Terpadu', sub: 'Seluruh unit hotel' },
        { value: 'Real-Time', label: 'Pelacakan Status', sub: 'Notifikasi & timeline instan' },
        { value: 'SOP Compliant', label: 'Standar Swiss-Belinn', sub: 'Kualitas operasional prima' },
    ];

    return (
        <>
            <Head title="SIPU - Sistem Informasi Pengelolaan Unit Swiss-Belinn SKA Pekanbaru" />

            <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased selection:bg-red-500 selection:text-white dark:bg-neutral-950 dark:text-neutral-100">
                {/* Background Ambient Glows */}
                <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 bg-gradient-to-tr from-red-600/15 via-amber-500/10 to-transparent opacity-70 blur-3xl" />
                <div className="pointer-events-none absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full bg-red-600/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />

                {/* Navigation Bar */}
                <header className="relative z-10 mx-auto max-w-7xl px-6 py-6 sm:px-8">
                    <nav className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-6 py-3.5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/70">
                        <div className="flex items-center gap-3">
                            <AppLogoIcon className="size-9" />
                            <div>
                                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                    SIPU<span className="text-red-600 dark:text-red-500">Management</span>
                                </span>
                                <span className="text-muted-foreground hidden text-[10px] font-semibold tracking-wider uppercase sm:block">
                                    Swiss-Belinn SKA Pekanbaru
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98]"
                                >
                                    Buka Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98]"
                                    >
                                        Daftar Staf
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-24 sm:px-8 lg:pt-20">
                    <div className="mx-auto flex max-w-3xl flex-col items-center space-y-6 text-center">
                        {/* Pill Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-600 backdrop-blur-xs dark:text-red-400">
                            <Hotel className="h-3.5 w-3.5" />
                            <span>Sistem Informasi Pengelolaan Unit Hotel Swiss-Belinn</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl leading-[1.15] font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                            Solusi Manajemen Tugas & Proyek{' '}
                            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                                Operasional Hotel
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-neutral-400">
                            Meningkatkan koordinasi antar departemen, memastikan setiap penugasan terverifikasi dengan sistem konfirmasi
                            (acknowledgement), dan menyelesaikan pekerjaan tepat waktu sesuai standar perhotelan bintang internasional.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:scale-[1.02] hover:bg-red-700 active:scale-[0.98]"
                                >
                                    Menuju Dashboard SIPU
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:scale-[1.02] hover:bg-red-700 active:scale-[0.98]"
                                    >
                                        Masuk Akun Staf
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-6 py-3 text-base font-medium text-slate-800 shadow-xs transition-all hover:border-slate-400 hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        Registrasi Staf Baru
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Key Trust Signals */}
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Keamanan Akses Role Administrator & Staff
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-blue-500" /> Deadline & Status Real-Time
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Award className="h-4 w-4 text-amber-500" /> Swiss-Belinn PKU Standard
                            </span>
                        </div>
                    </div>

                    {/* Preview Mockup Card */}
                    <div className="relative mx-auto mt-16 max-w-5xl rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-2xl backdrop-blur-xl sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/60">
                        <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-6 dark:border-neutral-800/80 dark:bg-neutral-950/50">
                            {/* Window Header */}
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-neutral-800">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                                    <span className="ml-2 text-xs font-medium text-slate-500 dark:text-neutral-400">
                                        sipu.swiss-belinn.internal / portal / dashboard
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                        Active System
                                    </span>
                                </div>
                            </div>

                            {/* Inner Grid Preview */}
                            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="rounded-xl border border-slate-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">Tugas Saya Aktif</span>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">12</span>
                                        <span className="text-xs font-medium text-blue-500">Dalam Proses</span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Perlu Acknowledge</span>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-amber-800 dark:text-amber-300">3</span>
                                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Menunggu Konfirmasi</span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-rose-200/70 bg-rose-50/50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
                                    <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Prioritas Mendesak</span>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-rose-800 dark:text-rose-300">2</span>
                                        <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Urgent</span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">Proyek Hotel Aktif</span>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">5</span>
                                        <span className="text-xs font-medium text-emerald-500">Fasilitas & Event</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-28">
                        <div className="mx-auto mb-16 max-w-2xl space-y-3 text-center">
                            <h2 className="text-xs font-bold tracking-widest text-red-600 uppercase dark:text-red-400">Fitur Utama Sistem</h2>
                            <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Dirancang untuk Kecepatan & Ketelitian Operasional
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="group relative rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/70"
                                >
                                    <div className={`inline-flex rounded-xl border p-3 ${feature.color} mb-5`}>
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-red-600 dark:text-white dark:group-hover:text-red-400">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-slate-600 dark:text-neutral-400">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Highlights */}
                    <div className="relative mt-28 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 p-10 text-white shadow-2xl sm:p-14">
                        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
                        <div className="relative z-10 grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="mb-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{stat.value}</span>
                                    <span className="text-sm font-semibold text-red-400">{stat.label}</span>
                                    <span className="mt-1 text-xs text-neutral-400">{stat.sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative border-t border-slate-200/60 bg-white/40 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/60">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-xs text-slate-500 sm:flex-row sm:px-8 dark:text-neutral-400">
                        <div className="flex items-center gap-2">
                            <Hotel className="h-4 w-4 text-red-600 dark:text-red-500" />
                            <span className="font-semibold text-slate-800 dark:text-neutral-200">SIPU - Swiss-Belinn SKA Pekanbaru</span>
                            <span>• Sistem Informasi Pengelolaan Unit</span>
                        </div>
                        <div>&copy; {new Date().getFullYear()} Swiss-Belinn SKA Pekanbaru. All rights reserved.</div>
                    </div>
                </footer>
            </div>
        </>
    );
}
