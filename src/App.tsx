import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Evolucao from './pages/evolutions/Evolution'; 
import Agentes from './pages/agentes/Agentesmain'; 
import AgenteSombra from './pages/agentes/AgenteSombra'; // Importação do novo Agente
import Conselheiro from './pages/Counselor/CounselorChat'; 
import AdminPanel from './pages/Admin';
import LoginPage from './pages/login/Login';
import Support from './pages/suport/Support'; 

// --- COMPONENTE DE LAYOUT ---
const MainLayout = () => (
  <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
    <Sidebar />
    {/* pb-20 no mobile para dar espaço à Bottom Nav inferior */}
    <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <Outlet /> 
    </main>
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-indigo-600 dark:text-indigo-400 font-black animate-pulse tracking-tighter text-center">
            CARREGANDO GUARDIÃO DIGITAL...
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} replace />} 
        />

        <Route element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
          {/* Rota Inicial: Se for admin vai para painel, se não vai para o Dashboard */}
          <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />} />
          
          <Route path="/evolucao" element={<Evolucao />} />
          <Route path="/agentes" element={<Agentes />} />
          
          {/* ROTA DO AGENTE SOMBRA (PROTEGIDA POR PLANO) */}
          <Route 
            path="/agentes/sombra" 
            element={
              user && ['premium', 'plus', 'ultimate'].includes(user.plan || '') 
                ? <AgenteSombra /> 
                : <Navigate to="/agentes" replace />
            } 
          />

          <Route path="/conselheiro" element={<Conselheiro />} />
          
          {/* ROTA DE SUPORTE */}
          <Route path="/suporte" element={<Support />} />
        </Route>

        {/* PAINEL ADMINISTRATIVO */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} />
        
        {/* Redirecionamento Global */}
        <Route path="*" element={<Navigate to={!user ? "/login" : user.role === 'admin' ? "/admin" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;