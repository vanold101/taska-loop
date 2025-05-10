// Types for ledger transactions
export type TransactionType = 'expense' | 'payment';

export interface Transaction {
  id: string;
  tripId?: string; // Optional - can be associated with a trip
  timestamp: number;
  amount: number;
  type: TransactionType;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface UserBalance {
  userId: string;
  userName: string;
  owesAmount: number; // Total amount user owes to others
  owedAmount: number; // Total amount others owe to the user
  netBalance: number; // owedAmount - owesAmount
}

// Ledger storage key
const LEDGER_STORAGE_KEY = 'taska_ledger_transactions';

// Load transactions from storage
export const loadTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load ledger transactions:', error);
  }
  return [];
};

// Save transactions to storage
export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save ledger transactions:', error);
  }
};

// Add a new transaction
export const addTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
  const transactions = loadTransactions();
  
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString()
  };
  
  transactions.push(newTransaction);
  saveTransactions(transactions);
  
  return newTransaction;
};

// Update a transaction
export const updateTransaction = (
  transactionId: string, 
  updates: Partial<Transaction>
): Transaction | null => {
  const transactions = loadTransactions();
  
  const index = transactions.findIndex(t => t.id === transactionId);
  if (index === -1) return null;
  
  const updatedTransaction = {
    ...transactions[index],
    ...updates
  };
  
  transactions[index] = updatedTransaction;
  saveTransactions(transactions);
  
  return updatedTransaction;
};

// Get transactions for a specific trip
export const getTransactionsForTrip = (tripId: string): Transaction[] => {
  const transactions = loadTransactions();
  return transactions.filter(t => t.tripId === tripId);
};

// Get transactions for a specific user
export const getTransactionsForUser = (userId: string): Transaction[] => {
  const transactions = loadTransactions();
  return transactions.filter(t => 
    t.fromUserId === userId || t.toUserId === userId
  );
};

// Calculate balances for all users
export const calculateUserBalances = (): UserBalance[] => {
  const transactions = loadTransactions();
  const userBalances = new Map<string, UserBalance>();
  
  // Process each transaction
  transactions.forEach(transaction => {
    if (transaction.status !== 'completed') return;
    
    // Initialize user balances if not exist
    if (!userBalances.has(transaction.fromUserId)) {
      userBalances.set(transaction.fromUserId, {
        userId: transaction.fromUserId,
        userName: transaction.fromUserName,
        owesAmount: 0,
        owedAmount: 0,
        netBalance: 0
      });
    }
    
    if (!userBalances.has(transaction.toUserId)) {
      userBalances.set(transaction.toUserId, {
        userId: transaction.toUserId,
        userName: transaction.toUserName,
        owesAmount: 0,
        owedAmount: 0,
        netBalance: 0
      });
    }
    
    const fromUserBalance = userBalances.get(transaction.fromUserId)!;
    const toUserBalance = userBalances.get(transaction.toUserId)!;
    
    if (transaction.type === 'expense') {
      // For expenses, the fromUser owes toUser
      fromUserBalance.owesAmount += transaction.amount;
      toUserBalance.owedAmount += transaction.amount;
    } else if (transaction.type === 'payment') {
      // For payments, the fromUser paid toUser (reducing debt)
      fromUserBalance.owedAmount += transaction.amount;
      toUserBalance.owesAmount += transaction.amount;
    }
  });
  
  // Calculate net balances
  userBalances.forEach(balance => {
    balance.netBalance = balance.owedAmount - balance.owesAmount;
  });
  
  return Array.from(userBalances.values());
};

// Get simplified payment recommendations (who should pay whom)
export const getPaymentRecommendations = (): {from: UserBalance, to: UserBalance, amount: number}[] => {
  const balances = calculateUserBalances();
  
  // Filter to debtors (negative balance) and creditors (positive balance)
  const debtors = balances.filter(b => b.netBalance < 0)
    .sort((a, b) => a.netBalance - b.netBalance); // Most negative first
  const creditors = balances.filter(b => b.netBalance > 0)
    .sort((a, b) => b.netBalance - a.netBalance); // Most positive first
  
  const recommendations: {from: UserBalance, to: UserBalance, amount: number}[] = [];
  
  // Greedy algorithm to simplify payments
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    // Calculate the payment amount
    const amount = Math.min(Math.abs(debtor.netBalance), creditor.netBalance);
    
    if (amount > 0) {
      recommendations.push({
        from: debtor,
        to: creditor,
        amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
      });
    }
    
    // Update balances
    debtor.netBalance += amount;
    creditor.netBalance -= amount;
    
    // Move to next person if their balance is close to zero
    if (Math.abs(debtor.netBalance) < 0.01) i++;
    if (Math.abs(creditor.netBalance) < 0.01) j++;
  }
  
  return recommendations;
};

// Create a settlement transaction from a trip cost split
export const createSettlementTransaction = (
  tripId: string,
  tripName: string,
  fromUserId: string,
  fromUserName: string,
  toUserId: string,
  toUserName: string,
  amount: number
): Transaction => {
  return addTransaction({
    tripId,
    timestamp: Date.now(),
    amount,
    type: 'expense',
    fromUserId,
    fromUserName,
    toUserId,
    toUserName,
    description: `Expenses from trip to ${tripName}`,
    status: 'completed'
  });
};

// Create a payment transaction
export const createPaymentTransaction = (
  fromUserId: string,
  fromUserName: string,
  toUserId: string,
  toUserName: string,
  amount: number,
  description: string = 'Payment'
): Transaction => {
  return addTransaction({
    timestamp: Date.now(),
    amount,
    type: 'payment',
    fromUserId,
    fromUserName,
    toUserId,
    toUserName,
    description,
    status: 'pending' // Initially pending, needs to be confirmed
  });
};

// Confirm a payment
export const confirmPayment = (transactionId: string): Transaction | null => {
  return updateTransaction(transactionId, { status: 'completed' });
};

// Cancel a payment
export const cancelPayment = (transactionId: string): Transaction | null => {
  return updateTransaction(transactionId, { status: 'cancelled' });
}; 