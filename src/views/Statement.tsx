import React, { useMemo, useRef } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  ArrowDownLeft,
  Wallet,
  Printer,
  Share2,
  Download,
  Camera
} from 'lucide-react';
import { useMockData } from '../lib/mockData';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as htmlToImage from 'html-to-image';
import { Receipt } from '../components/Receipt';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StatementProps {
  clientId: string;
  onBack: () => void;
}

export function Statement({ clientId, onBack }: StatementProps) {
  const { clients, loans, payments } = useMockData();
  const statementRef = useRef<HTMLDivElement>(null);
  const [receiptToShow, setReceiptToShow] = React.useState<any | null>(null);

  const client = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);
  const clientLoans = useMemo(() => loans.filter(l => l.clientId === clientId).sort((a, b) => b.createdAt - a.createdAt), [loans, clientId]);
  const clientPayments = useMemo(() => payments.filter(p => p.clientId === clientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [payments, clientId]);

  const totals = useMemo(() => {
    const loaned = clientLoans.reduce((acc, l) => acc + l.amount, 0);
    const totalToPay = clientLoans.reduce((acc, l) => acc + l.totalDebt, 0);
    const balance = clientLoans.reduce((acc, l) => acc + l.remainingBalance, 0);
    const paid = totalToPay - balance;

    return { loaned, balance, paid, count: clientLoans.length };
  }, [clientLoans]);

  const handleCapture = async () => {
    if (!statementRef.current) return;
    
    try {
      const bgColor = window.getComputedStyle(document.body).backgroundColor;
      const dataUrl = await htmlToImage.toPng(statementRef.current, {
        cacheBust: true,
        backgroundColor: bgColor,
        pixelRatio: 2,
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Estado_Cuenta_${client?.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Estado de Cuenta - ${client?.name}`,
          text: `Aquí tienes el estado de cuenta de ${client?.name}`
        });
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `Estado_Cuenta_${client?.name}.png`;
        link.click();
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  const handleExportPDF = () => {
    if (!client) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Estado de Cuenta", 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Cliente: ${client.name}`, 14, 32);
    doc.text(`ID Cliente: ${client.clientNumber}`, 14, 38);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 44);

    // Totals
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Resumen General", 14, 56);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Prestado: ${formatCurrency(totals.loaned)}`, 14, 64);
    doc.text(`Total Pagado: ${formatCurrency(totals.paid)}`, 14, 70);
    doc.text(`Saldo Actual: ${formatCurrency(totals.balance)}`, 14, 76);

    let yOffset = 88;

    // Loans and Payments Details
    clientLoans.forEach((loan) => {
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Préstamo (${new Date(loan.createdAt).toLocaleDateString()}) - Estado: ${loan.status === 'active' ? 'Activo' : 'Liquidado'}`, 14, yOffset);
      yOffset += 6;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Monto Orig: ${formatCurrency(loan.amount)} | Deuda: ${formatCurrency(loan.totalDebt)} | Saldo: ${formatCurrency(loan.remainingBalance)}`, 14, yOffset);
      yOffset += 6;
      doc.text(`Cuotas: ${loan.totalInstallments} | Valor por Cuota: ${formatCurrency(loan.totalDebt / loan.totalInstallments)}`, 14, yOffset);
      
      yOffset += 4;

      // Sort payments from oldest to newest for the statement context
      const loanPayments = clientPayments
        .filter(p => p.loanId === loan.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (loanPayments.length > 0) {
        const tableBody = loanPayments.map(p => [
          p.paymentNumber,
          new Date(p.date).toLocaleDateString(),
          formatCurrency(p.amount),
          formatCurrency(p.newBalance)
        ]);

        autoTable(doc, {
          startY: yOffset,
          head: [['Recibo', 'Fecha', 'Abono', 'Saldo Restante']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235] }, // Tailwind blue-600
          margin: { left: 14 }
        });

        // @ts-ignore - plugin declaration mismatch typical for autoTable
        yOffset = doc.lastAutoTable.finalY + 14;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("No hay pagos registrados para este préstamo.", 14, yOffset + 4);
        yOffset += 14;
      }
    });

    doc.save(`Estado_Cuenta_${client.name.replace(/\s+/g, '_')}.pdf`);
  };

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500">
        <p>Cliente no encontrado.</p>
        <button onClick={onBack} className="mt-4 text-blue-500 font-bold underline">Volver</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 neumorphic text-slate-400 heading-primary transition-all rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-grow">
          <h2 className="text-2xl font-black heading-primary tracking-tighter italic">Detalle de Cuenta</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{client.name}</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
           >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
           </button>
           <button 
            onClick={handleCapture}
            className="flex items-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
           >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Capturar</span>
           </button>
        </div>
      </div>

      {/* Area to Capture */}
      <div ref={statementRef} className="space-y-6 p-4 rounded-3xl">
        {/* Header Minimalist */}
        <div className="flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">CLIENTE REGISTRADO</p>
            <h1 className="text-4xl font-black heading-primary uppercase tracking-tighter">{client.name}</h1>
            <p className="text-xs text-slate-500 font-bold mt-1 opacity-60">ID: {client.clientNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">RESUMEN GENERAL</p>
            <p className="text-4xl font-black text-blue-600 tracking-tighter">{formatCurrency(totals.balance)}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase opacity-60">Saldo Pendiente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MinimalStat label="Total Prestado" value={formatCurrency(totals.loaned)} color="text-slate-400" />
          <MinimalStat label="Total Pagado" value={formatCurrency(totals.paid)} color="text-green-500" />
          <MinimalStat label="Saldo Actual" value={formatCurrency(totals.balance)} color="text-blue-500" bold />
        </div>

        <div className="space-y-8 pt-4">
          {/* Active Loans Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
               Historial de Movimientos
            </div>
            
            <div className="space-y-3">
              {clientLoans.map(loan => (
                <div key={loan.id} className="flex items-center justify-between p-5 border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold heading-primary text-sm uppercase">Préstamo - {new Date(loan.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {loan.status === 'active' ? 'Pendiente de pago' : 'Liquidado'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black heading-primary tracking-tight">{formatCurrency(loan.totalDebt)}</p>
                    <p className="text-[10px] text-slate-500 italic opacity-60">Saldo: {formatCurrency(loan.remainingBalance)}</p>
                  </div>
                </div>
              ))}

              {clientPayments.map(p => (
                <div 
                  key={p.id} 
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
                  className="flex items-center justify-between p-5 border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group cursor-pointer"
                >
                   <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold heading-primary text-sm uppercase">Abono Recibido - {new Date(p.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.paymentNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-500 tracking-tight">+{formatCurrency(p.amount)}</p>
                    <p className="text-[10px] text-slate-500 italic opacity-60">Saldo después: {formatCurrency(p.newBalance)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex justify-between items-center opacity-40">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] heading-primary">LENDI - CONTROL DE CONFIANZA</p>
           <p className="text-[8px] font-bold text-slate-500 italic">Generado el {new Date().toLocaleString()}</p>
        </div>
      </div>

      <AnimatePresence>
        {receiptToShow && (
          <Receipt 
            receiptData={receiptToShow} 
            onClose={() => setReceiptToShow(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MinimalStat({ label, value, color, bold }: { label: string, value: string, color: string, bold?: boolean }) {
  return (
    <div className="p-6 border border-white/5 rounded-2xl space-y-1">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={cn("text-2xl tracking-tighter", color, bold ? "font-black" : "font-bold")}>{value}</p>
    </div>
  );
}
