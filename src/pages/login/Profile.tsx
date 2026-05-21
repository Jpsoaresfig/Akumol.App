import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Shield, Camera, Edit2, ChevronRight, ArrowLeft, Save, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ModalType = 'email' | 'password' | 'photo' | null;

const Profile: React.FC = () => {
  const { user, updateProfileData, updateUserEmail, updateUserPassword } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const [modal, setModal] = useState<ModalType>(null);
  const [modalValue, setModalValue] = useState('');
  const [modalConfirm, setModalConfirm] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfileData({ displayName: name, bio });
      setIsEditing(false);
      showSuccess('Perfil atualizado com sucesso!');
    } catch {
      showError('Erro ao atualizar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = (type: ModalType) => {
    setModal(type);
    setModalValue('');
    setModalConfirm('');
    setErrorMsg('');
  };

  const closeModal = () => {
    setModal(null);
    setModalValue('');
    setModalConfirm('');
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (modal === 'photo') {
        if (!modalValue) return;
        await updateProfileData({ photoURL: modalValue });
        showSuccess('Foto atualizada!');
      } else if (modal === 'email') {
        if (!modalValue || modalValue === user?.email) return;
        await updateUserEmail(modalValue);
        showSuccess('E-mail alterado!');
      } else if (modal === 'password') {
        if (modalValue.length < 6) { showError('A senha precisa ter pelo menos 6 caracteres.'); return; }
        if (modalValue !== modalConfirm) { showError('As senhas não coincidem.'); return; }
        await updateUserPassword(modalValue);
        showSuccess('Senha alterada com sucesso!');
      }
      closeModal();
    } catch {
      showError('Erro ao salvar. Faça login novamente antes de alterar dados de segurança.');
    } finally {
      setModalLoading(false);
    }
  };

  if (!user) return null;

  const initial = (user.displayName || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto pb-8">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 hover:scale-105 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-black dark:text-white">Meu Perfil</h1>
      </div>

      {/* FEEDBACK */}
      {(successMsg || errorMsg) && (
        <div className={`mb-4 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2 ${
          successMsg
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          {successMsg
            ? <CheckCircle2 size={18} className="shrink-0" />
            : <AlertCircle size={18} className="shrink-0" />
          }
          {successMsg || errorMsg}
        </div>
      )}

      <div className="space-y-4">
        {/* CARD PERFIL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-indigo-50 dark:ring-indigo-900/30 shadow-lg">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-3xl text-white font-black">
                    {initial}
                  </div>
                )}
              </div>
              <button
                onClick={() => openModal('photo')}
                className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-slate-900"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              {isEditing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xl font-black w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 dark:text-white outline-none focus:ring-2 ring-indigo-500 mb-2"
                  placeholder="Seu nome"
                />
              ) : (
                <h2 className="text-2xl font-black dark:text-white mb-1">{user.displayName || 'Usuário Akumol'}</h2>
              )}
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
                <span className="text-[10px] font-black bg-indigo-600 text-white px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Plano {user.plan?.toUpperCase() || 'BASIC'}
                </span>
                <span className="text-sm text-slate-400">{user.email}</span>
              </div>

              <button
                disabled={isSaving}
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 mx-auto sm:mx-0"
              >
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : (isEditing ? <Save size={14} /> : <Edit2 size={14} />)}
                {isEditing ? 'Salvar' : 'Editar Perfil'}
              </button>
            </div>
          </div>
        </div>

        {/* BIO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-indigo-500">
            <User size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sobre mim</span>
          </div>
          {isEditing ? (
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-indigo-500 text-sm dark:text-white resize-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escreva algo sobre você..."
            />
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {user.bio || 'Membro da comunidade Akumol focado em liberdade financeira.'}
            </p>
          )}
        </div>

        {/* SEGURANÇA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-emerald-500">
            <Shield size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Segurança</span>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => openModal('email')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-400" />
                <div className="text-left">
                  <p className="text-sm font-bold dark:text-white">Alterar E-mail</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            <button
              onClick={() => openModal('password')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-slate-400" />
                <div className="text-left">
                  <p className="text-sm font-bold dark:text-white">Trocar Senha</p>
                  <p className="text-xs text-slate-400">Mínimo 6 caracteres</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black dark:text-white">
                {modal === 'photo' ? 'Alterar Foto' : modal === 'email' ? 'Alterar E-mail' : 'Trocar Senha'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modal === 'photo' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">URL da imagem</label>
                  <input
                    type="url"
                    value={modalValue}
                    onChange={(e) => setModalValue(e.target.value)}
                    placeholder="https://..."
                    autoFocus
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 ring-indigo-500 transition-all"
                    required
                  />
                </div>
              )}

              {modal === 'email' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Novo e-mail</label>
                  <input
                    type="email"
                    value={modalValue}
                    onChange={(e) => setModalValue(e.target.value)}
                    placeholder="novo@email.com"
                    autoFocus
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 ring-indigo-500 transition-all"
                    required
                  />
                </div>
              )}

              {modal === 'password' && (
                <>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Nova senha</label>
                    <input
                      type="password"
                      value={modalValue}
                      onChange={(e) => setModalValue(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Confirmar senha</label>
                    <input
                      type="password"
                      value={modalConfirm}
                      onChange={(e) => setModalConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-60 text-sm"
              >
                {modalLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Confirmar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
