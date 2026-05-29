import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';
import type { Course, CourseModule } from '../../types';
import {
  Play, Lock, Clock, BookOpen, ChevronLeft, ChevronDown,
  ChevronUp, GraduationCap, User, Tag, CheckCircle2,
  ShoppingCart, Sparkles, AlertCircle, Loader2
} from 'lucide-react';

const LEVEL_MAP = {
  beginner: { label: 'Iniciante', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  advanced: { label: 'Avançado', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
};

const fmt = (cents: number) =>
  cents === 0 ? 'Grátis' : `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

const ModuleAccordion = ({
  module, purchased, courseId, openIdx, idx, onToggle,
}: {
  module: CourseModule;
  purchased: boolean;
  courseId: string;
  openIdx: number | null;
  idx: number;
  onToggle: (i: number) => void;
}) => {
  const navigate = useNavigate();
  const isOpen = openIdx === idx;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => onToggle(idx)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
      >
        <div>
          <p className="font-bold text-slate-800 dark:text-white text-sm">{module.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{module.lessons.length} aulas</p>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>

      {isOpen && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {module.lessons.map(lesson => {
            const canWatch = purchased || lesson.isFree;
            return (
              <div
                key={lesson.id}
                onClick={() => canWatch && navigate(`/cursos/${courseId}/assistir?modulo=${module.id}&aula=${lesson.id}`)}
                className={`flex items-center gap-4 px-5 py-3.5 ${canWatch ? 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/5' : 'opacity-60'} transition-colors bg-white dark:bg-slate-900`}
              >
                <div className={`p-2 rounded-full shrink-0 ${canWatch ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {canWatch ? (
                    <Play size={12} className="text-indigo-600 dark:text-indigo-400" fill="currentColor" />
                  ) : (
                    <Lock size={12} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{lesson.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} /> {lesson.duration}
                    </span>
                    {lesson.isFree && (
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase">
                        Grátis
                      </span>
                    )}
                  </div>
                </div>
                {canWatch && (
                  <ChevronLeft size={14} className="text-slate-400 rotate-180 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [openModule, setOpenModule] = useState<number | null>(0);

  const purchasedIds: string[] = (user as unknown as { purchasedCourses?: string[] })?.purchasedCourses || [];
  const purchased = !!id && purchasedIds.includes(id);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const snap = await getDoc(doc(db, 'courses', id));
      if (snap.exists()) setCourse({ ...snap.data(), id: snap.id } as Course);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [id]);

  // load() é assíncrono: o setState só ocorre após o await, não em render síncrono.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('purchase') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleBuy = async () => {
    if (!course || !user) return;
    if (course.price === 0) {
      navigate(`/cursos/${course.id}/assistir`);
      return;
    }
    setBuying(true);
    setBuyError('');
    try {
      const functions = getFunctions(undefined, 'us-central1');
      const createSession = httpsCallable<{ courseId: string }, { url: string }>(
        functions, 'createCoursePurchaseSession'
      );
      const result = await createSession({ courseId: course.id });
      if (result.data.url) {
        window.location.href = result.data.url;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao processar pagamento.';
      setBuyError(msg);
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Curso não encontrado</h2>
        <button onClick={() => navigate('/cursos')} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">
          Voltar para cursos
        </button>
      </div>
    );
  }

  const level = LEVEL_MAP[course.level];
  const totalFree = (course.modules || []).reduce(
    (acc, m) => acc + m.lessons.filter(l => l.isFree).length, 0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/cursos')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold transition-colors"
      >
        <ChevronLeft size={16} /> Voltar para Cursos
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail / Preview */}
          <div className="relative rounded-3xl overflow-hidden aspect-video bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900">
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap size={72} className="text-white/20" />
              </div>
            )}
            {course.previewVideoUrl && (
              <button
                onClick={() => navigate(`/cursos/${course.id}/assistir?preview=1`)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
              >
                <div className="bg-white/10 backdrop-blur border-2 border-white/30 rounded-full p-6 group-hover:scale-110 group-hover:bg-indigo-600/60 transition-all">
                  <Play size={32} className="text-white" fill="currentColor" />
                </div>
              </button>
            )}
          </div>

          {/* Title & Meta */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${level.color}`}>
                {level.label}
              </span>
              {course.isFeatured && (
                <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles size={10} /> Destaque
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight mb-3">
              {course.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><User size={14} /> {course.instructor}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {course.duration}</span>
              <span className="flex items-center gap-1.5"><BookOpen size={14} /> {course.totalLessons} aulas</span>
              {totalFree > 0 && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={14} /> {totalFree} aulas grátis
                </span>
              )}
            </div>
          </div>

          {/* Long Description */}
          {course.longDescription && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
              <h2 className="font-black text-slate-800 dark:text-white mb-3">Sobre o curso</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                {course.longDescription}
              </p>
            </div>
          )}

          {/* Instructor */}
          {course.instructorBio && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl shrink-0">
                <User size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1">Instrutor</p>
                <h3 className="font-black text-slate-800 dark:text-white mb-1">{course.instructor}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{course.instructorBio}</p>
              </div>
            </div>
          )}

          {/* Modules */}
          {(course.modules || []).length > 0 && (
            <div>
              <h2 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" /> Conteúdo do Curso
              </h2>
              <div className="space-y-2">
                {course.modules.map((mod, idx) => (
                  <ModuleAccordion
                    key={mod.id}
                    module={mod}
                    purchased={purchased}
                    courseId={course.id}
                    openIdx={openModule}
                    idx={idx}
                    onToggle={i => setOpenModule(openModule === i ? null : i)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {(course.tags || []).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={14} className="text-slate-400" />
              {course.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Purchase Card (sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-100/80 dark:shadow-none space-y-5">
            <div className="text-center">
              <p className={`text-4xl font-black mb-1 ${course.price === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                {fmt(course.price)}
              </p>
              {course.price > 0 && (
                <p className="text-xs text-slate-400">Pagamento único · Acesso vitalício</p>
              )}
            </div>

            {purchased ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Curso adquirido!</span>
                </div>
                <button
                  onClick={() => navigate(`/cursos/${course.id}/assistir`)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <Play size={18} fill="currentColor" /> Assistir Agora
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {buyError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400">{buyError}</p>
                  </div>
                )}
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-60 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  {buying ? (
                    <><Loader2 size={18} className="animate-spin" /> Processando...</>
                  ) : course.price === 0 ? (
                    <><Play size={18} fill="currentColor" /> Assistir Grátis</>
                  ) : (
                    <><ShoppingCart size={18} /> Comprar Curso</>
                  )}
                </button>

                {totalFree > 0 && (
                  <button
                    onClick={() => navigate(`/cursos/${course.id}/assistir`)}
                    className="w-full py-3 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline transition-all"
                  >
                    Ver aulas gratuitas
                  </button>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock size={13} className="text-slate-400" /> {course.duration} de conteúdo
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BookOpen size={13} className="text-slate-400" /> {course.totalLessons} aulas
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <GraduationCap size={13} className="text-slate-400" /> Nível {level.label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
