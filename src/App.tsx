/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, loginWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  History, 
  PlusCircle, 
  LogOut,
  Wallet,
  UserPlus,
  ShieldCheck,
  Moon,
  Sun,
  Calendar as CalendarIcon,
  TableProperties
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Views
import { Dashboard } from './views/Dashboard';
import { Clients } from './views/Clients';
import { Loans } from './views/Loans';
import { Payments } from './views/Payments';
import { Portfolio } from './views/Portfolio';
import { Statement } from './views/Statement';

type View = 'dashboard' | 'clients' | 'loans' | 'payments' | 'portfolio' | 'statement';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', pin: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    // We check if there's a stored session
    const storedUser = localStorage.getItem('lendi_admin_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Success local session check
    setLoading(false);
  }, []);

  const navigateToStatement = (clientId: string) => {
    setActiveClientId(clientId);
    setActiveView('statement');
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginForm.username.toUpperCase() === 'ADMIN' && loginForm.pin === '123456') {
      const adminUser = {
        uid: 'ADMIN_SESSION_USER', // Temporary local ID
        displayName: 'Administrador (ADMIN)',
        email: 'admin@lendicontrol.com'
      };
      
      // Success local state first
      setUser(adminUser);
      localStorage.setItem('lendi_admin_session', JSON.stringify(adminUser));
      
      // Try to connect to firebase in background for DB access
      try {
        const credential = await signInAnonymously(auth);
        const updatedUser = { ...adminUser, uid: credential.user.uid };
        setUser(updatedUser);
        localStorage.setItem('lendi_admin_session', JSON.stringify(updatedUser));
      } catch (err: any) {
        console.warn("Firebase background connection failed. Using local session mode.", err);
        // We don't block the user, but Firestore writes might fail if rules are not met.
      }
    } else {
      setError('Usuario o PIN incorrectos.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lendi_admin_session');
    logout(); // Also clear firebase if any
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1C1E]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#4F46E5] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-[#1A1C1E]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-md p-10 border border-white/5 space-y-10"
        >
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
               <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">LendiControl</h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Hola, para entrar escribe tu<br/>nombre y tu clave secreta.
            </p>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Tu Nombre de Usuario</label>
              <input 
                type="text" 
                placeholder="Ej. ADMIN"
                className="w-full p-6 neumorphic-inset focus:outline-none text-xl font-bold text-white uppercase"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Tu Clave (PIN)</label>
              <input 
                type="password" 
                placeholder="123456"
                className="w-full p-6 neumorphic-inset focus:outline-none text-3xl font-black text-blue-500 tracking-[0.5em] text-center"
                value={loginForm.pin}
                onChange={(e) => setLoginForm({...loginForm, pin: e.target.value})}
              />
            </div>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-100 text-xs font-bold text-center">
                Clave incorrecta. Inténtalo de nuevo.
              </motion.div>
            )}
            <button 
              type="submit"
              className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all uppercase tracking-tight"
            >
              ENTRAR AHORA
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-8">Seguridad de Acceso Activada</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row light-mode bg-[var(--app-bg)]">
      {/* Sidebar / Mobile Nav (Always Dark) */}
      <nav className="md:w-64 w-full border-r md:min-h-screen z-50 flex md:flex-col items-center justify-between p-4 md:p-6 fixed bottom-0 left-0 right-0 md:relative md:bottom-auto dark-mode bg-[#121416] border-white/5 shadow-[0_-10px_20px_rgba(0,0,0,0.2)] md:shadow-none">
        <div className="hidden md:flex flex-col gap-6 mb-8 w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tighter italic">LENDI</span>
          </div>

          {/* Calendar Widget */}
          <div className="p-5 rounded-3xl border space-y-4 shadow-sm bg-white/5 border-white/10">
            <div className="flex items-center gap-2 text-blue-500">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Calendario</span>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black italic tracking-tighter text-white">
                {new Date().getDate()}
              </p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                {new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date())}
              </p>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col w-full items-center justify-around md:justify-start gap-4 flex-grow overflow-x-auto md:overflow-x-visible no-scrollbar">
          <NavButton 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')}
            icon={<LayoutDashboard />}
            label="Inico"
            isDark={true}
          />
          <NavButton 
            active={activeView === 'portfolio'} 
            onClick={() => setActiveView('portfolio')}
            icon={<TableProperties />}
            label="Lista de Clientes"
            isDark={true}
          />
          <NavButton 
            active={activeView === 'clients'} 
            onClick={() => setActiveView('clients')}
            icon={<Users />}
            label="Clientes"
            isDark={true}
          />
          <NavButton 
            active={activeView === 'loans'} 
            onClick={() => setActiveView('loans')}
            icon={<Wallet />}
            label="Prestar"
            isDark={true}
          />
          <NavButton 
            active={activeView === 'payments'} 
            onClick={() => setActiveView('payments')}
            icon={<HandCoins />}
            label="Abonos"
            isDark={true}
          />
        </div>

        <div className="hidden md:block w-full pt-6 border-t font-black border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors py-2 px-4 w-full text-xs uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5" />
            <span>Salir</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-10 mb-20 md:mb-0 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              BIENVENIDO
            </h2>
            <h1 className="text-3xl font-black italic tracking-tighter heading-primary">
              Hola, {user.displayName.split(' ')[0]}
            </h1>
          </div>
          <div className="md:hidden flex gap-2">
            <button onClick={handleLogout} className="p-4 rounded-2xl bg-white border text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <Dashboard onNavigate={setActiveView} />
            </motion.div>
          )}
          {activeView === 'clients' && (
            <motion.div key="clients" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <Clients onSelectClient={navigateToStatement} />
            </motion.div>
          )}
          {activeView === 'loans' && (
            <motion.div key="loans" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <Loans />
            </motion.div>
          )}
          {activeView === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <Payments />
            </motion.div>
          )}
          {activeView === 'portfolio' && (
            <motion.div key="portfolio" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <Portfolio onSelectClient={navigateToStatement} />
            </motion.div>
          )}
          {activeView === 'statement' && activeClientId && (
            <motion.div key="statement" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Statement clientId={activeClientId} onBack={() => setActiveView('portfolio')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, isDark }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col md:flex-row items-center gap-3 py-4 px-5 rounded-[1.5rem] transition-all w-full flex-shrink-0",
        active 
          ? "bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.3)] scale-105" 
          : cn("hover:bg-slate-500/10", isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-blue-600")
      )}
    >
      <div className={cn("w-6 h-6", active ? "text-white" : "")}>{icon}</div>
      <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
