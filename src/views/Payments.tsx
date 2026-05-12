import React, { useState } from 'react';
import { 
  Plus, 
  ArrowDownLeft, 
  CheckCircle2, 
  X,
  History as HistoryIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMockData } from '../lib/mockData';
import { cn, formatCurrency } from '../lib/utils';
import { Receipt } from '../components/Receipt';
import confetti from 'canvas-confetti';

export function Payments() {
  const { payments, loans, clients, addPayment, generatePaymentNumber } = useMockData();
  const [showModal, setShowModal] = useState(false);
  const [receiptToShow, setReceiptToShow] = useState<any | null>(null);
  
  const [newPayment, setNewPayment] = useState({
    clientId: '',
    loanId: '',
    amount: 0,
    penaltyApplied: 0,
    interestApplied: 0,
  });

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.loanId || newPayment.amount <= 0) return;

    const selectedLoan = loans.find(l => l.id === newPayment.loanId);
    if (!selectedLoan) return;

    const previousBalance = selectedLoan.remainingBalance;
    const newBalance = Math.max(0, previousBalance - newPayment.amount);
    
    // Update installments paid count
    const newInstallmentsPaid = (selectedLoan.installmentsPaid || 0) + 1;

    const payment = {
      id: Math.random().toString(36).substr(2, 9),
      paymentNumber: generatePaymentNumber(),
      loanId: selectedLoan.id,
      clientId: selectedLoan.clientId,
      clientName: selectedLoan.clientName,
      amount: newPayment.amount,
      penaltyApplied: newPayment.penaltyApplied,
      interestApplied: newPayment.interestApplied,
      previousBalance,
      newBalance,
      installmentNumber: newInstallmentsPaid,
      overdueInstallments: 0, // In a real app this would be calculated
      date: new Date().toISOString()
    };

    addPayment(payment);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setReceiptToShow({
      ...payment,
      receiptNumber: payment.paymentNumber,
      remainingBalance: payment.newBalance,
      amountPaid: payment.amount,
      date: new Date(payment.date),
      loanAmount: selectedLoan.amount,
      installmentsPaid: newInstallmentsPaid,
      installmentsRemaining: Math.max(0, (selectedLoan.totalInstallments || 1) - newInstallmentsPaid),
      totalInstallments: selectedLoan.totalInstallments || 1,
      installmentValue: (selectedLoan.totalDebt || 0) / (selectedLoan.totalInstallments || 1),
      installmentsOverdue: 0
    });
    setShowModal(false);
    setNewPayment({ clientId: '', loanId: '', amount: 0, penaltyApplied: 0, interestApplied: 0 });
  };

  const activeLoans = loans.filter(l => l.status === 'active');
  const availableClientsForPayment = clients.filter(c => 
    activeLoans.some(l => l.clientId === c.id)
  );

  const filteredLoans = newPayment.clientId 
    ? activeLoans.filter(l => l.clientId === newPayment.clientId)
    : activeLoans;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black heading-primary">Dinero que entra (Pagos)</h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Anota aquí cuando un cliente te entregue dinero.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-[#10B981] text-white rounded-[2rem] shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-all font-black text-lg uppercase tracking-tighter"
        >
          <Plus className="w-8 h-8" />
          Anotar Nuevo Pago
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-[#818CF8]" />
            Pagos Recientes
          </h3>

          <div className="space-y-4">
            {payments.map((p) => (
              <div key={p.id} className="neumorphic p-4 flex items-center justify-between group border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 neumorphic-inset flex items-center justify-center text-[#10B981]">
                    <ArrowDownLeft className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold heading-primary">{p.clientName}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.paymentNumber} • {new Date(p.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-black heading-primary">{formatCurrency(p.amount)}</p>
                    <p className="text-[10px] text-slate-500 italic">Saldo: {formatCurrency(p.newBalance)}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const loan = loans.find(l => l.id === p.loanId);
                      setReceiptToShow({
                        ...p, 
                        receiptNumber: p.paymentNumber,
                        remainingBalance: p.newBalance,
                        amountPaid: p.amount,
                        date: new Date(p.date),
                        loanAmount: loan?.amount || 0,
                        installmentsPaid: p.installmentNumber || 0,
                        installmentsRemaining: Math.max(0, (loan?.totalInstallments || 1) - (p.installmentNumber || 0)),
                        totalInstallments: loan?.totalInstallments || 1,
                        installmentValue: (loan?.totalDebt || 0) / (loan?.totalInstallments || 1),
                        installmentsOverdue: p.overdueInstallments || 0
                      });
                    }}
                    className="p-2 neumorphic-inset text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-medium">
                No hay pagos registrados recientemente.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-200">Resumen del Día</h3>
          <div className="glass-card">
            <div className="text-center space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recaudado Hoy</p>
              <p className="text-4xl font-black text-green-600">
                {formatCurrency(payments.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).reduce((acc, p) => acc + p.amount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

       {/* Modal Nuevo Pago */}
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
                  <h2 className="text-2xl font-black heading-primary uppercase tracking-tight">Nuevo Cobro</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sigue los pasos para anotar el dinero.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/10 rounded-full heading-primary transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleRegisterPayment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">1</span>
                    ¿Quién te está pagando?
                  </label>
                  <select 
                    required
                    className="w-full p-5 neumorphic-inset focus:outline-none appearance-none heading-primary text-lg font-bold"
                    value={newPayment.clientId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const firstLoan = loans.find(l => l.clientId === cid && l.status === 'active');
                      setNewPayment({...newPayment, clientId: cid, loanId: firstLoan?.id || ''});
                    }}
                  >
                    <option value="">-- Selecciona a la persona --</option>
                    {availableClientsForPayment.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">2</span>
                    ¿De qué préstamo es este pago?
                  </label>
                  <select 
                    required
                    disabled={!newPayment.clientId}
                    className="w-full p-5 neumorphic-inset focus:outline-none appearance-none heading-primary disabled:opacity-50 font-bold"
                    value={newPayment.loanId}
                    onChange={(e) => setNewPayment({...newPayment, loanId: e.target.value})}
                  >
                    <option value="">-- Elige el crédito --</option>
                    {filteredLoans.map(l => (
                      <option key= {l.id} value={l.id}>
                        Prestamo de {formatCurrency(l.amount)} (Debe {formatCurrency(l.remainingBalance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">3</span>
                    ¿Cuánto dinero te entregó hoy?
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-green-500">$</span>
                    <input 
                      required
                      type="number" 
                      className="w-full pl-12 p-6 neumorphic-inset focus:outline-none text-4xl font-black text-green-600 bg-transparent"
                      placeholder="0"
                      value={newPayment.amount || ''}
                      onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                    />
                  </div>
                  {newPayment.loanId && (
                    <p className="text-[10px] font-bold text-slate-400 mt-2 italic px-2">
                      Si paga esto, su nueva deuda será de: {formatCurrency(Math.max(0, (loans.find(l => l.id === newPayment.loanId)?.remainingBalance || 0) - newPayment.amount))}
                    </p>
                  )}
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={!newPayment.loanId || newPayment.amount <= 0}
                    className="w-full py-6 bg-green-600 text-white rounded-[2rem] font-black shadow-xl hover:shadow-green-500/40 transition-all flex items-center justify-center gap-3 text-xl disabled:opacity-30 disabled:grayscale"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                    LISTO, GUARDAR PAGO
                  </button>
                  <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-4">Al terminar se abrirá el recibo automáticamente.</p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {receiptToShow && (
        <Receipt 
          receiptData={receiptToShow} 
          onClose={() => setReceiptToShow(null)} 
        />
      )}
    </div>
  );
}
