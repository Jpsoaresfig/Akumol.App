import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  MessageSquareText,
  TrendingUp,
  LifeBuoy 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Itens principais de navegação (Removido o Suporte daqui)
  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: TrendingUp, label: 'Evolução', path: '/evolucao' },
    { icon: MessageSquareText, label: 'Conselheiro', path: '/conselheiro', main: true },
    { icon: ShieldCheck, label: 'Agentes', path: '/agentes' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col transition-all duration-300 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-800 dark:text-white">
            AKUMOL <span className="text-indigo-600">IA</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                item.main 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none my-4 transform scale-105' 
                  : isActive(item.path)
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={24} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* RODAPÉ DA SIDEBAR - ÁREA DISCRETA */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          {/* BOTÃO DE SUPORTE DISCRETO */}
          <button
            onClick={() => navigate('/suporte')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              isActive('/suporte')
                ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/5'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <LifeBuoy size={16} />
            <span>Reportar problema</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* NAVEGAÇÃO MOBILE */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex justify-around items-center z-50 h-16">
        {/* Ícones principais */}
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center transition-all ${
              item.main 
                ? 'bg-indigo-600 text-white p-3 rounded-2xl shadow-indigo-300 dark:shadow-none -mt-8 border-4 border-[#F8FAFC] dark:border-slate-950 scale-110' 
                : isActive(item.path) 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-400'
            }`}
          >
            <item.icon size={item.main ? 24 : 20} />
            {!item.main && <span className="text-[9px] font-bold mt-1">{item.label}</span>}
          </button>
        ))}
        
        {/* BOTÃO DE SUPORTE NO MOBILE (Apenas ícone e menor) */}
        <button
          onClick={() => navigate('/suporte')}
          className={`flex flex-col items-center justify-center transition-all ${
            isActive('/suporte') ? 'text-indigo-600' : 'text-slate-400 opacity-60'
          }`}
        >
          <LifeBuoy size={18} />
          <span className="text-[8px] font-bold mt-1">Ajuda</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;