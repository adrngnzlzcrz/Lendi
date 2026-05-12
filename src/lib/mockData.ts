
import { useState, useEffect } from 'react';

export interface Client {
  id: string;
  clientNumber: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: number;
}

export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  interestRate: number;
  penaltyRate: number;
  totalDebt: number;
  remainingBalance: number;
  status: 'active' | 'paid';
  totalInstallments?: number;
  installmentsPaid?: number;
  createdAt: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  loanId: string;
  clientId: string;
  clientName: string;
  amount: number;
  penaltyApplied: number;
  interestApplied: number;
  previousBalance: number;
  newBalance: number;
  installmentNumber?: number;
  overdueInstallments?: number;
  date: string;
}

const INITIAL_CLIENTS: Client[] = [
  { id: '1', clientNumber: 'CLI-0001', name: 'Juan Pérez', phone: '555-0101', email: 'juan@example.com', address: 'Calle 123', createdAt: Date.now() },
  { id: '2', clientNumber: 'CLI-0002', name: 'María García', phone: '555-0102', email: 'maria@example.com', address: 'Av. Central 456', createdAt: Date.now() },
  { id: '3', clientNumber: 'CLI-0003', name: 'Carlos Rodríguez', phone: '555-0103', email: 'carlos@example.com', address: 'Paseo del Sol 789', createdAt: Date.now() },
  { id: '4', clientNumber: 'CLI-0004', name: 'Ana Martínez', phone: '555-0104', email: 'ana@example.com', address: 'Colonia Roma 10', createdAt: Date.now() },
  { id: '5', clientNumber: 'CLI-0005', name: 'Roberto Sánchez', phone: '555-0105', email: 'roberto@example.com', address: 'Fracc. Las Nubes', createdAt: Date.now() },
  { id: '6', clientNumber: 'CLI-0006', name: 'Lucía López', phone: '555-0106', email: 'lucia@example.com', address: 'Cda. de los Bosques', createdAt: Date.now() },
  { id: '7', clientNumber: 'CLI-0007', name: 'Fernando Ruiz', phone: '555-0107', email: 'fernando@example.com', address: 'Barrio Antiguo 5', createdAt: Date.now() },
  { id: '8', clientNumber: 'CLI-0008', name: 'Patricia Flores', phone: '555-0108', email: 'patricia@example.com', address: 'Eje Vial 500', createdAt: Date.now() },
  { id: '9', clientNumber: 'CLI-0009', name: 'Miguel Herrera', phone: '555-0109', email: 'miguel@example.com', address: 'Industrial Norte', createdAt: Date.now() },
];

const INITIAL_LOANS: Loan[] = [
  { id: 'L1', clientId: '1', clientName: 'Juan Pérez', amount: 5000, interestRate: 10, penaltyRate: 5, totalDebt: 5500, remainingBalance: 3500, status: 'active', createdAt: Date.now() - 864000000 },
  { id: 'L2', clientId: '2', clientName: 'María García', amount: 10000, interestRate: 12, penaltyRate: 5, totalDebt: 11200, remainingBalance: 11200, status: 'active', createdAt: Date.now() - 432000000 },
  { id: 'L3', clientId: '4', clientName: 'Ana Martínez', amount: 2000, interestRate: 5, penaltyRate: 2, totalDebt: 2100, remainingBalance: 1500, status: 'active', createdAt: Date.now() - 172800000 },
  { id: 'L4', clientId: '6', clientName: 'Lucía López', amount: 15000, interestRate: 15, penaltyRate: 10, totalDebt: 17250, remainingBalance: 17250, status: 'active', createdAt: Date.now() - 604800000 },
];

const INITIAL_PAYMENTS: Payment[] = [
  { id: 'P1', paymentNumber: 'REC-0001', loanId: 'L1', clientId: '1', clientName: 'Juan Pérez', amount: 2000, penaltyApplied: 0, interestApplied: 500, previousBalance: 5500, newBalance: 3500, date: new Date(Date.now() - 345600000).toISOString() },
  { id: 'P2', paymentNumber: 'REC-0002', loanId: 'L3', clientId: '4', clientName: 'Ana Martínez', amount: 600, penaltyApplied: 0, interestApplied: 100, previousBalance: 2100, newBalance: 1500, date: new Date(Date.now() - 86400000).toISOString() }
];

export function useMockData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const savedClients = localStorage.getItem('mock_clients_v2');
    const savedLoans = localStorage.getItem('mock_loans_v2');
    const savedPayments = localStorage.getItem('mock_payments_v2');

    if (savedClients) setClients(JSON.parse(savedClients));
    else {
      setClients(INITIAL_CLIENTS);
      localStorage.setItem('mock_clients_v2', JSON.stringify(INITIAL_CLIENTS));
    }

    if (savedLoans) setLoans(JSON.parse(savedLoans));
    else {
      setLoans(INITIAL_LOANS);
      localStorage.setItem('mock_loans_v2', JSON.stringify(INITIAL_LOANS));
    }

    if (savedPayments) setPayments(JSON.parse(savedPayments));
    else {
      setPayments(INITIAL_PAYMENTS);
      localStorage.setItem('mock_payments_v2', JSON.stringify(INITIAL_PAYMENTS));
    }
  }, []);

  const addClient = (client: Client) => {
    const newClients = [client, ...clients];
    setClients(newClients);
    localStorage.setItem('mock_clients_v2', JSON.stringify(newClients));
  };

  const addLoan = (loan: Loan) => {
    const newLoans = [loan, ...loans];
    setLoans(newLoans);
    localStorage.setItem('mock_loans_v2', JSON.stringify(newLoans));
  };

  const addPayment = (payment: Payment) => {
    const newPayments = [payment, ...payments];
    setPayments(newPayments);
    localStorage.setItem('mock_payments_v2', JSON.stringify(newPayments));

    // Update loan balance and installments
    const updatedLoans = loans.map(loan => {
      if (loan.id === payment.loanId) {
        const isPaid = payment.newBalance <= 0;
        const newInstallmentsPaid = (loan.installmentsPaid || 0) + 1;
        return { 
          ...loan, 
          remainingBalance: payment.newBalance, 
          status: isPaid ? 'paid' : 'active',
          installmentsPaid: newInstallmentsPaid
        } as Loan;
      }
      return loan;
    });
    setLoans(updatedLoans);
    localStorage.setItem('mock_loans_v2', JSON.stringify(updatedLoans));
  };

  const generateClientNumber = () => {
    const nextNum = clients.length + 1;
    return `CLI-${nextNum.toString().padStart(4, '0')}`;
  };

  const generatePaymentNumber = () => {
    const nextNum = payments.length + 1;
    const yearSuffix = new Date().getFullYear().toString().slice(-2);
    const timeHash = Date.now().toString().slice(-4);
    return `REC-${yearSuffix}${nextNum.toString().padStart(4, '0')}-${timeHash}`;
  };

  return {
    clients,
    loans,
    payments,
    addClient,
    addLoan,
    addPayment,
    generateClientNumber,
    generatePaymentNumber
  };
}
