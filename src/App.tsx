import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar'; // Certifique-se de criar este componente
import Dashboard from './pages/Dashboard';
import Agentes from './pages/agentes/Agentesmain';       // Certifique-se de criar este componente
import AdminPanel from './pages/Admin';
import LoginPage from './pages/login/Login';

// --- COMPONENTE DE LAYOUT ---
// Este componente envolve as rotas protegidas e adiciona a Sidebar lateral
const MainLayout = () => (
  <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <Outlet /> 
    </main>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

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
        
        {/* ROTA PÚBLICA */}
        <Route 
          path="/login" 
          element={
            !user ? <LoginPage /> : 
            <Navigate to={user.role === 'admin' ? "/admin" : "/"} replace />
          } 
        />

        {/* ROTAS PROTEGIDAS COM SIDEBAR (LAYOUT COMUM) */}
        <Route element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
          
          {/* Dashboard Principal */}
          <Route 
            path="/" 
            element={
              user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />
            } 
          />

          {/* Nova Página de Agentes (Catálogo) */}
          <Route path="/agentes" element={<Agentes />} />

          {/* Rotas específicas de Agentes (Caso queira páginas separadas no futuro) */}
          <Route 
            path="/sombra" 
            element={
              ['premium', 'plus', 'ultimate'].includes(user?.plan || '') 
                ? <div className="p-8"><h1>Agente Sombra Ativo</h1></div> 
                : <Navigate to="/agentes" replace />
            } 
          />

        </Route>

        {/* ROTA ADMIN (Geralmente sem a sidebar de usuário comum) */}
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} 
        />

        {/* FALLBACK */}
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