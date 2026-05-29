import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { useAuth } from '../../hooks/useAuth';
import type { Course, CourseLesson, CourseModule } from '../../types';
import {
  ChevronLeft, Play, Lock, CheckCircle2, ChevronDown, ChevronUp,
  GraduationCap, BookOpen, AlertCircle, List
} from 'lucide-react';

const CourseWatch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const purchasedIds: string[] = (user as unknown as { purchasedCourses?: string[] })?.purchasedCourses || [];
  const purchased = !!id && purchasedIds.includes(id);
  const isPreview = searchParams.get('preview') === '1';

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const snap = await getDoc(doc(db, 'courses', id));
      if (snap.exists()) {
        const c = { ...snap.data(), id: snap.id } as Course;
        setCourse(c);

        // Determine which lesson to show
        const moduloId = searchParams.get('modulo');
        const aulaId = searchParams.get('aula');

        if (isPreview && c.previewVideoUrl) {
          setActiveLesson({
            id: 'preview',
            title: 'Prévia do Curso',
            duration: '',
            pandaVideoUrl: c.previewVideoUrl,
            isFree: true,
            order: 0,
          });
          return;
        }

        let found: CourseLesson | null = null;
        for (const mod of c.modules || []) {
          if (moduloId && mod.id !== moduloId) continue;
          for (const lesson of mod.lessons) {
            if (aulaId && lesson.id !== aulaId) continue;
            if (purchased || lesson.isFree) {
              found = lesson;
              break;
            }
          }
          if (found) break;
        }

        if (!found) {
          // fallback: first accessible lesson
          for (const mod of c.modules || []) {
            for (const lesson of mod.lessons) {
              if (purchased || lesson.isFree) {
                found = lesson;
                break;
              }
            }
            if (found) break;
          }
        }

        setActiveLesson(found);
        // Open the module that contains the active lesson
        if (found) {
          for (const mod of c.modules || []) {
            if (mod.lessons.some(l => l.id === found!.id)) {
              setOpenModules(new Set([mod.id]));
              break;
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [id, purchased, searchParams, isPreview]);

  // load() é assíncrono: o setState só ocorre após o await, não em render síncrono.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const toggleModule = (modId: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  const selectLesson = (mod: CourseModule, lesson: CourseLesson) => {
    const canWatch = purchased || lesson.isFree;
    if (!canWatch) {
      navigate(`/cursos/${id}`);
      return;
    }
    setActiveLesson(lesson);
    navigate(`/cursos/${id}/assistir?modulo=${mod.id}&aula=${lesson.id}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-center">
        <AlertCircle size={48} className="text-slate-600 mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Curso não encontrado</h2>
        <button onClick={() => navigate('/cursos')} className="text-indigo-400 font-bold text-sm hover:underline">
          Voltar para cursos
        </button>
      </div>
    );
  }

  if (!activeLesson) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-center px-6">
        <Lock size={48} className="text-slate-600 mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Conteúdo bloqueado</h2>
        <p className="text-slate-400 mb-6 text-sm">Adquira o curso para ter acesso a todas as aulas.</p>
        <button
          onClick={() => navigate(`/cursos/${id}`)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-colors"
        >
          Ver detalhes do curso
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col overflow-hidden z-50">
      {/* TOPBAR */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/cursos/${id}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
          >
            <ChevronLeft size={18} /> {course.title}
          </button>
        </div>
        <button
          onClick={() => setSidebarOpen(s => !s)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
        >
          <List size={18} /> {sidebarOpen ? 'Ocultar' : 'Conteúdo'}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* VIDEO AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Player */}
          <div className="flex-1 bg-black flex items-center justify-center">
            {activeLesson.pandaVideoUrl ? (
              <div className="w-full h-full">
                <iframe
                  key={activeLesson.id}
                  src={activeLesson.pandaVideoUrl}
                  style={{ border: 'none', width: '100%', height: '100%' }}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={activeLesson.title}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center text-center text-slate-500 p-8">
                <GraduationCap size={64} className="mb-4 text-slate-700" />
                <p className="text-slate-400 font-medium">Vídeo não disponível para esta aula.</p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 shrink-0">
            <h2 className="text-white font-black text-lg">{activeLesson.title}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{course.instructor} · {course.title}</p>
          </div>
        </div>

        {/* SIDEBAR: Module/Lesson List */}
        {sidebarOpen && (
          <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 shrink-0">
              <p className="text-slate-200 font-black text-sm flex items-center gap-2">
                <BookOpen size={15} className="text-indigo-400" /> Conteúdo do curso
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">{course.totalLessons} aulas</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {(course.modules || []).map(mod => (
                <div key={mod.id} className="border-b border-slate-800/60">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-slate-200 font-bold text-sm">{mod.title}</p>
                      <p className="text-slate-500 text-[11px]">{mod.lessons.length} aulas</p>
                    </div>
                    {openModules.has(mod.id)
                      ? <ChevronUp size={16} className="text-slate-500 shrink-0" />
                      : <ChevronDown size={16} className="text-slate-500 shrink-0" />
                    }
                  </button>

                  {openModules.has(mod.id) && (
                    <div>
                      {mod.lessons.map(lesson => {
                        const canWatch = purchased || lesson.isFree;
                        const isActive = activeLesson?.id === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson(mod, lesson)}
                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                              isActive
                                ? 'bg-indigo-600/20 border-l-2 border-indigo-500'
                                : canWatch
                                  ? 'hover:bg-slate-800/50'
                                  : 'opacity-40 cursor-not-allowed'
                            }`}
                          >
                            <div className={`p-1.5 rounded-full shrink-0 ${isActive ? 'bg-indigo-500/30' : 'bg-slate-800'}`}>
                              {isActive ? (
                                <Play size={10} className="text-indigo-400" fill="currentColor" />
                              ) : canWatch ? (
                                <CheckCircle2 size={10} className="text-slate-500" />
                              ) : (
                                <Lock size={10} className="text-slate-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm truncate ${isActive ? 'text-white font-bold' : 'text-slate-300 font-medium'}`}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-slate-500">{lesson.duration}</span>
                                {lesson.isFree && (
                                  <span className="text-[10px] font-black text-emerald-500 uppercase">Grátis</span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default CourseWatch;
