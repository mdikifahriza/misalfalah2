'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Calendar,
    Shield,
    Award,
    Heart,
    Star,
    BookOpen,
    Users,
    Sparkles,
    GraduationCap,
    Landmark,
    Trophy,
    Flame,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { NewsPost, HeadmasterGreeting } from '@/lib/types';
import PublicHero from '@/components/PublicHero';

const HIGHLIGHTS = [
    {
        id: 1,
        title: 'Akreditasi A',
        description: 'Mutu pendidikan terjamin dengan standar nasional yang kuat.',
        icon: <Star className="w-7 h-7 text-amber-500" />,
        accent: 'from-amber-50 to-white dark:from-amber-500/10 dark:to-white/5',
    },
    {
        id: 2,
        title: 'Tahfidz & Adab',
        description: 'Pembiasaan ibadah dan pembinaan karakter sejak dini.',
        icon: <BookOpen className="w-7 h-7 text-emerald-600" />,
        accent: 'from-emerald-50 to-white dark:from-emerald-500/10 dark:to-white/5',
    },
    {
        id: 3,
        title: 'Ekstrakurikuler',
        description: 'Bakat siswa diasah melalui kegiatan kreatif dan sportif.',
        icon: <Users className="w-7 h-7 text-sky-500" />,
        accent: 'from-sky-50 to-white dark:from-sky-500/10 dark:to-white/5',
    },
    {
        id: 4,
        title: 'Prestasi Konsisten',
        description: 'Kompetisi akademik dan non-akademik terus bertumbuh.',
        icon: <Trophy className="w-7 h-7 text-rose-500" />,
        accent: 'from-rose-50 to-white dark:from-rose-500/10 dark:to-white/5',
    },
];

const PROGRAMS = [
    {
        title: 'Kurikulum Islami Terpadu',
        description: 'Sinergi ilmu umum dan diniyah dengan pembiasaan harian.',
        icon: <Shield className="w-6 h-6" />,
    },
    {
        title: 'Guru Berpengalaman',
        description: 'Tenaga pendidik profesional dengan pendekatan humanis.',
        icon: <Award className="w-6 h-6" />,
    },
    {
        title: 'Fasilitas Nyaman',
        description: 'Ruang belajar, perpustakaan, dan sarana pendukung yang representatif.',
        icon: <Landmark className="w-6 h-6" />,
    },
    {
        title: 'Pembinaan Akhlak',
        description: 'Pendampingan karakter dan adab dalam setiap kegiatan.',
        icon: <Heart className="w-6 h-6" />,
    },
    {
        title: 'Literasi & Numerasi',
        description: 'Program penguatan dasar untuk capaian akademik optimal.',
        icon: <GraduationCap className="w-6 h-6" />,
    },
    {
        title: 'Kegiatan Inovatif',
        description: 'Kelas proyek, expo siswa, dan pembelajaran berbasis praktik.',
        icon: <Sparkles className="w-6 h-6" />,
    },
];

const STATS = [
    { label: 'Siswa Aktif', value: '420+', caption: 'Belajar dalam lingkungan positif' },
    { label: 'Guru & Staf', value: '38', caption: 'Tenaga profesional dan berdedikasi' },
    { label: 'Prestasi', value: '65+', caption: 'Kejuaraan dalam 3 tahun terakhir' },
    { label: 'Alumni', value: '1.200+', caption: 'Jejak lulusan di berbagai bidang' },
];

