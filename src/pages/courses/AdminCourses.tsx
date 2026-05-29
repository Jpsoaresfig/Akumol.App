import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../api/firebase';
import type { Course, CourseModule, CourseLesson } from '../../types';
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronUp, Save,
  X, GraduationCap, Loader2, CheckCircle2, AlertCircle,
  BookOpen, Play, Eye, EyeOff, Video, ImagePlus, Upload
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

const emptyLesson = (): CourseLesson => ({
  id: crypto.randomUUID(),
  title: '',
  duration: '',
  pandaVideoUrl: '',
  isFree: false,
  order: 0,
});

const emptyModule = (): CourseModule => ({
  id: crypto.randomUUID(),
  title: '',
  lessons: [emptyLesson()],
  order: 0,
});

interface FormState {
  title: string;
  description: string;
  longDescription: string;
  price: string;
  duration: string;
  level: Course['level'];
  instructor: string;
  instructorBio: string;
  thumbnailUrl: string;
  previewVideoUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  tags: string;
  modules: CourseModule[];
}

const defaultForm = (): FormState => ({
  title: '',
  description: '',
  longDescription: '',
  price: '0',
  duration: '',
  level: 'beginner',
  instructor: '',
  instructorBio: '',
  thumbnailUrl: '',
  previewVideoUrl: '',
  isFeatured: false,
  isActive: true,
  tags: '',
  modules: [emptyModule()],
});

