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
    <div className="container mx-auto px-4 pb-20 pt-4 max-w-md">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">
          Ledger & Payouts
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => loadData()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="mb-4 premium-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Balance</CardTitle>
          <CardDescription>
            Summary of what you owe and are owed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-sm text-gloop-text-muted">You owe</div>
              <div className="text-xl font-semibold">
                ${currentUserBalance?.owesAmount.toFixed(2) || "0.00"}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-sm text-gloop-text-muted">You are owed</div>
              <div className="text-xl font-semibold">
                ${currentUserBalance?.owedAmount.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center">
            <Badge className={`px-3 py-1 text-sm font-medium ${
              positiveBalance ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              negativeBalance ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
            }`}>
              {positiveBalance && <UserPlus className="h-3.5 w-3.5 mr-1" />}
              {negativeBalance && <UserMinus className="h-3.5 w-3.5 mr-1" />}
              {!positiveBalance && !negativeBalance && <User className="h-3.5 w-3.5 mr-1" />}
              Net balance: ${currentUserBalance?.netBalance.toFixed(2) || "0.00"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main tabs */}
      <Tabs defaultValue="balances" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4 w-full premium-card">
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Balances
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transactions
          </TabsTrigger>
        </TabsList>
        
        {/* Balances tab content */}
        <TabsContent value="balances" className="space-y-4">
          {/* Recommended payments */}
          {userRecommendations.length > 0 && (
            <div>
              <h3 className="text-md font-medium mb-2">Recommended Payments</h3>
              <div className="space-y-2">
                {userRecommendations.map((recommendation, index) => (
                  <Card key={index} className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {recommendation.from.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{recommendation.from.userName}</div>
                          <ArrowRight className="h-4 w-4 text-gloop-text-muted" />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {recommendation.to.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{recommendation.to.userName}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="font-semibold text-gloop-primary mr-2">
                            ${recommendation.amount.toFixed(2)}
                          </div>
                          {recommendation.from.userName === "You" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 flex items-center gap-1"
                              onClick={() => handleInitiatePayment(recommendation)}
                            >
                              <Send className="h-3 w-3" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Individual balances */}
          <div>
            <h3 className="text-md font-medium mb-2">All Balances</h3>
            <div className="space-y-2">
              {balances.filter(balance => balance.userName !== "You").map((balance, index) => (
                <Card key={index} className="hover-lift">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {balance.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{balance.userName}</div>
                          <div className="text-xs text-gloop-text-muted">
                            {balance.netBalance > 0 
                              ? `You owe them: $${balance.netBalance.toFixed(2)}` 
                              : balance.netBalance < 0
                                ? `They owe you: $${Math.abs(balance.netBalance).toFixed(2)}`
                                : "No outstanding balance"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {balance.netBalance !== 0 && (
                          <Badge className={`${
                            balance.netBalance > 0 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            ${Math.abs(balance.netBalance).toFixed(2)}
                          </Badge>
                        )}
                        {balance.netBalance > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 flex items-center gap-1"
                            onClick={() => {
                              // Create a manual payment to this person
                              const currentUser = balances.find(b => b.userName === "You");
                              if (currentUser) {
                                handleInitiatePayment({
                                  from: currentUser,
                                  to: balance,
                                  amount: balance.netBalance
                                });
                              }
                            }}
                          >
                            <Send className="h-3 w-3" />
                            Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {balances.length <= 1 && (
                <div className="text-center py-8 border rounded-lg bg-white dark:bg-gloop-dark-surface premium-card">
                  <p className="text-gloop-text-muted dark:text-gloop-dark-text-muted">
                    No balances to display
                  </p>
                  <p className="text-sm mt-2">Start shopping with friends to track expenses!</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Transactions tab content */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Pending transactions */}
          {pendingTransactions.length > 0 && (
            <div>
              <h3 className="text-md font-medium mb-2">Pending Transactions</h3>
              <div className="space-y-2">
                {pendingTransactions.map(transaction => (
                  <Card key={transaction.id} className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                        <span className="text-xs text-gloop-text-muted">
                          {formatDistanceToNow(transaction.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {transaction.fromUserName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{transaction.fromUserName}</div>
                          <ArrowRight className="h-4 w-4 text-gloop-text-muted" />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {transaction.toUserName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{transaction.toUserName}</div>
                        </div>
                        <div className="font-semibold text-gloop-primary">
                          ${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gloop-text-muted mt-1">
                        {transaction.description}
                      </div>
                      
                      {transaction.fromUserName === "You" && (
                        <div className="flex justify-end mt-2 gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 flex items-center gap-1 text-red-500"
                            onClick={() => handleCancelPayment(transaction.id)}
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      {transaction.toUserName === "You" && (
                        <div className="flex justify-end mt-2 gap-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            className="h-8 flex items-center gap-1"
                            onClick={() => handleConfirmPayment(transaction.id)}
                          >
                            <Check className="h-3 w-3" />
                            Confirm
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 flex items-center gap-1 text-red-500"
                            onClick={() => handleCancelPayment(transaction.id)}
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Completed transactions by date */}
          {sortedDates.length > 0 ? (
            sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-gloop-text-muted" />
                  {format(new Date(date), 'MMMM d, yyyy')}
                </h3>
                <div className="space-y-2">
                  {groupedTransactions[date]
                    .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
                    .map(transaction => (
                      <Card key={transaction.id} className={`${
                        transaction.status === 'cancelled' ? 'opacity-60' : ''
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <Badge className={`${
                              transaction.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {transaction.status === 'completed' 
                                ? <Check className="h-3 w-3 mr-1" /> 
                                : <X className="h-3 w-3 mr-1" />}
                              {transaction.status === 'completed' ? 'Completed' : 'Cancelled'}
                            </Badge>
                            <span className="text-xs text-gloop-text-muted">
                              {format(transaction.timestamp, 'h:mm a')}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {transaction.fromUserName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{transaction.fromUserName}</div>
                              <ArrowRight className="h-4 w-4 text-gloop-text-muted" />
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {transaction.toUserName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{transaction.toUserName}</div>
                            </div>
                            <div className="font-semibold text-gloop-primary">
                              ${transaction.amount.toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gloop-text-muted mt-1">
                            {transaction.description}
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 border rounded-lg bg-white dark:bg-gloop-dark-surface premium-card">
              <p className="text-gloop-text-muted dark:text-gloop-dark-text-muted">
                No transactions yet
              </p>
              <p className="text-sm mt-2">Your transactions will appear here once you create them</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add transaction button - moved to bottom-center to avoid overlapping with notification center */}
      <Button 
        variant="default" 
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 h-12 w-12 rounded-full shadow-lg bg-gloop-premium-gradient-start hover:bg-gloop-premium-gradient-end"
        onClick={handleOpenNewPayment}
      >
        <Plus className="h-5 w-5" />
      </Button>

      {/* Export button */}
      <Button 
        variant="outline" 
        className="fixed bottom-24 left-6 h-12 w-12 rounded-full shadow-lg bg-white dark:bg-gloop-dark-surface"
        onClick={() => {
          toast({
            title: "Export to CSV",
            description: "This feature is coming soon!"
          });
        }}
      >
        <Download className="h-5 w-5 text-gloop-primary" />
      </Button>

      {/* Payment dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>
              Record a payment you've made to someone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select 
                value={selectedRecipientId} 
                onValueChange={setSelectedRecipientId}
              >
                <SelectTrigger id="recipient" className="w-full">
                  <SelectValue placeholder="Select who to pay" />
                </SelectTrigger>
                <SelectContent 
                  position="popper" 
                  className="w-full min-w-[200px] z-50"
                  sideOffset={5}
                  align="start"
                  side="bottom"
                >
                  {potentialRecipients.length > 0 ? (
                    potentialRecipients.map(recipient => (
                      <SelectItem key={recipient.userId} value={recipient.userId} className="cursor-pointer">
                        <div className="flex items-center gap-2 py-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{recipient.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{recipient.userName}</span>
                          {recipient.netBalance > 0 && (
                            <Badge className="ml-auto bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              You owe: ${recipient.netBalance.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      <div className="text-sm text-muted-foreground py-1">
                        No recipients available
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gloop-text-muted" />
                <Input
                  id="amount"
                  placeholder="0.00"
                  className="pl-10"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              {selectedRecipientId && (
                <div className="text-xs mt-1">
                  {(() => {
                    const recipient = balances.find(b => b.userId === selectedRecipientId);
                    if (recipient && recipient.netBalance > 0) {
                      return (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-auto text-xs text-blue-500 hover:text-blue-700"
                          onClick={() => setPaymentAmount(recipient.netBalance.toFixed(2))}
                        >
                          Set to full amount (${recipient.netBalance.toFixed(2)})
                        </Button>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="What's this payment for?"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPayment} disabled={!selectedRecipientId || !paymentAmount}>
              <Send className="h-4 w-4 mr-2" />
              Send Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NavBar activeItem="ledger" />
    </div>
  );
};

export default LedgerPage; 