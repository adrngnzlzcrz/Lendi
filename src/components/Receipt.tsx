import React, { useRef } from 'react';
import { 
  CheckCircle2, 
  Share2, 
  Download, 
  MessageSquare,
  HandCoins,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import * as htmlToImage from 'html-to-image';

interface ReceiptProps {
  receiptData: {
    receiptNumber: string;
    clientName: string;
    amountPaid: number;
    loanAmount: number;
    remainingBalance: number;
    penaltyApplied: number;
    installmentsPaid: number;
    installmentsRemaining: number;
    installmentsOverdue: number;
    totalInstallments: number;
    installmentValue: number;
    date: Date;
  };
  onClose: () => void;
}

export function Receipt({ receiptData, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleCapture = async () => {
    if (receiptRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(receiptRef.current, {
          cacheBust: true,
          backgroundColor: '#FFFFFF',
          pixelRatio: 3,
        });
        
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `Recibo-${receiptData.receiptNumber}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Recibo de Pago - LendiControl',
            text: `Hola ${receiptData.clientName}, aquí tienes tu recibo de pago por ${formatCurrency(receiptData.amountPaid)}.`
          });
        } else {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `Recibo-${receiptData.receiptNumber}.png`;
          link.click();
        }
      } catch (err) {
        console.error("Error capturing receipt:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="flex flex-col gap-4 max-w-sm w-full">
        <div ref={receiptRef} className="bg-white p-8 rounded-[32px] shadow-2xl border border-slate-200 relative overflow-hidden">
          {/* Decorative backgrounds */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl opacity-60" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-full flex justify-between items-center mb-2">
               <span className="text-2xl font-black italic text-blue-600 tracking-tighter">LENDI</span>
               <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Recibo No.</p>
                  <p className="text-sm font-black text-slate-900">{receiptData.receiptNumber}</p>
               </div>
            </div>

            <div className="w-full space-y-4 py-6 border-y border-slate-100">
              <ReceiptRow label="Fecha" value={receiptData.date.toLocaleDateString()} />
              <ReceiptRow label="Cliente" value={receiptData.clientName} />
              
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
                 <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Valor Venta</p>
                    <p className="text-xl font-black text-blue-600">{formatCurrency(receiptData.loanAmount)}</p>
                 </div>
                 <HandCoins className="w-6 h-6 text-blue-500" />
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Valor de Cuota</p>
                    <p className="text-lg font-black text-slate-700">{formatCurrency(receiptData.installmentValue)}</p>
                 </div>
                 <Hash className="w-5 h-5 text-slate-400" />
              </div>

              <div className="flex justify-between items-center bg-green-50 p-4 rounded-2xl border border-green-100">
                 <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Valor Pagado</p>
                    <p className="text-2xl font-black text-green-600">{formatCurrency(receiptData.amountPaid)}</p>
                 </div>
                 <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              
              <div className="grid grid-cols-4 gap-1 mt-2">
                <div className="text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <p className="text-[7px] font-bold text-slate-500 uppercase leading-tight">Total Cuotas</p>
                  <p className="font-bold text-slate-900 text-xs">{receiptData.totalInstallments}</p>
                </div>
                <div className="text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <p className="text-[7px] font-bold text-slate-500 uppercase leading-tight">C. Pagadas</p>
                  <p className="font-bold text-slate-900 text-xs">{receiptData.installmentsPaid}</p>
                </div>
                <div className="text-center bg-blue-50 p-2 rounded-xl border border-blue-100 ring-2 ring-blue-500/10">
                  <p className="text-[7px] font-black text-blue-600 uppercase leading-tight">Pagos Restantes</p>
                  <p className="font-black text-blue-700 text-sm">{receiptData.installmentsRemaining}</p>
                </div>
                <div className="text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <p className="text-[7px] font-bold text-slate-500 uppercase leading-tight">C. Atraso</p>
                  <p className="font-bold text-red-600 text-xs">{receiptData.installmentsOverdue}</p>
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sanción</span>
                 <span className="text-sm font-bold text-red-500">{formatCurrency(receiptData.penaltyApplied)}</span>
              </div>
            </div>

            <div className="w-full">
               <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Nuevo Saldo</span>
                  <span className="text-slate-900 text-xl font-black">{formatCurrency(receiptData.remainingBalance)}</span>
               </div>
            </div>

            <div className="pt-2 text-[8px] text-slate-400 font-bold tracking-[0.4em] uppercase">
              Control de Confianza • Lendi
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleCapture}
            className="py-4 bg-[#25D366] text-white rounded-[1.5rem] font-black text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_15px_30px_rgba(37,211,102,0.3)]"
          >
            <MessageSquare className="w-4 h-4" />
            COMPARTIR
          </button>
          <button 
            onClick={onClose}
            className="py-4 bg-white text-slate-900 rounded-[1.5rem] font-black text-xs tracking-widest active:scale-95 transition-all border border-slate-200 shadow-sm"
          >
            LISTO
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center px-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}:</span>
      <span className="font-bold text-slate-800 text-xs">
        {value}
      </span>
    </div>
  );
}
