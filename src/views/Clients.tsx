import React, { useState } from 'react';
import { 
  UserPlus, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2,
  ArrowRight,
  Search,
  X,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMockData } from '../lib/mockData';
import { cn, formatCurrency } from '../lib/utils';

export function Clients({ onSelectClient }: { onSelectClient: (clientId: string) => void }) {
  const { clients, loans, payments, addClient, generateClientNumber } = useMockData();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const clientId = Math.random().toString(36).substr(2, 9);
    const client = {
      id: clientId,
      ...newClient,
      clientNumber: generateClientNumber(),
      createdAt: Date.now()
    };
    addClient(client as any);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setShowModal(false);
      setNewClient({ name: '', phone: '', email: '', address: '' });
    }, 2000);
  };

  const getClientSummary = (clientId: string) => {
    const clientLoans = loans.filter(l => l.clientId === clientId);
    const balance = clientLoans.reduce((acc, l) => acc + l.remainingBalance, 0);
    const activeCount = clientLoans.filter(l => l.status === 'active').length;
    return { balance, activeCount };
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header with Search and Add Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black heading-primary italic tracking-tighter uppercase">Clientes</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-1">Toca a un cliente para ver su estado de cuenta</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
        >
          <UserPlus className="w-5 h-5" />
          Registrar Nuevo
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Busca por nombre o número de cliente..."
          className="w-full pl-16 pr-8 py-6 neumorphic-inset focus:outline-none text-lg font-bold heading-primary placeholder:text-slate-600 tracking-tight"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredClients.map((client) => {
            const summary = getClientSummary(client.id);
            return (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onSelectClient(client.id)}
                className="glass-card p-0 overflow-hidden group cursor-pointer border border-white/5 active:scale-[0.98] transition-all hover:bg-white/[0.02]"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black bg-white/5 text-slate-500 px-2 py-1 rounded-full uppercase tracking-tighter">
                        #{client.clientNumber}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black heading-primary tracking-tighter truncate">{client.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      <Phone className="w-3 h-3" /> {client.phone || 'S/N'}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                        <p className={cn(
                          "text-2xl font-black tracking-tighter",
                          summary.balance > 0 ? "text-blue-500" : "text-green-500"
                        )}>
                          {formatCurrency(summary.balance)}
                        </p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Préstamos</p>
                         <p className="text-sm font-black heading-primary">{summary.activeCount} Activos</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-600/5 p-3 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <span>Ver Estado de Cuenta</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal Registro (Same simple form from before) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isSuccess && setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-xl relative z-10 border-white/10 shadow-2xl"
            >
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center text-center space-y-6">
                  <motion.div animate={{ scale: [0, 1.2, 1] }} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/30">
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <h3 className="text-2xl font-black heading-primary uppercase italic">¡Cliente Registrado!</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Guardando información en la base de datos...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-black heading-primary uppercase tracking-tighter italic">Nuevo Registro</h2>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ingresa los datos del nuevo cliente</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full heading-primary transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleAddClient} className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-4 neumorphic-inset focus:outline-none font-bold heading-primary"
                        placeholder="Ej. Pedro Picapiedra"
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                        <input 
                          type="tel" 
                          className="w-full p-4 neumorphic-inset focus:outline-none font-bold heading-primary"
                          placeholder="10 dígitos"
                          value={newClient.phone}
                          onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email (Opcional)</label>
                        <input 
                          type="email" 
                          className="w-full p-4 neumorphic-inset focus:outline-none font-bold heading-primary"
                          placeholder="correo@ejemplo.com"
                          value={newClient.email}
                          onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dirección</label>
                      <textarea 
                        className="w-full p-4 neumorphic-inset focus:outline-none h-24 font-bold heading-primary resize-none"
                        placeholder="Dirección completa..."
                        value={newClient.address}
                        onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.95] transition-all text-lg mt-4"
                    >
                      Guardar Cliente
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
