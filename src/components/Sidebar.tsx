import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShieldCheck, label: 'Agentes IA', path: '/agentes' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <span className="hidden lg:block font-black text-xl tracking-tighter text-slate-800 dark:text-white">
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
            <span className="hidden lg:block font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
        >
          <LogOut size={24} />
          <span className="hidden lg:block font-bold text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;