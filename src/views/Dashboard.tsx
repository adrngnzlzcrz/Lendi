import React, { useMemo } from 'react';
import { 
  UserPlus, 
  HandCoins, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  FileText,
  Users,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMockData } from '../lib/mockData';
import { formatCurrency, cn } from '../lib/utils';

export function Dashboard({ onNavigate }: { onNavigate: (view: any) => void }) {
  const { loans, payments } = useMockData();

  const stats = useMemo(() => {
    let loaned = 0;
    let pending = 0;
    let count = 0;
    
    loans.forEach(loan => {
      loaned += loan.amount;
      pending += loan.remainingBalance;
      if (loan.status === 'active') count++;
    });

    const collected = payments.reduce((acc, p) => acc + p.amount, 0);

    return {
      totalLoaned: loaned,
      totalCollected: collected,
      activeLoansCount: count,
      pendingCollection: pending
    };
  }, [loans, payments]);

  return (
    <div className="space-y-12">
      {/* Featured Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <FeaturedAction 
          onClick={() => onNavigate('clients')}
          icon={<UserPlus className="w-10 h-10" />}
          label="Dar de Alta Cliente"
          description="Añade una persona nueva a tu cartera de préstamos"
          color="bg-blue-600"
          isDark={true}
        />
        <FeaturedAction 
          onClick={() => onNavigate('payments')}
          icon={<HandCoins className="w-10 h-10" />}
          label="Registrar Pago"
          description="Anota un abono recibido para liquidar deudas"
          color="bg-green-600"
          isDark={true}
        />
      </div>

      <div className="pt-4 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-[1px] flex-grow bg-slate-800/10" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Gestión y Resumen</p>
          <div className="h-[1px] flex-grow bg-slate-800/10" />
        </div>

        {/* Secondary Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <ActionButton 
            onClick={() => onNavigate('loans')}
            icon={<HandCoins className="w-6 h-6" />}
            label="Prestar Dinero"
            description="Registra un préstamo con intereses"
            color="bg-purple-500"
          />
          <ActionButton 
            onClick={() => onNavigate('portfolio')}
            icon={<FileText className="w-6 h-6" />}
            label="Lista de Clientes"
            description="Ver tabla detallada de deudas"
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<TrendingUp />}
          label="Dinero prestado"
          value={formatCurrency(stats.totalLoaned)}
          description="Suma de préstamos hechos"
          colorClass="bg-blue-500"
        />
        <StatCard 
          icon={<ArrowDownLeft />}
          label="Dinero recuperado"
          value={formatCurrency(stats.totalCollected)}
          description="Lo que ya te pagaron"
          colorClass="bg-green-500"
        />
        <StatCard 
          icon={<Users />}
          label="Clientes pagando"
          value={stats.activeLoansCount.toString()}
          description="Personas con crédito activo"
          colorClass="bg-purple-500"
        />
        <StatCard 
          icon={<Wallet />}
          label="Falta por cobrar"
          value={formatCurrency(stats.pendingCollection)}
          description="Lo que todavía te deben"
          colorClass="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity placeholder or Charts */}
        <div className="lg:col-span-2 glass-card">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 heading-primary">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Flujo de Caja Reciente
          </h3>
          <div className="h-64 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            Gráfico de tendencia próximamente...
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6 heading-primary">Próximos Vencimientos</h3>
          <div className="space-y-4">
             <p className="text-slate-500 text-sm italic">No hay vencimientos proximos registrados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedAction({ onClick, icon, label, description, color, isDark }: { onClick: () => void, icon: React.ReactNode, label: string, description: string, color: string, isDark?: boolean }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden p-8 rounded-[2.5rem] text-left transition-all shadow-2xl flex items-center gap-6 group",
        color,
        "shadow-lg shadow-blue-500/20"
      )}
    >
      {/* Decorative inner glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all" />
      
      <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shrink-0 shadow-inner">
        {icon}
      </div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none mb-2">
          {label}
        </h3>
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest leading-normal max-w-[200px]">
          {description}
        </p>
      </div>
      
      <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
        <ArrowUpRight className="w-8 h-8 text-white" />
      </div>
    </motion.button>
  );
}

function StatCard({ icon, label, value, description, colorClass }: { icon: React.ReactNode, label: string, value: string, description: string, colorClass: string }) {
  return (
    <div className="glass-card p-6 border border-white/5 space-y-4">
      <div className="flex justify-between items-start">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", colorClass)}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black heading-primary tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-2 italic opacity-70">{description}</p>
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, description, color }: { onClick: () => void, icon: React.ReactNode, label: string, description: string, color: string }) {
  return (
    <motion.button 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "glass-card flex-col h-auto group text-center items-center justify-center p-8 transition-all active:scale-95",
        "border border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
      )}
    >
      <div className={cn(
        "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all",
        color, "text-white mb-6 mx-auto"
      )}>
        {icon}
      </div>
      <div>
        <div className="heading-primary font-black leading-tight uppercase text-lg tracking-tight">{label}</div>
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2 opacity-60 group-hover:opacity-100 transition-opacity">{description}</div>
      </div>
    </motion.button>
  );
}
