'use client';

import React from 'react';
import {
    ArrowUpRight,
    Bell,
    Calendar,
    FileText,
    Image,
    LayoutGrid,
    Sparkles,
    UploadCloud,
    Users,
    ShieldCheck,
} from 'lucide-react';
import SidebarAdmin from '@/components/sidebar-admin';

const STATS = [
    { label: 'Berita', value: '128', change: '+12', icon: <FileText className="h-5 w-5" /> },
    { label: 'Galeri', value: '386', change: '+28', icon: <Image className="h-5 w-5" /> },
    { label: 'Pengunjung', value: '9.2k', change: '+4.5%', icon: <Users className="h-5 w-5" /> },
    { label: 'PPDB', value: 'Aktif', change: 'Gel. 2', icon: <LayoutGrid className="h-5 w-5" /> },
];

const ACTIVITIES = [
    { time: '08:15', text: 'Berita "Pekan Literasi" dipublikasikan.' },
    { time: '09:02', text: 'Galeri "Lomba Pramuka" ditambahkan.' },
    { time: '09:40', text: 'Banner beranda diperbarui.' },
    { time: '10:05', text: 'Sambutan kepala madrasah diperbarui.' },
];

const QUICK_ACTIONS = [
    { label: 'Tambah Berita', icon: <FileText className="h-5 w-5" /> },
    { label: 'Upload Galeri', icon: <UploadCloud className="h-5 w-5" /> },
    { label: 'Kelola Banner', icon: <LayoutGrid className="h-5 w-5" /> },
    { label: 'Update Sambutan', icon: <Sparkles className="h-5 w-5" /> },
];

const TOP_CONTENT = [
    { title: 'Juara MAPSI Tingkat Kabupaten', views: '2.1k', date: '02 Feb 2026' },
    { title: 'Ekskul Tahfidz dan Tilawah', views: '1.7k', date: '29 Jan 2026' },
    { title: 'PPDB Gelombang 2 Dibuka', views: '1.5k', date: '25 Jan 2026' },
    { title: 'Study Tour Edukatif', views: '1.2k', date: '22 Jan 2026' },
    { title: 'Apel Pagi dan Pembiasaan', views: '980', date: '19 Jan 2026' },
];

const AdminDashboardPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-[#0B0F0C] dark:text-gray-100">
            <SidebarAdmin />
            <main className="min-h-screen px-6 py-10 lg:pl-80">
                <section className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                                    Dashboard
                                </p>
                                <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Selamat Datang, Admin</h1>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                                    Ringkasan aktivitas terbaru dan performa konten website.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    <Calendar className="h-4 w-4" />
                                    Senin, 9 Februari 2026
                                </div>
                                <button className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition hover:text-emerald-600 dark:border-white/10 dark:bg-white/10 dark:text-emerald-200">
                                    <Bell className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {STATS.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-gray-900"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                            {stat.icon}
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">{stat.change}</span>
                                    </div>
                                    <p className="mt-4 text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Aktivitas</p>
                                    <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Aktivitas Terbaru</h2>
                                </div>
                                <button className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Lihat semua</button>
                            </div>
                            <div className="mt-6 space-y-4">
                                {ACTIVITIES.map((activity) => (
                                    <div key={activity.time} className="flex items-start gap-4 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4 dark:border-white/10 dark:bg-white/5">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-emerald-600"></div>
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{activity.time}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{activity.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Quick Actions</p>
                                    <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Tindakan Cepat</h2>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="mt-6 grid gap-3">
                                {QUICK_ACTIONS.map((action) => (
                                    <button
                                        key={action.label}
                                        className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200"
                                    >
                                        <span className="flex items-center gap-3">
                                            {action.icon}
                                            {action.label}
                                        </span>
                                        <ArrowUpRight className="h-4 w-4" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Konten Populer</p>
                                    <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Berita Paling Dibaca</h2>
                                </div>
                                <button className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Detail</button>
                            </div>
                            <div className="mt-6 space-y-4">
                                {TOP_CONTENT.map((item) => (
                                    <div key={item.title} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
                                        </div>
                                        <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{item.views} views</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Sistem</p>
                                    <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Status Sistem</h2>
                                </div>
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                                    Storage
                                    <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Aman</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                                    API
                                    <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Normal</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                                    Backup
                                    <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Hari ini 02:00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
