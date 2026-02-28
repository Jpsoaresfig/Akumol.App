import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, Mail, Shield, Camera, Edit2, 
  ChevronRight, ArrowLeft, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Fallback para informações do usuário
  const profileData = {
    name: user?.displayName || 'Usuário Akumol',
    email: user?.email || 'email@exemplo.com',
    plan: user?.plan || 'Free',
    photo: user?.photoURL || null,
    bio: "Membro da comunidade Akumol focado em liberdade financeira e economia inteligente."
  };

  const initial = profileData.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Header de Navegação */}
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
          
          {/* Cartão Principal: Foto e Nome */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
              
              {/* Avatar com Botão de Troca */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] overflow-hidden ring-4 ring-indigo-50 dark:ring-indigo-900/30 shadow-xl">
                  {profileData.photo ? (
                    <img src={profileData.photo} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-4xl text-white font-black">
                      {initial}
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all border-4 border-[#F8FAFC] dark:border-slate-950">
                  <Camera size={18} />
                </button>
              </div>

              {/* Infos Rápidas */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-3xl font-black dark:text-white">{profileData.name}</h2>
                  <span className="w-fit mx-auto sm:mx-0 text-[10px] font-black bg-indigo-600 text-white px-2 py-1 rounded uppercase tracking-widest">
                    Plano {profileData.plan.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{profileData.email}</p>
                <div className="pt-4">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                    {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes e Descrição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bio/Descrição */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-indigo-500">
                <User size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sobre mim</span>
              </div>
              {isEditing ? (
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-indigo-500 text-sm dark:text-white"
                  rows={4}
                  defaultValue={profileData.bio}
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  {profileData.bio}
                </p>
              )}
            </div>

            {/* Segurança e Conta */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-emerald-500">
                <Shield size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Segurança</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-xs font-bold dark:text-white">Alterar Email</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
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