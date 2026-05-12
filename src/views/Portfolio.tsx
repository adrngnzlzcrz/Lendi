import React, { useMemo } from 'react';
import { 
  Briefcase, 
  Search, 
  ArrowUpDown,
  Download,
  Filter
} from 'lucide-react';
import { useMockData } from '../lib/mockData';
import { formatCurrency, cn } from '../lib/utils';

export function Portfolio({ onSelectClient }: { onSelectClient: (clientId: string) => void }) {
  const { clients, loans, payments } = useMockData();
  const [searchTerm, setSearchTerm] = React.useState('');

  const tableData = useMemo(() => {
    return clients.map(client => {
      const clientLoans = loans.filter(l => l.clientId === client.id);
      const totalLoaned = clientLoans.reduce((acc, l) => acc + l.amount, 0);
      const totalToPay = clientLoans.reduce((acc, l) => acc + l.totalDebt, 0);
      const currentBalance = clientLoans.reduce((acc, l) => acc + l.remainingBalance, 0);
      const totalPaid = totalToPay - currentBalance;
      
      const activeLoansCount = clientLoans.filter(l => l.status === 'active').length;

      // Find the last payment date for this client
      const clientPayments = payments.filter(p => clientLoans.some(l => l.id === p.loanId));
      const lastPayment = clientPayments.length > 0 
        ? new Date(Math.max(...clientPayments.map(p => p.date))).toLocaleDateString()
        : 'Sin pagos';

      return {
        ...client,
        totalLoaned,
        totalPaid,
        currentBalance,
        activeLoansCount,
        lastPayment
      };
    }).filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.clientNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, loans, payments, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black heading-primary italic tracking-tight uppercase">Lista de Clientes</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] opacity-60">Tabla detallada con saldos, pagos y estado de cada cuenta.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-all font-black text-xs uppercase tracking-widest">
            <Download className="w-4 h-4" />
            Descargar Reporte
          </button>
        </div>
      </div>

      <div className="relative group overflow-hidden rounded-[2rem]">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="text-slate-500 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text"
          placeholder="Busca un cliente para ver su deuda..."
          className="w-full pl-16 pr-8 py-6 neumorphic-inset focus:outline-none text-xl font-bold heading-primary placeholder:text-slate-600 tracking-tight"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-card overflow-hidden p-0 rounded-[2rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Persona / Cliente</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Prestado</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right text-green-500">Ya te pagó</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right text-blue-400">Te debe hoy</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Último Pago</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((client) => (
                <tr 
                  key={client.id} 
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                  onClick={() => onSelectClient(client.id)}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 font-black text-lg">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black heading-primary group-hover:text-blue-400 transition-colors text-lg tracking-tight">{client.name}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{client.clientNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 font-bold text-slate-400 text-right">{formatCurrency(client.totalLoaned)}</td>
                  <td className="p-6 font-black text-green-500 text-right">{formatCurrency(client.totalPaid)}</td>
                  <td className="p-6 font-black heading-primary text-right text-xl tracking-tighter bg-blue-600/10">{formatCurrency(client.currentBalance)}</td>
                  <td className="p-6 text-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-tighter block">{client.lastPayment}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={cn(
                      "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest",
                      client.activeLoansCount > 0 ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                    )}>
                      {client.activeLoansCount > 0 ? 'Deuda Activa' : 'Sin Deuda'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                      VER DETALLE
                    </button>
                  </td>
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500 italic font-medium">
                    No se encontraron clientes con el filtro aplicado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
