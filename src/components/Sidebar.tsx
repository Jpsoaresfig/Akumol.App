import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  MessageSquareText 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: ShieldCheck, label: 'Agentes', path: '/agentes' },
    { icon: MessageSquareText, label: 'Conselheiro', path: '/conselheiro' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
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
                isActive(item.path)
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={24} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
          >
            <LogOut size={24} />
            <span className="font-bold text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(item.path) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
        <button onClick={logout} className="flex flex-col items-center gap-1 text-slate-400">
          <LogOut size={22} />
          <span className="text-[10px] font-bold">Sair</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;