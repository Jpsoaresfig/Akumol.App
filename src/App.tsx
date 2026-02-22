import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AdminPanel from './pages/Admin';
import LoginPage from './pages/login/Login';
import Dashboard from './pages/Dashboard'; // Importação da nova tela centralizada

// --- PÁGINAS TEMPORÁRIAS DOS AGENTES (ROADMAP) ---

const SombraPage = () => (
  <div className="p-8 min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <h1 className="text-2xl font-bold text-red-500">Agente Sombra (Premium)</h1>
    <p>Varredura de extrato em busca de gastos ocultos e assinaturas inúteis...</p>
  </div>
);

const HerancaPage = () => (
  <div className="p-8 min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <h1 className="text-2xl font-bold text-green-500">Arquiteto de Herança (Plus Pro)</h1>
    <p>Convertendo centavos e arredondamentos em tempo real de aposentadoria...</p>
  </div>
);

const ManadaPage = () => (
  <div className="p-8 min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <h1 className="text-2xl font-bold text-indigo-500">Efeito Manada (Ultimate Elite)</h1>
    <p>Missões semanais em grupo, ranking comunitário e táticas de economia chinesa...</p>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

function App() {
  const { user, loading } = useAuth(); // Busca estado de autenticação e carregamento

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-indigo-600 dark:text-indigo-400 font-black animate-pulse tracking-tighter">
            CARREGANDO GUARDIÃO DIGITAL...
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        
        {/* ROTA PÚBLICA: Redirecionamento de Login */}
        <Route 
          path="/login" 
          element={
            !user ? <LoginPage /> : 
            <Navigate to={user.role === 'admin' ? "/admin" : "/"} replace />
          } 
        />

        {/* ROTA PROTEGIDA PRINCIPAL: Único ponto de entrada para utilizadores */}
        <Route 
          path="/" 
          element={
            !user ? <Navigate to="/login" replace /> :
            user.role === 'admin' ? <Navigate to="/admin" replace /> : 
            <Dashboard /> /* A tela Dashboard agora gere internamente o que mostrar por plano */
          } 
        />
        
        {/* ROTA PROTEGIDA: Central de Comando (Admin) */}
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} 
        />

        {/* ROTAS PROTEGIDAS: Agentes de IA (Verificação Estrita de Planos) */}
        
        <Route 
          path="/sombra" 
          element={
            user && ['premium', 'plus', 'ultimate'].includes(user.plan) 
              ? <SombraPage /> 
              : <Navigate to="/" replace />
          } 
        />

        <Route 
          path="/heranca" 
          element={
            user && ['plus', 'ultimate'].includes(user.plan) 
              ? <HerancaPage /> 
              : <Navigate to="/" replace />
          } 
        />

        <Route 
          path="/manada" 
          element={
            user && ['ultimate'].includes(user.plan) 
              ? <ManadaPage /> 
              : <Navigate to="/" replace />
          } 
        />

        {/* FALLBACK: Redirecionamento global de segurança */}
        <Route 
          path="*" 
          element={
            <Navigate to={!user ? "/login" : user.role === 'admin' ? "/admin" : "/"} replace />
          } 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;