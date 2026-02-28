/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, Mail, Shield, Camera, Edit2, 
  ChevronRight, ArrowLeft, Save, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateProfileData, updateUserEmail, updateUserPassword } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados locais para edição
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfileData({ displayName: name, bio: bio });
      setIsEditing(false);
      alert("Perfil atualizado com sucesso!");
    } catch (error: any) {
      alert("Erro ao atualizar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhoto = async () => {
    const url = prompt("Insira a URL da nova imagem de perfil:");
    if (url) {
      try {
        await updateProfileData({ photoURL: url });
      } catch (error: any) {
        alert("Erro ao atualizar foto." + error.message);
      }
    }
  };

  const handleEmailChange = async () => {
    const newEmail = prompt("Digite o novo e-mail:", user?.email);
    if (newEmail && newEmail !== user?.email) {
      try {
        await updateUserEmail(newEmail);
        alert("E-mail alterado!");
      } catch (error: any) {
        alert("Para segurança, faça login novamente antes de alterar o e-mail." + error.message);
      }
    }
  };

  const handlePasswordChange = async () => {
    const newPass = prompt("Digite a nova senha (mínimo 6 caracteres):");
    if (newPass && newPass.length >= 6) {
      try {
        await updateUserPassword(newPass);
        alert("Senha alterada com sucesso!");
      } catch (error: any) {
        alert("Erro ao alterar senha. Verifique se logou recentemente." + error.message);
      }
    }
  };

  if (!user) return null;

  const initial = (user.displayName || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 hover:scale-105 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black dark:text-white">Meu Perfil</h1>
        </header>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
              
              <div className="relative group">
                <div className="w-32 h-32 rounded-4xl overflow-hidden ring-4 ring-indigo-50 dark:ring-indigo-900/30 shadow-xl">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-4xl text-white font-black">
                      {initial}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleUpdatePhoto}
                  className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all border-4 border-[#F8FAFC] dark:border-slate-950"
                >
                  <Camera size={18} />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {isEditing ? (
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-2xl font-black bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 dark:text-white outline-none focus:ring-2 ring-indigo-500"
                    />
                  ) : (
                    <h2 className="text-3xl font-black dark:text-white">{user.displayName || 'Usuário Akumol'}</h2>
                  )}
                  <span className="w-fit mx-auto sm:mx-0 text-[10px] font-black bg-indigo-600 text-white px-2 py-1 rounded uppercase tracking-widest">
                    Plano {user.plan?.toUpperCase() || 'FREE'}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
                <div className="pt-4">
                  <button 
                    disabled={isLoading}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : (isEditing ? <Save size={16} /> : <Edit2 size={16} />)}
                    {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-indigo-500">
                <User size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sobre mim</span>
              </div>
              {isEditing ? (
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-indigo-500 text-sm dark:text-white"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  {user.bio || "Membro da comunidade Akumol focado em liberdade financeira."}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-emerald-500">
                <Shield size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Segurança</span>
              </div>
              
              <div className="space-y-4">
                <div onClick={handleEmailChange} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-xs font-bold dark:text-white">Alterar Email</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                
                <div onClick={handlePasswordChange} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-slate-400" />
                    <span className="text-xs font-bold dark:text-white">Trocar Senha</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;