import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import UserHeader from './components/UserHeader';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Evolucao = lazy(() => import('./pages/evolutions/Evolution'));
const Agentes = lazy(() => import('./pages/agentes/Agentesmain'));
const AgenteSombra = lazy(() => import('./pages/agentes/AgenteSombra'));
const AgenteRadar = lazy(() => import('./pages/agentes/AgenteRadar'));
const AgenteSentinela = lazy(() => import('./pages/agentes/AgenteSentinela'));
const AgenteDopamina = lazy(() => import('./pages/agentes/AgenteDopamina'));
const ArquitetoHeranca = lazy(() => import('./pages/agentes/ArquitetoHeranca'));
const AgenteResiliencia = lazy(() => import('./pages/agentes/AgenteResiliencia'));
const Conselheiro = lazy(() => import('./pages/Counselor/CounselorChat'));
const AdminPanel = lazy(() => import('./pages/Admin'));
const LoginPage = lazy(() => import('./pages/login/Login'));
const ForgotPassword = lazy(() => import('./pages/login/ForgotPassword'));
const Support = lazy(() => import('./pages/suport/Support'));
const Profile = lazy(() => import('./pages/login/Profile'));
const Goals = lazy(() => import('./pages/goals/Goals'));
const Onboarding = lazy(() => import('./pages/onboarding/Onboarding'));
const Plans = lazy(() => import('./pages/plans/Plans'));
const Courses = lazy(() => import('./pages/courses/Courses'));
const CourseDetail = lazy(() => import('./pages/courses/CourseDetail'));
const CourseWatch = lazy(() => import('./pages/courses/CourseWatch'));

const PageLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
      <div className="text-indigo-600 dark:text-indigo-400 font-black animate-pulse tracking-tighter text-center text-sm">
        Carregando...
      </div>
    </div>
  </div>
);

const MainLayout = () => (
  <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
    <Sidebar />
    <div className="flex flex-col flex-1 min-h-0">
      <UserHeader />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 pt-4 lg:pt-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  </div>
);

const PrivateRoutes = () => {
  const { user } = useAuth();
  const needsOnboarding = user && !(user as unknown as Record<string, unknown>).onboardingComplete && user.plan === 'basic';

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-indigo-600 dark:text-indigo-400 font-black animate-pulse tracking-tighter text-center uppercase">
            Sincronizando Guardião...
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} replace />}
          />

          <Route
            path="/recuperar-senha"
            element={!user ? <ForgotPassword /> : <Navigate to="/" replace />}
          />

          <Route
            path="/onboarding"
            element={user ? <Onboarding /> : <Navigate to="/login" replace />}
          />

          <Route element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
            <Route element={<PrivateRoutes />}>
              <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/evolucao" element={<Evolucao />} />
              <Route path="/agentes" element={<Agentes />} />
              <Route path="/agentes/sentinela" element={<AgenteSentinela />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/planos" element={<Plans />} />

              <Route
                path="/agentes/sombra"
                element={user && ['premium', 'plus', 'ultimate'].includes(user.plan || '') ? <AgenteSombra /> : <Navigate to="/agentes" replace />}
              />

              <Route
                path="/agentes/radar"
                element={user && ['premium', 'plus', 'ultimate'].includes(user.plan || '') ? <AgenteRadar /> : <Navigate to="/agentes" replace />}
              />

              <Route
                path="/agentes/dopamina"
                element={user && ['plus', 'ultimate'].includes(user.plan || '') ? <AgenteDopamina /> : <Navigate to="/agentes" replace />}
              />

              <Route
                path="/agentes/arquiteto"
                element={
                  user && ['plus', 'ultimate'].includes(user.plan || '')
                    ? <div className="max-w-xl mx-auto mt-8">
                        <ArquitetoHeranca
                          patrimonioTotal={user.financialData?.balance || 0}
                          gastosMensais={user.financialData?.monthlyExpenses || 0}
                        />
                      </div>
                    : <Navigate to="/agentes" replace />
                }
              />

              <Route
                path="/agentes/resiliencia"
                element={user && user.plan === 'ultimate' ? <AgenteResiliencia /> : <Navigate to="/agentes" replace />}
              />

              <Route path="/cursos" element={<Courses />} />
              <Route path="/cursos/:id" element={<CourseDetail />} />
              <Route path="/conselheiro" element={<Conselheiro />} />
              <Route path="/suporte" element={<Support />} />
            </Route>
          </Route>

          <Route
            path="/cursos/:id/assistir"
            element={user ? <CourseWatch /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/admin"
            element={
              user?.role === 'admin' ? (
                <div className="relative">
                  <UserHeader />
                  <AdminPanel />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to={!user ? "/login" : user.role === 'admin' ? "/admin" : "/"} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
