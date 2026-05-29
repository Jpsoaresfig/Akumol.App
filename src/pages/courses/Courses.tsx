import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';
import type { Course } from '../../types';
import {
  Play, Clock, BookOpen, Search,
  ChevronRight, Sparkles, GraduationCap, Filter, Lock
} from 'lucide-react';

const LEVEL_MAP = {
  beginner: { label: 'Iniciante', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  advanced: { label: 'Avançado', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
};

const fmt = (cents: number) =>
  cents === 0 ? 'Grátis' : `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

const CourseCard = ({ course, purchased }: { course: Course; purchased: boolean }) => {
  const navigate = useNavigate();
  const level = LEVEL_MAP[course.level];

  return (
    <div
      onClick={() => navigate(`/cursos/${course.id}`)}
      className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-indigo-100/40 dark:hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-video bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap size={52} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-3 right-3">
          {purchased ? (
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full flex items-center gap-1">
              <Play size={9} fill="currentColor" /> Adquirido
            </span>
          ) : course.price === 0 ? (
            <span className="px-2.5 py-1 bg-white text-indigo-700 text-[10px] font-black uppercase rounded-full">
              Grátis
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-black/40 backdrop-blur text-white text-[10px] font-black uppercase rounded-full flex items-center gap-1">
              <Lock size={9} /> Pago
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-2.5 group-hover:bg-indigo-600 transition-colors shadow-lg">
            <Play size={16} className="text-white" fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${level.color}`}>
            {level.label}
          </span>
          {course.isFeatured && (
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center gap-1">
              <Sparkles size={8} /> Destaque
            </span>
          )}
        </div>

        <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight mb-1.5 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{course.description}</p>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4 font-medium">
          <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
          <span className="flex items-center gap-1"><BookOpen size={11} /> {course.totalLessons} aulas</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xl font-black ${course.price === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
            {fmt(course.price)}
          </span>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all">
            {purchased ? <><Play size={12} fill="currentColor" /> Assistir</> : <><ChevronRight size={14} /> Ver Curso</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const FeaturedBanner = ({ course, purchased }: { course: Course; purchased: boolean }) => {
  const navigate = useNavigate();
  const level = LEVEL_MAP[course.level];

  return (
    <div
      className="relative rounded-3xl overflow-hidden cursor-pointer group min-h-[220px]"
      onClick={() => navigate(`/cursos/${course.id}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900">
        {course.thumbnailUrl && (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity duration-500"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-transparent" />

      <div className="relative z-10 p-8 md:p-10">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-[10px] font-black uppercase rounded-full flex items-center gap-1 border border-white/20">
            <Sparkles size={9} /> Em Destaque
          </span>
          <span className="px-3 py-1 bg-white/10 text-white/90 text-[10px] font-black uppercase rounded-full">
            {level.label}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 max-w-lg leading-tight">
          {course.title}
        </h2>
        <p className="text-white/60 text-sm mb-6 max-w-md line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-4 flex-wrap">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-black rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all text-sm shadow-lg shadow-indigo-900/30">
            <Play size={16} fill="currentColor" />
            {purchased ? 'Continuar Assistindo' : 'Ver Curso'}
          </button>
          {!purchased && course.price > 0 && (
            <span className="text-white font-black text-xl">
              {fmt(course.price)}
            </span>
          )}
          {course.price === 0 && (
            <span className="text-emerald-300 font-black text-xl">Grátis</span>
          )}
        </div>
      </div>
    </div>
  );
};

const Courses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'courses'), where('isActive', '==', true)));
        setCourses(snap.docs.map(d => ({ ...d.data(), id: d.id } as Course)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const purchasedIds: string[] = (user as unknown as { purchasedCourses?: string[] })?.purchasedCourses || [];
  const featured = courses.find(c => c.isFeatured);

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.tags || []).some(t => t.toLowerCase().includes(q));
    const matchLevel = levelFilter === 'all' || c.level === levelFilter;
    return matchSearch && matchLevel;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="text-indigo-600" size={32} /> Cursos
          </h1>
          <p className="text-slate-400 text-sm mt-1">Aprenda finanças com quem entende do assunto.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cursos..."
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      {featured && !search && levelFilter === 'all' && (
        <FeaturedBanner course={featured} purchased={purchasedIds.includes(featured.id)} />
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-400" />
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(lvl => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              levelFilter === lvl
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            {lvl === 'all' ? 'Todos' : LEVEL_MAP[lvl].label}
          </button>
        ))}
        {purchasedIds.length > 0 && (
          <span className="ml-auto text-xs text-slate-400 font-medium">
            {purchasedIds.length} curso(s) adquirido(s)
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <GraduationCap size={48} className="text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">
            {search ? 'Nenhum curso encontrado.' : 'Nenhum curso disponível no momento.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              purchased={purchasedIds.includes(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
