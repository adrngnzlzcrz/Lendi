import React, { useState } from 'react';
import { 
  HandCoins, 
  Search, 
  Plus, 
  X, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMockData } from '../lib/mockData';
import { cn, formatCurrency } from '../lib/utils';

export function Loans() {
  const { loans, clients, addLoan } = useMockData();
  const [showModal, setShowModal] = useState(false);
  
  const [newLoan, setNewLoan] = useState({
    clientId: '',
    clientName: '',
    amount: 0,
    interestRate: 10,
    penaltyRate: 50,
    totalInstallments: 1,
  });

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.clientId) return;

    const selectedClient = clients.find(c => c.id === newLoan.clientId);
    const totalDebt = newLoan.amount + (newLoan.amount * (newLoan.interestRate / 100));

    const loan = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: newLoan.clientId,
      clientName: selectedClient?.name || '',
      amount: newLoan.amount,
      interestRate: newLoan.interestRate,
      penaltyRate: newLoan.penaltyRate,
      totalDebt,
      remainingBalance: totalDebt,
      status: 'active' as const,
      totalInstallments: newLoan.totalInstallments,
      installmentsPaid: 0,
      createdAt: Date.now()
    };
    
    addLoan(loan);
    setShowModal(false);
    setNewLoan({ clientId: '', clientName: '', amount: 0, interestRate: 10, penaltyRate: 50, totalInstallments: 1 });
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black heading-primary">Dinero que sale (Préstamos)</h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Registra aquí el dinero que le prestas a la gente.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-[#4F46E5] text-white rounded-[2rem] shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:scale-105 transition-all font-black text-lg uppercase tracking-tighter"
          >
            <Plus className="w-8 h-8" />
            Hacer un Préstamo
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map((loan) => (
          <div key={loan.id} className="neumorphic p-6 relative overflow-hidden group">
               <div className={cn(
                 "absolute top-0 right-0 p-2 text-[10px] font-bold uppercase rounded-bl-xl",
                 loan.status === 'active' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
               )}>
                 {loan.status === 'active' ? 'Activo' : 'Pagado'}
               </div>

               <p className="text-xs font-bold text-slate-400 mb-1">CLIENTE</p>
               <h3 className="text-lg font-bold heading-primary mb-4">{loan.clientName}</h3>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Total a Pagar</p>
                      <p className="text-xl font-black heading-primary">{formatCurrency(loan.totalDebt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-bold">Saldo Pendiente</p>
                      <p className="text-lg font-black text-blue-600">{formatCurrency(loan.remainingBalance)}</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((loan.totalDebt - loan.remainingBalance) / loan.totalDebt) * 100}%` }}
                      className="bg-blue-500 h-full"
                    />
                  </div>
               </div>

               <div className="mt-6 flex gap-2">
                  <button className="flex-grow py-2 neumorphic-inset text-xs font-bold text-slate-600 hover:text-blue-500 transition-colors">
                    Ver Detalle
                  </button>
                   <button className="p-2 neumorphic-inset text-slate-400 hover:text-blue-500">
                    <History className="w-4 h-4" />
                  </button>
               </div>
          </div>
        ))}
      </div>

       {/* Modal Nuevo Préstamo */}
       <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-lg relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black heading-primary uppercase tracking-tight">Nuevo Préstamo</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Anota a quién y cuánto dinero le vas a prestar.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/10 rounded-full heading-primary transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleCreateLoan} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">1</span>
                    ¿A quién le prestas?
                  </label>
                  <select 
                    required
                    className="w-full p-5 neumorphic-inset focus:outline-none appearance-none heading-primary text-lg font-bold"
                    value={newLoan.clientId}
                    onChange={(e) => setNewLoan({...newLoan, clientId: e.target.value})}
                  >
                    <option value="">-- Selecciona a la persona --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">2</span>
                    ¿Cuánto dinero le vas a entregar?
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-purple-500">$</span>
                    <input 
                      required
                      type="number" 
                      className="w-full pl-12 p-6 neumorphic-inset focus:outline-none text-4xl font-black heading-primary bg-transparent"
                      placeholder="0"
                      value={newLoan.amount || ''}
                      onChange={(e) => setNewLoan({...newLoan, amount: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       Cobrar extra (%)
                    </label>
                    <input 
                      type="number" 
                      className="w-full p-4 neumorphic-inset focus:outline-none bg-transparent heading-primary font-bold"
                      value={newLoan.interestRate}
                      onChange={(e) => setNewLoan({...newLoan, interestRate: Number(e.target.value)})}
                    />
                    <p className="text-[9px] text-slate-600 font-bold uppercase italic mt-1">Interés por el préstamo.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       Cuotas / Pagos
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      max="15"
                      className="w-full p-4 neumorphic-inset focus:outline-none bg-transparent heading-primary font-bold"
                      value={newLoan.totalInstallments}
                      onChange={(e) => {
                        const val = Math.min(15, Math.max(1, Number(e.target.value)));
                        setNewLoan({...newLoan, totalInstallments: val});
                      }}
                    />
                    <p className="text-[9px] text-slate-600 font-bold uppercase italic mt-1">Máximo 15 cuotas.</p>
                  </div>
                </div>

                {newLoan.amount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total a Cobrar</p>
                      <p className="text-sm font-black text-blue-500">
                        {formatCurrency(newLoan.amount + (newLoan.amount * newLoan.interestRate / 100))}
                      </p>
                    </div>
                    <div className="flex justify-between items-center border-t border-blue-500/10 pt-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor de cada Cuota</p>
                      <p className="text-xl font-black text-blue-600">
                        {formatCurrency((newLoan.amount + (newLoan.amount * newLoan.interestRate / 100)) / newLoan.totalInstallments)}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       Multa por atraso ($)
                    </label>
                    <input 
                      type="number" 
                      className="w-full p-4 neumorphic-inset focus:outline-none bg-transparent heading-primary font-bold"
                      value={newLoan.penaltyRate}
                      onChange={(e) => setNewLoan({...newLoan, penaltyRate: Number(e.target.value)})}
                    />
                    <p className="text-[9px] text-slate-600 font-bold uppercase italic mt-1">Si no paga a tiempo.</p>
                </div>

                <div className="p-6 neumorphic-inset bg-blue-600/10 rounded-[2rem] border border-blue-500/20">
                  <div className="flex justify-between items-center text-center flex-col sm:flex-row gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">En total el cliente deberá pagarte:</span>
                    <span className="text-3xl font-black text-blue-500 tracking-tighter">
                      {formatCurrency(newLoan.amount + (newLoan.amount * (newLoan.interestRate / 100)))}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={!newLoan.clientId || newLoan.amount <= 0}
                    className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black shadow-xl hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-3 text-xl disabled:opacity-30 disabled:grayscale"
                  >
                    <HandCoins className="w-8 h-8" />
                    LISTO, GUARDAR PRÉSTAMO
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