const LEVEL_MAP = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const fmt = (cents: number) =>
  cents === 0 ? 'Grátis' : `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

// ──────────────────────────────────────────────
// Lesson Row
// ──────────────────────────────────────────────

const LessonRow = ({
  lesson, modIdx, lessonIdx, onChange, onRemove,
}: {
  lesson: CourseLesson;
  modIdx: number;
  lessonIdx: number;
  onChange: (modIdx: number, lessonIdx: number, field: keyof CourseLesson, value: unknown) => void;
  onRemove: (modIdx: number, lessonIdx: number) => void;
}) => {
  const [showUrl, setShowUrl] = useState(false);

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg shrink-0">
          <Play size={10} className="text-indigo-600 dark:text-indigo-400" fill="currentColor" />
        </div>
        <input
          type="text"
          value={lesson.title}
          onChange={e => onChange(modIdx, lessonIdx, 'title', e.target.value)}
          placeholder="Título da aula"
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500 dark:text-white"
        />
        <button onClick={() => onRemove(modIdx, lessonIdx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
          <X size={12} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={lesson.duration}
          onChange={e => onChange(modIdx, lessonIdx, 'duration', e.target.value)}
          placeholder="Duração (ex: 15min)"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500 dark:text-white"
        />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => onChange(modIdx, lessonIdx, 'isFree', !lesson.isFree)}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${lesson.isFree ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${lesson.isFree ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Aula grátis</span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Video size={11} className="text-slate-400 shrink-0" />
        <input
          type={showUrl ? 'text' : 'password'}
          value={lesson.pandaVideoUrl}
          onChange={e => onChange(modIdx, lessonIdx, 'pandaVideoUrl', e.target.value)}
          placeholder="URL embed do Panda Video (https://player-vz-...)"
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 ring-indigo-500 dark:text-white font-mono"
        />
        <button type="button" onClick={() => setShowUrl(s => !s)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
          {showUrl ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Course Form
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// Toast helpers (used across components)
// ──────────────────────────────────────────────

function friendlyFirebaseError(e: unknown): string {
  const code = (e as { code?: string })?.code || '';
  const msg = (e as { message?: string })?.message || String(e);
  if (code === 'permission-denied' || msg.includes('Missing or insufficient permissions')) {
    return 'Sem permissão. Verifique as regras do Firestore/Storage para admins.';
  }
  if (code === 'storage/unauthorized') {
    return 'Sem permissão no Storage. Configure as regras do Firebase Storage.';
  }
  if (msg.includes('CORS') || msg.includes('ERR_FAILED') || msg.includes('network')) {
    return 'Erro de CORS no Storage. Configure o CORS do bucket (veja instruções abaixo).';
  }
  return msg || 'Erro desconhecido.';
}

// ──────────────────────────────────────────────
// Thumbnail Upload Component
// ──────────────────────────────────────────────

const ThumbnailUpload = ({
  value, onChange, onError,
}: {
  value: string;
  onChange: (url: string) => void;
  onError: (msg: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      const msg = 'Apenas imagens são permitidas (PNG, JPG, WEBP).';
      setLocalError(msg);
      onError(msg);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const msg = 'A imagem deve ter no máximo 5MB.';
      setLocalError(msg);
      onError(msg);
      return;
    }

    setLocalError('');
    setUploading(true);
    setProgress(0);

    const storageRef = ref(storage, `course-thumbnails/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      err => {
        const msg = friendlyFirebaseError(err);
        setLocalError(msg);
        onError(msg);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        onChange(url);
        setUploading(false);
        setLocalError('');
      }
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
        Thumbnail do curso
      </label>

      {value ? (
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 group">
          <img src={value} alt="Thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 text-slate-700 font-bold text-xs rounded-xl hover:bg-white transition-colors"
            >
              <Upload size={14} /> Trocar foto
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group"
        >
          <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
            <ImagePlus size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Clique ou arraste a foto aqui</p>
          <p className="text-[11px] text-slate-400 mt-1">PNG, JPG ou WEBP · máx 5MB</p>
        </div>
      )}

      {uploading && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Enviando...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {localError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
          <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{localError}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
};

// ──────────────────────────────────────────────
// Course Form
// ──────────────────────────────────────────────

const CourseForm = ({
  initial, onSave, onCancel,
}: {
  initial?: Course | null;
  onSave: (data: FormState) => Promise<void>;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<FormState>(() => {
    if (!initial) return defaultForm();
    return {
      title: initial.title || '',
      description: initial.description || '',
      longDescription: initial.longDescription || '',
      price: initial.price ? String(initial.price / 100) : '0',
      duration: initial.duration || '',
      level: initial.level || 'beginner',
      instructor: initial.instructor || '',
      instructorBio: initial.instructorBio || '',
      thumbnailUrl: initial.thumbnailUrl || '',
      previewVideoUrl: initial.previewVideoUrl || '',
      isFeatured: initial.isFeatured || false,
      isActive: initial.isActive !== undefined ? initial.isActive : true,
      tags: (initial.tags || []).join(', '),
      modules: initial.modules?.length ? initial.modules : [emptyModule()],
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]));

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const addModule = () => {
    setForm(f => ({ ...f, modules: [...f.modules, emptyModule()] }));
    setOpenModules(s => new Set([...s, form.modules.length]));
  };

  const removeModule = (idx: number) => {
    setForm(f => ({ ...f, modules: f.modules.filter((_, i) => i !== idx) }));
  };

  const updateModuleTitle = (idx: number, title: string) => {
    setForm(f => {
      const m = [...f.modules];
      m[idx] = { ...m[idx], title };
      return { ...f, modules: m };
    });
  };

  const addLesson = (modIdx: number) => {
    setForm(f => {
      const m = [...f.modules];
      m[modIdx] = { ...m[modIdx], lessons: [...m[modIdx].lessons, emptyLesson()] };
      return { ...f, modules: m };
    });
  };

  const updateLesson = (modIdx: number, lessonIdx: number, field: keyof CourseLesson, value: unknown) => {
    setForm(f => {
      const m = [...f.modules];
      const ls = [...m[modIdx].lessons];
      ls[lessonIdx] = { ...ls[lessonIdx], [field]: value };
      m[modIdx] = { ...m[modIdx], lessons: ls };
      return { ...f, modules: m };
    });
  };

  const removeLesson = (modIdx: number, lessonIdx: number) => {
    setForm(f => {
      const m = [...f.modules];
      m[modIdx] = { ...m[modIdx], lessons: m[modIdx].lessons.filter((_, i) => i !== lessonIdx) };
      return { ...f, modules: m };
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('O título é obrigatório.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 ring-indigo-500 transition-all";
  const labelCls = "block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-800 dark:text-white text-lg">
          {initial ? 'Editar Curso' : 'Novo Curso'}
        </h3>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <X size={18} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* BASIC INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls}>Título *</label>
          <input type="text" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Ex: Finanças do Zero" className={inputCls} />
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>Descrição curta</label>
          <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={2} placeholder="Resumo em 1-2 frases exibido nos cards" className={inputCls + ' resize-none'} />
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>Descrição completa</label>
          <textarea value={form.longDescription} onChange={e => setField('longDescription', e.target.value)} rows={4} placeholder="Detalhes sobre o curso, o que o aluno vai aprender..." className={inputCls + ' resize-none'} />
        </div>

        <div>
          <label className={labelCls}>Preço (R$)</label>
          <input type="number" min="0" step="0.01" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="0.00 = Grátis" className={inputCls} />
          {Number(form.price) === 0 && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Curso gratuito</p>
          )}
        </div>

        <div>
          <label className={labelCls}>Duração total</label>
          <input type="text" value={form.duration} onChange={e => setField('duration', e.target.value)} placeholder="Ex: 4h 30min" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Nível</label>
          <select value={form.level} onChange={e => setField('level', e.target.value as Course['level'])} className={inputCls}>
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Instrutor</label>
          <input type="text" value={form.instructor} onChange={e => setField('instructor', e.target.value)} placeholder="Nome do instrutor" className={inputCls} />
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>Bio do instrutor</label>
          <textarea value={form.instructorBio} onChange={e => setField('instructorBio', e.target.value)} rows={2} placeholder="Breve descrição do instrutor" className={inputCls + ' resize-none'} />
        </div>

        <div className="md:col-span-2">
          <ThumbnailUpload
            value={form.thumbnailUrl}
            onChange={url => setField('thumbnailUrl', url)}
            onError={msg => setError(msg)}
          />
        </div>

        <div>
          <label className={labelCls}>URL do vídeo de prévia (Panda Video)</label>
          <input type="url" value={form.previewVideoUrl} onChange={e => setField('previewVideoUrl', e.target.value)} placeholder="https://player-vz-..." className={inputCls} />
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>Tags (separadas por vírgula)</label>
          <input type="text" value={form.tags} onChange={e => setField('tags', e.target.value)} placeholder="finanças, investimentos, renda fixa" className={inputCls} />
        </div>
      </div>

      {/* TOGGLES */}
      <div className="flex flex-wrap items-center gap-6 py-4 border-y border-slate-100 dark:border-slate-800">
        {[
          { key: 'isActive' as const, label: 'Curso ativo', desc: 'Visível para os usuários' },
          { key: 'isFeatured' as const, label: 'Em destaque', desc: 'Aparece no banner principal' },
        ].map(({ key, label, desc }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setField(key, !form[key])}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${form[key] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform mt-0.5 ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
              <p className="text-[11px] text-slate-400">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* MODULES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600" /> Módulos e Aulas
          </h4>
          <button
            type="button"
            onClick={addModule}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          >
            <Plus size={14} /> Módulo
          </button>
        </div>

        <div className="space-y-3">
          {form.modules.map((mod, modIdx) => (
            <div key={mod.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setOpenModules(s => {
                    const n = new Set(s);
                    if (n.has(modIdx)) n.delete(modIdx);
                    else n.add(modIdx);
                    return n;
                  })}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors shrink-0"
                >
                  {openModules.has(modIdx) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <input
                  type="text"
                  value={mod.title}
                  onChange={e => updateModuleTitle(modIdx, e.target.value)}
                  placeholder={`Módulo ${modIdx + 1}: título`}
                  className="flex-1 bg-transparent text-sm font-bold text-slate-700 dark:text-white outline-none placeholder:text-slate-400"
                />
                <span className="text-[11px] text-slate-400 shrink-0">{mod.lessons.length} aula(s)</span>
                {form.modules.length > 1 && (
                  <button type="button" onClick={() => removeModule(modIdx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {openModules.has(modIdx) && (
                <div className="p-4 space-y-3">
                  {mod.lessons.map((lesson, lessonIdx) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      modIdx={modIdx}
                      lessonIdx={lessonIdx}
                      onChange={updateLesson}
                      onRemove={removeLesson}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => addLesson(modIdx)}
                    className="flex items-center gap-2 w-full py-2.5 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 text-indigo-500 dark:text-indigo-400 rounded-xl text-xs font-bold hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                  >
                    <Plus size={13} /> Adicionar aula
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700 dark:hover:text-white transition-colors">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar Curso</>}
        </button>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Main AdminCourses Component
// ──────────────────────────────────────────────

interface Toast { msg: string; type: 'success' | 'error' }

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc')));
      setCourses(snap.docs.map(d => ({ ...d.data(), id: d.id } as Course)));
    } catch (e) {
      showToast(friendlyFirebaseError(e), 'error');
    }
    setLoading(false);
  }, []);

  // load() é assíncrono: o setState só ocorre após o await, não em render síncrono.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleSave = async (form: FormState) => {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const priceCents = Math.round(parseFloat(form.price || '0') * 100);
    const totalLessons = form.modules.reduce((acc, m) => acc + m.lessons.length, 0);

    const modules = form.modules.map((mod, mi) => ({
      ...mod,
      order: mi,
      lessons: mod.lessons.map((les, li) => ({ ...les, order: li })),
    }));

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      longDescription: form.longDescription.trim(),
      price: priceCents,
      duration: form.duration.trim(),
      level: form.level,
      instructor: form.instructor.trim(),
      instructorBio: form.instructorBio.trim(),
      thumbnailUrl: form.thumbnailUrl.trim(),
      previewVideoUrl: form.previewVideoUrl.trim(),
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      tags,
      modules,
      totalLessons,
    };

    if (editing) {
      await updateDoc(doc(db, 'courses', editing.id), { ...payload, updatedAt: serverTimestamp() });
      showToast('Curso atualizado!', 'success');
    } else {
      await addDoc(collection(db, 'courses'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      showToast('Curso criado!', 'success');
    }

    setShowForm(false);
    setEditing(null);
    await load();
  };

  const handleDelete = async (course: Course) => {
    if (!window.confirm(`Deletar "${course.title}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(course.id);
    try {
      await deleteDoc(doc(db, 'courses', course.id));
      showToast('Curso deletado.', 'success');
      setCourses(prev => prev.filter(c => c.id !== course.id));
    } catch (e) {
      showToast(friendlyFirebaseError(e), 'error');
    }
    setDeleting(null);
  };

  const startEdit = (course: Course) => {
    setEditing(course);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showForm) {
    return (
      <CourseForm
        initial={editing}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditing(null); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 left-6 md:left-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm z-50 max-w-sm md:max-w-md animate-in fade-in ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-500 text-white'
          }`}
        >
          {toast.type === 'error'
            ? <AlertCircle size={18} className="shrink-0 mt-0.5" />
            : <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          }
          <div className="flex-1">
            <p className="font-black">{toast.type === 'error' ? 'Erro' : 'Sucesso'}</p>
            <p className="font-medium text-xs mt-0.5 opacity-90">{toast.msg}</p>
          </div>
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 transition-opacity shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <GraduationCap size={20} className="text-indigo-600" /> Cursos ({courses.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gerencie cursos e vídeos do Panda Video</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus size={16} /> Novo Curso
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <GraduationCap size={48} className="text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-4">Nenhum curso criado ainda.</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-5 py-2.5 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 transition-colors"
          >
            Criar primeiro curso
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => {
            const totalLessons = course.totalLessons || 0;
            const moduleCount = (course.modules || []).length;

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-32 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <GraduationCap size={28} className="text-white/40" />
                    </div>
                  )}
                  {!course.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <EyeOff size={18} className="text-white/70" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-black text-slate-800 dark:text-white text-sm truncate">{course.title}</h3>
                    {course.isFeatured && (
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-full">
                        Destaque
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${course.isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      {course.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mb-2">{course.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium flex-wrap">
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{course.price === 0 ? 'Grátis' : fmt(course.price)}</span>
                    <span>{LEVEL_MAP[course.level]}</span>
                    <span>{moduleCount} módulo(s)</span>
                    <span>{totalLessons} aula(s)</span>
                    <span>{course.instructor}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(course)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Edit2 size={13} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
                    disabled={deleting === course.id}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-40"
                  >
                    {deleting === course.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Panda Video Guide */}
      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Video size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-black text-blue-700 dark:text-blue-400 text-sm mb-1">Como usar o Panda Video</h4>
            <ol className="text-xs text-blue-600 dark:text-blue-300 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Acesse o painel do Panda Video e faça upload do seu vídeo</li>
              <li>Clique em "Compartilhar" → "Incorporar" no vídeo</li>
              <li>Copie a URL do <code className="bg-blue-100 dark:bg-blue-500/20 px-1 rounded font-mono">src</code> do iframe (ex: <code className="bg-blue-100 dark:bg-blue-500/20 px-1 rounded font-mono">https://player-vz-XXXX.tv.pandavideo.com.br/embed/?v=UUID</code>)</li>
              <li>Cole essa URL no campo "URL embed do Panda Video" de cada aula</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Firebase Rules Guide */}
      <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <h4 className="font-black text-amber-700 dark:text-amber-400 text-sm">Configuração obrigatória do Firebase</h4>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-black text-amber-700 dark:text-amber-300 mb-1 uppercase tracking-wide">1. Regras do Firestore</p>
            <pre className="bg-slate-900 text-emerald-400 text-[11px] rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre">{`match /courses/{courseId} {
  allow read: if true;
  allow write: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}`}</pre>
          </div>

          <div>
            <p className="text-xs font-black text-amber-700 dark:text-amber-300 mb-1 uppercase tracking-wide">2. Regras do Firebase Storage</p>
            <pre className="bg-slate-900 text-emerald-400 text-[11px] rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre">{`match /course-thumbnails/{fileName} {
  allow read: if true;
  allow write: if request.auth != null
    && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
}`}</pre>
          </div>

          <div>
            <p className="text-xs font-black text-amber-700 dark:text-amber-300 mb-1 uppercase tracking-wide">3. CORS do Storage (via terminal)</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-2">Crie um arquivo <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded font-mono">cors.json</code> e execute o comando abaixo:</p>
            <pre className="bg-slate-900 text-emerald-400 text-[11px] rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre">{`// cors.json
[{"origin":["*"],"method":["GET","POST","PUT","DELETE","HEAD"],"maxAgeSeconds":3600}]

// No terminal (Google Cloud SDK):
gsutil cors set cors.json gs://akumol-205ab.firebasestorage.app`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