const Home: React.FC = () => {
    const [news, setNews] = useState<NewsPost[]>([]);
    const [greeting, setGreeting] = useState<HeadmasterGreeting | null>(null);
    const [schoolName] = useState('MIS Al-Falah Kanigoro');
    const [loading, setLoading] = useState(true);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetching
                const [newsData, greetingData] = await Promise.all([
                    api.getNews({ page: 1, pageSize: 3 }),
                    api.getHeadmasterGreeting(),
                ]);

                // Check structure of newsData response
                const newsItems = (newsData as any).items || newsData || [];
                setNews(newsItems);

                setGreeting(greetingData as HeadmasterGreeting || null);
            } catch (error) {
                console.error('Error fetching homepage data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <>
                <PublicHero />
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <PublicHero />
            <section className="relative overflow-hidden bg-[#F6F2EA] dark:bg-[#0B0F0C] border-b border-emerald-100/70 dark:border-white/10">
                <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10"></div>
                <div className="absolute bottom-0 left-0 h-56 w-56 -translate-x-1/2 translate-y-1/2 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-400/10"></div>
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl animate-fadeInUp">
                            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-700/70 dark:text-emerald-200/70">
                                <span className="h-[2px] w-10 bg-emerald-500/70"></span>
                                Beranda
                            </div>
                            <h1 className="mt-4 text-3xl md:text-5xl font-bold text-emerald-950 dark:text-white">
                                {schoolName}
                            </h1>
                            <p className="mt-4 text-lg text-emerald-900/70 dark:text-emerald-100/70">
                                Madrasah yang menumbuhkan iman, ilmu, dan akhlak dengan pembelajaran yang modern serta menyenangkan.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    href="/ppdb"
                                    className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
                                >
                                    Daftar PPDB
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/profil"
                                    className="inline-flex items-center gap-2 rounded-full border border-emerald-700/30 px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-700 hover:text-emerald-800 dark:text-emerald-100"
                                >
                                    Profil Madrasah
                                </Link>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm dark:bg-white/10 dark:text-emerald-100 animate-bounce-subtle">
                                    <Flame className="h-4 w-4" />
                                    Akreditasi A
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:w-[420px]">
                            {HIGHLIGHTS.map((item) => (
                                <div
                                    key={item.id}
                                    className={`rounded-2xl border border-emerald-900/10 bg-gradient-to-br ${item.accent} p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10`}
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-sm dark:bg-white/10">
                                        {item.icon}
                                    </div>
                                    <h3 className="mt-4 text-lg font-bold text-emerald-950 dark:text-white">{item.title}</h3>
                                    <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative py-20 bg-white dark:bg-gray-950 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                        <div className="animate-fadeInUp">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                                Program Unggulan
                            </p>
                            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                Kenapa Memilih {schoolName}?
                            </h2>
                            <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                                Kami menghadirkan pengalaman belajar yang seimbang antara akademik, karakter, dan keterampilan hidup.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    Pembelajaran Aktif
                                </span>
                                <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                                    Bimbingan Tahfidz
                                </span>
                                <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                                    Kegiatan Kreatif
                                </span>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {PROGRAMS.map((program) => (
                                <div
                                    key={program.title}
                                    className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm transition hover:shadow-lg dark:border-white/10 dark:bg-gray-900"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                        {program.icon}
                                    </div>
                                    <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">{program.title}</h3>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{program.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sambutan Kepala Sekolah */}
            <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 transform translate-x-4 translate-y-4 rounded-2xl"></div>
                                <img
                                    src={greeting?.photoUrl || 'https://picsum.photos/id/1005/600/800'}
                                    alt={greeting?.headmasterName || 'Kepala Madrasah'}
                                    className="rounded-2xl shadow-lg relative z-10 w-full object-cover aspect-[3/4]"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-2/3">
                            <h4 className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-2">
                                Sambutan Kepala Madrasah
                            </h4>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                {greeting?.subtitle || 'Mewujudkan Generasi Islami yang Kompetitif'}
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                {greeting?.contentText ? (
                                    greeting.contentText.split('\n').filter(Boolean).slice(0, 2).map((line, idx) => (
                                        <p key={idx}>{line}</p>
                                    ))
                                ) : (
                                    <>
                                        <p>Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di website resmi {schoolName}.</p>
                                        <p>Kami berkomitmen mencetak generasi yang cerdas, berakhlak mulia, dan siap menghadapi tantangan zaman.</p>
                                    </>
                                )}
                            </div>
                            <div className="mt-8">
                                <p className="font-bold text-gray-900 dark:text-white">{greeting?.headmasterName || 'Kepala Madrasah'}</p>
                                <p className="text-gray-500 dark:text-gray-400">{greeting?.headmasterTitle || 'Kepala Madrasah'}</p>
                            </div>
                            <div className="mt-6">
                                <Link
                                    href="/sambutan"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
                                >
                                    Baca Sambutan Lengkap
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-emerald-900 py-16 text-white">
                <div className="absolute -top-16 left-1/3 h-40 w-40 rounded-full bg-emerald-500/40 blur-3xl"></div>
                <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-amber-400/30 blur-3xl"></div>
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-4">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                                <p className="text-3xl font-bold">{stat.value}</p>
                                <p className="mt-2 text-sm uppercase tracking-widest text-emerald-100/70">{stat.label}</p>
                                <p className="mt-3 text-xs text-emerald-100/70">{stat.caption}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Berita Terbaru */}
            <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Kabar Madrasah</p>
                            <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Berita & Kegiatan Terbaru</h2>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Ikuti kegiatan, prestasi, dan informasi terbaru.</p>
                        </div>
                        <Link href="/berita" className="hidden md:flex items-center text-emerald-700 dark:text-emerald-300 font-semibold hover:underline">
                            Lihat Semua <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {news.length > 0 ? (
                            news.map((item) => (
                                <article key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                                    <div className="relative h-52 overflow-hidden">
                                        <img
                                            src={item.coverUrl || 'https://picsum.photos/800/600'}
                                            alt={item.title}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                        />
                                        <span className="absolute top-4 left-4 bg-emerald-700 text-white text-xs px-3 py-1 rounded-full">Berita</span>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center text-gray-400 text-xs mb-3">
                                            <Calendar size={14} className="mr-2" />
                                            {new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors line-clamp-2">
                                            <Link href={`/berita/${item.slug}`}>{item.title}</Link>
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                                            {item.excerpt || item.content?.substring(0, 100) + '...'}
                                        </p>
                                        <Link href={`/berita/${item.slug}`} className="text-emerald-700 dark:text-emerald-300 font-medium text-sm hover:underline mt-auto inline-block">
                                            Baca Selengkapnya
                                        </Link>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-10 bg-gray-50 rounded-2xl">
                                <p className="text-gray-500">Belum ada berita terbaru.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link href="/berita" className="inline-flex items-center text-emerald-700 dark:text-emerald-300 font-semibold">
                            Lihat Semua Berita <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* PPDB CTA Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 py-20 text-white">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.2), transparent 55%)' }}></div>
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 rounded-full bg-white/10"></div>
                <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-60 h-60 rounded-full bg-white/10"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/70">PPDB 2026</p>
                    <h2 className="mt-3 text-3xl md:text-5xl font-bold">Penerimaan Peserta Didik Baru</h2>
                    <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto mt-5 mb-10">
                        {`Bergabunglah bersama keluarga besar ${schoolName}. Mari wujudkan generasi cerdas, berakhlak, dan siap masa depan.`}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/ppdb"
                            className="px-8 py-4 bg-white text-emerald-800 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
                        >
                            Daftar Sekarang
                        </Link>
                        <Link
                            href="/kontak"
                            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition"
                        >
                            Hubungi Panitia
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
