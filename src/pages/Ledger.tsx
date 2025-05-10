import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  calculateUserBalances, 
  loadTransactions, 
  Transaction, 
  UserBalance,
  getPaymentRecommendations,
  createPaymentTransaction,
  confirmPayment,
  cancelPayment
} from "../services/LedgerService";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { 
  ArrowRight, 
  Calendar, 
  Check, 
  Clock, 
  DollarSign, 
  Download,
  FileText,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Send,
  User, 
  UserMinus, 
  UserPlus,
  Wallet,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const LedgerPage = () => {
  const [activeTab, setActiveTab] = useState("balances");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [recommendations, setRecommendations] = useState<{from: UserBalance, to: UserBalance, amount: number}[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{from: UserBalance, to: UserBalance, amount: number} | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
  const { toast } = useToast();
  
  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);
  
  // Reload all data
  const loadData = () => {
    const loadedTransactions = loadTransactions();
    setTransactions(loadedTransactions);
    
    const loadedBalances = calculateUserBalances();
    setBalances(loadedBalances);
    
    const payRecommendations = getPaymentRecommendations();
    setRecommendations(payRecommendations);
  };
  
  // Handle initiating a payment
  const handleInitiatePayment = (recommendation: {from: UserBalance, to: UserBalance, amount: number}) => {
    setSelectedPayment(recommendation);
    setPaymentAmount(recommendation.amount.toFixed(2));
    setPaymentDescription(`Payment to ${recommendation.to.userName}`);
    setSelectedRecipientId(recommendation.to.userId);
    setShowPaymentDialog(true);
  };
  
  // Handle confirming a payment
  const handleConfirmPayment = (transactionId: string) => {
    const result = confirmPayment(transactionId);
    if (result) {
      toast({
        title: "Payment confirmed",
        description: "The payment has been marked as completed."
      });
      loadData();
    }
  };
  
  // Handle cancelling a payment
  const handleCancelPayment = (transactionId: string) => {
    const result = cancelPayment(transactionId);
    if (result) {
      toast({
        title: "Payment cancelled",
        description: "The payment has been cancelled."
      });
      loadData();
    }
  };
  
  // Submit a new payment
  const handleSubmitPayment = () => {
    // Get the current user
    const currentUser = balances.find(b => b.userName === "You");
    if (!currentUser) {
      toast({
        title: "User not found",
        description: "Could not identify the current user.",
        variant: "destructive"
      });
      return;
    }
    
    // Get the selected recipient
    const recipient = balances.find(b => b.userId === selectedRecipientId);
    if (!recipient) {
      toast({
        title: "Please select a recipient",
        description: "You need to select who you're paying.",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive"
      });
      return;
    }
    
    const transaction = createPaymentTransaction(
      currentUser.userId,
      currentUser.userName,
      recipient.userId,
      recipient.userName,
      amount,
      paymentDescription || `Payment to ${recipient.userName}`
    );
    
    if (transaction) {
      toast({
        title: "Payment created",
        description: `You've created a payment of $${amount.toFixed(2)} to ${recipient.userName}.`
      });
      
      // Close dialog and reload data
      setShowPaymentDialog(false);
      setSelectedRecipientId("");
      loadData();
    }
  };
  
  // Handle new payment dialog open
  const handleOpenNewPayment = () => {
    // Reset the payment form
    setSelectedPayment(null);
    setPaymentAmount("");
    setPaymentDescription("");
    setSelectedRecipientId("");
    setShowPaymentDialog(true);
  };
  
  // Get the current user's balance
  const currentUserBalance = balances.find(b => b.userName === "You");
  const positiveBalance = currentUserBalance?.netBalance && currentUserBalance.netBalance > 0;
  const negativeBalance = currentUserBalance?.netBalance && currentUserBalance.netBalance < 0;
  
  // Filter recommendations for current user
  const userRecommendations = recommendations.filter(r => 
    r.from.userName === "You" || r.to.userName === "You"
  );
  
  // Filter transactions to show pending ones first
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
  
  // Sort dates in reverse chronological order
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Get potential recipients (everyone except current user)
  const potentialRecipients = balances.filter(b => b.userName !== "You");
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-grow w-full px-[5vw] md:px-[8vw] lg:px-[10vw] py-6 md:py-8 pb-20 md:pb-24">
        {/* Header section */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">Ledger</h1>
          <p className="text-gray-600 dark:text-gray-300">Track expenses and settle debts with your household</p>
        </header>
        
        {/* Summary Card */}
        <Card className="mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Your Balance</h2>
                <div className="flex items-baseline">
                  <span className={`text-2xl font-bold ${
                    positiveBalance 
                      ? "text-green-600 dark:text-green-400" 
                      : negativeBalance 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-gray-800 dark:text-gray-200"
                  }`}>
                    {currentUserBalance?.netBalance ? `$${Math.abs(currentUserBalance.netBalance).toFixed(2)}` : "$0.00"}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {positiveBalance 
                      ? "owed to you" 
                      : negativeBalance 
                        ? "you owe" 
                        : "all settled up"}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleOpenNewPayment}
                  className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Money
                </Button>
                <Button 
                  onClick={loadData} 
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recommendations */}
        {userRecommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">Recommended Payments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {userRecommendations.map((rec, index) => (
                <Card key={index} className="border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                  <CardContent className="p-4 flex-grow">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${
                            rec.from.userName === "You" 
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                              : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          }`}>
                            {rec.from.userName === "You" 
                              ? "Y" 
                              : rec.from.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="font-medium">{rec.from.userName}</span>
                            <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                            <span className="font-medium">{rec.to.userName}</span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ${rec.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      {rec.from.userName === "You" && (
                        <Button 
                          onClick={() => handleInitiatePayment(rec)}
                          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                          size="sm"
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 p-1 mb-4">
            <TabsTrigger value="balances" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
              Balances
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
              Transactions
            </TabsTrigger>
          </TabsList>
          
          {/* Balances Tab */}
          <TabsContent value="balances" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {balances.length > 0 ? (
                balances.map(balance => (
                  <Card key={balance.userId} className="border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <CardContent className="p-4 flex-grow">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`${
                              balance.userName === "You" 
                                ? "bg-gradient-to-br from-blue-500 to-green-500 text-white" 
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}>
                              {balance.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{balance.userName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {balance.userName === "You" 
                                ? positiveBalance 
                                  ? "Others owe you" 
                                  : negativeBalance 
                                    ? "You owe others" 
                                    : "All settled up"
                                : balance.netBalance > 0 
                                  ? `Owes you $${balance.netBalance.toFixed(2)}` 
                                  : balance.netBalance < 0 
                                    ? `You owe $${Math.abs(balance.netBalance).toFixed(2)}` 
                                    : "All settled up"}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`text-lg font-semibold ${
                          balance.userName !== "You" && balance.netBalance > 0 
                            ? "text-green-600 dark:text-green-400" 
                            : balance.userName !== "You" && balance.netBalance < 0 
                              ? "text-red-600 dark:text-red-400" 
                              : "text-gray-600 dark:text-gray-300"
                        }`}>
                          {balance.userName !== "You" && balance.netBalance !== 0 && (
                            `${balance.netBalance > 0 ? "+" : ""}$${balance.netBalance.toFixed(2)}`
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border border-dashed border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No balance information</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Start making transactions to track balances</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-0">
            {sortedDates.length > 0 ? (
              <div className="space-y-6">
                {sortedDates.map(date => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-opacity-80 backdrop-blur-sm py-2 px-1 -mx-1 z-10 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-blue-500/5 dark:from-blue-900/20 dark:via-green-900/20 dark:to-blue-900/20">{format(new Date(date), "MMMM d, yyyy")}</h3>
                    <div className="space-y-3">
                      {groupedTransactions[date].map(transaction => (
                        <Card key={transaction.id} className={`border shadow-sm ${transaction.status === 'pending' ? 'border-yellow-500/50 dark:border-yellow-400/40' : 'border-gray-200 dark:border-gray-700'} flex flex-col`}>
                          <CardContent className="p-4 flex-grow">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${
                                  transaction.type === "payment" 
                                    ? "bg-blue-100 dark:bg-blue-900/30" 
                                    : transaction.type === "expense" 
                                      ? "bg-amber-100 dark:bg-amber-900/30" 
                                      : "bg-green-100 dark:bg-green-900/30"
                                }`}>
                                  {transaction.type === "payment" ? (
                                    <Send className={`h-5 w-5 ${
                                      transaction.fromUserName === "You" 
                                        ? "text-blue-600 dark:text-blue-400" 
                                        : "text-green-600 dark:text-green-400"
                                    }`} />
                                  ) : transaction.type === "expense" ? (
                                    <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                  ) : (
                                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{transaction.description}</div>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    <span>
                                      {format(new Date(transaction.timestamp), "MMM d, yyyy")}
                                      {" · "}
                                      {formatDistanceToNow(new Date(transaction.timestamp))} ago
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <div className="flex items-center text-sm">
                                      <span className="font-medium mr-1">From:</span>
                                      <Avatar className="h-5 w-5 mr-1">
                                        <AvatarFallback className="text-xs">
                                          {transaction.fromUserName.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{transaction.fromUserName}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                      <span className="font-medium mr-1">To:</span>
                                      <Avatar className="h-5 w-5 mr-1">
                                        <AvatarFallback className="text-xs">
                                          {transaction.toUserName.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{transaction.toUserName}</span>
                                    </div>
                                  </div>
                                  {transaction.status === "pending" && transaction.type === "payment" && (
                                    <div className="flex gap-2 mt-3">
                                      {transaction.fromUserName === "You" ? (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Awaiting confirmation
                                        </Badge>
                                      ) : (
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-7 px-2 border-red-200 hover:border-red-300 dark:border-red-900 dark:hover:border-red-800"
                                            onClick={() => handleCancelPayment(transaction.id)}
                                          >
                                            <X className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
                                            <span className="text-xs text-red-600 dark:text-red-400">Decline</span>
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            className="h-7 px-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                                            onClick={() => handleConfirmPayment(transaction.id)}
                                          >
                                            <Check className="h-3 w-3 mr-1" />
                                            <span className="text-xs">Confirm</span>
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end">
                                <span className={`font-semibold ${
                                  transaction.fromUserName === "You" 
                                    ? "text-red-600 dark:text-red-400" 
                                    : transaction.toUserName === "You" 
                                      ? "text-green-600 dark:text-green-400" 
                                      : "text-gray-800 dark:text-gray-200"
                                }`}>
                                  {transaction.fromUserName === "You" 
                                    ? `-$${transaction.amount.toFixed(2)}` 
                                    : transaction.toUserName === "You" 
                                      ? `+$${transaction.amount.toFixed(2)}` 
                                      : `$${transaction.amount.toFixed(2)}`}
                                </span>
                                <Badge className={`mt-1 ${
                                  transaction.status === "completed" 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                                    : transaction.status === "pending" 
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" 
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                }`}>
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border border-dashed border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Start making payments or logging expenses</p>
                  <Button 
                    onClick={handleOpenNewPayment}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Money
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment</DialogTitle>
            <DialogDescription>
              Create a payment to settle your balance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                value={selectedRecipientId}
                onValueChange={setSelectedRecipientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {balances
                    .filter(b => b.userName !== "You")
                    .map(user => (
                      <SelectItem key={user.userId} value={user.userId}>
                        {user.userName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="amount"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={paymentDescription}
                onChange={e => setPaymentDescription(e.target.value)}
                placeholder="Payment for groceries, etc."
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPayment}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LedgerPage; 