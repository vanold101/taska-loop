import { useState, useEffect } from "react";
import { 
  calculateSplitAmounts, 
  TripSplitSummary,
  loadSplitConfig,
  saveSplitConfig,
  SplitType,
  ItemSplit,
  SplitDetail,
  updateSplit,
  createEqualSplit
} from "@/services/CostSplitService";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DollarSign, 
  Users, 
  Share2, 
  Wallet, 
  Download, 
  AlertCircle,
  SplitSquareVertical,
  PlusCircle,
  Mail,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { createSettlementTransaction } from "@/services/LedgerService";
import { useHousehold } from "@/context/HouseholdContext";
import { useAuth } from "@/context/AuthContext";
import { inviteService } from "@/services/InviteService";

interface CostSplitSummaryProps {
  tripId?: string;
  tripName?: string;
  items: {
    id: string;
    name: string;
    price?: number;
    quantity: number;
  }[];
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
  onSettleUp?: (amount: number, toUserId: string, fromUserId: string) => void;
  onSplitUpdated?: () => void;
}

const CostSplitSummary = ({
  tripId = `trip-${Date.now()}`, // Generate a fallback ID if not provided
  tripName = "Shopping Trip",  // Use default name if not provided
  items,
  participants,
  onSettleUp,
  onSplitUpdated
}: CostSplitSummaryProps) => {
  const [splitSummary, setSplitSummary] = useState<TripSplitSummary[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [hasCustomSplits, setHasCustomSplits] = useState(false);
  const [bulkSplitDialogOpen, setBulkSplitDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [bulkSplitType, setBulkSplitType] = useState<SplitType>('equal');
  const [bulkSplitDetails, setBulkSplitDetails] = useState<SplitDetail[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [selectedExpenseItems, setSelectedExpenseItems] = useState<string[]>([]);
  const { toast } = useToast();
  const { inviteForExpense } = useHousehold();
  const { user } = useAuth();

  // Calculate the split amounts when component mounts or dependencies change
  useEffect(() => {
    // Calculate total cost
    const total = items.reduce((sum, item) => {
      return sum + (item.price || 0) * item.quantity;
    }, 0);
    setTotalCost(total);
    
    // Calculate split amounts
    const summary = calculateSplitAmounts(tripId, items, participants);
    setSplitSummary(summary);
    
    // Check if there are any custom splits
    const splits = loadSplitConfig(tripId);
    setHasCustomSplits(splits.length > 0);
  }, [tripId, items, participants]);

  // Initialize bulk split options when dialog opens
  useEffect(() => {
    if (bulkSplitDialogOpen) {
      // Default to all participants
      const participantIds = participants.map(p => p.id);
      setSelectedParticipants(participantIds);
      
      // Create equal split details
      const equalShare = 100 / participantIds.length;
      const details = participantIds.map(id => {
        const participant = participants.find(p => p.id === id);
        return {
          userId: id,
          userName: participant?.name || 'Unknown',
          share: equalShare
        };
      });
      
      setBulkSplitDetails(details);
      setBulkSplitType('equal');
    }
  }, [bulkSplitDialogOpen, participants]);

  // Initialize invite dialog
  useEffect(() => {
    if (inviteDialogOpen) {
      // Default to all items with prices
      const itemsWithPrices = items.filter(item => item.price !== undefined && item.price > 0).map(item => item.id);
      setSelectedExpenseItems(itemsWithPrices);
      
      // Set default message
      const selectedTotal = items
        .filter(item => itemsWithPrices.includes(item.id))
        .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
      
      if (selectedTotal > 0) {
        const defaultMessage = `I'd like to split some expenses from our ${tripName || 'shopping trip'} with you!

Total amount: $${selectedTotal.toFixed(2)}
Your share: $${(selectedTotal / 2).toFixed(2)} (split equally)

Download TaskaLoop to easily split expenses and track payments!`;
        
        setInviteMessage(defaultMessage);
      } else {
        const defaultMessage = `I'd like to invite you to join our ${tripName || 'shopping trip'} on TaskaLoop!

TaskaLoop helps us coordinate shopping trips, split expenses, and manage household tasks together.

Download TaskaLoop to get started!`;
        
        setInviteMessage(defaultMessage);
      }
    }
  }, [inviteDialogOpen, items, tripName]);

  // Get the current user's summary
  const currentUserSummary = splitSummary.find(s => s.userName === "You");
  
  // Other participants (excluding current user)
  const otherParticipants = splitSummary.filter(s => s.userName !== "You");
  
  // Calculate total items with prices
  const itemsWithPrice = items.filter(item => item.price !== undefined).length;
  
  // Handle share button click
  const handleShare = () => {
    // In a real app, this would open a share dialog or generate a share link
    toast({
      title: "Share split summary",
      description: "This feature is coming soon!"
    });
  };
  
  // Handle export button click
  const handleExport = () => {
    // In a real app, this would generate a CSV export
    toast({
      title: "Export to CSV",
      description: "This feature is coming soon!"
    });
  };

  // Handle sending expense invite
  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to send the invitation",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate total amount for selected items
      const selectedTotal = items
        .filter(item => selectedExpenseItems.includes(item.id))
        .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

      if (selectedTotal > 0) {
        // Send expense split invitation
        const selectedItemNames = items
          .filter(item => selectedExpenseItems.includes(item.id))
          .map(item => item.name)
          .join(", ");

        const expenseDescription = selectedItemNames.length > 50 
          ? `${selectedItemNames.substring(0, 50)}...` 
          : selectedItemNames;

        await inviteForExpense(
          inviteEmail,
          selectedTotal,
          expenseDescription,
          tripId,
          tripName
        );

        toast({
          title: "Expense split invitation sent!",
          description: `Invitation to split $${selectedTotal.toFixed(2)} sent to ${inviteEmail}`,
        });
      } else {
        // Send general app invitation since there are no expenses to split
        await inviteService.sendAppDownloadInvite({
          email: inviteEmail,
          message: inviteMessage || undefined,
          fromUser: {
            id: user?.id || 'current-user',
            name: user?.name || 'Someone',
            email: user?.email || ''
          }
        });

        toast({
          title: "Invitation sent!",
          description: `App invitation sent to ${inviteEmail}`,
        });
      }

      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteMessage("");
      setSelectedExpenseItems([]);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Failed to send invitation",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };
  
  // Handle settle up button click
  const handleSettleUp = (toUserId: string) => {
    if (!currentUserSummary || !onSettleUp) return;
    
    const toParticipant = splitSummary.find(s => s.userId === toUserId);
    if (!toParticipant) return;
    
    // Create a settlement transaction in the ledger
    // This represents that the current user is paying what they owe to the other participant
    createSettlementTransaction(
      tripId,
      tripName,
      currentUserSummary.userId,  // From: Current user who is paying
      currentUserSummary.userName,
      toParticipant.userId,       // To: User who is receiving payment
      toParticipant.userName,
      toParticipant.totalAmount
    );
    
    // Call the onSettleUp callback
    onSettleUp(toParticipant.totalAmount, toUserId, currentUserSummary.userId);
    
    toast({
      title: "Payment recorded",
      description: `Payment of $${toParticipant.totalAmount.toFixed(2)} to ${toParticipant.userName} has been recorded in the ledger`
    });
  };

  // Get who paid for the trip (assume it's the shopper/current user)
  const getPaidByText = () => {
    // In a real app, this should come from the trip's shopper information
    return "You";
  };

  // Handle participant selection for bulk split
  const handleParticipantToggle = (participantId: string) => {
    const isSelected = selectedParticipants.includes(participantId);
    
    if (isSelected) {
      // Remove participant
      const newSelected = selectedParticipants.filter(id => id !== participantId);
      setSelectedParticipants(newSelected);
      
      // Update split details to remove this participant
      const newDetails = bulkSplitDetails.filter(d => d.userId !== participantId);
      
      // Redistribute shares for remaining participants
      if (newSelected.length > 0) {
        if (bulkSplitType === 'equal') {
          const equalShare = 100 / newSelected.length;
          newDetails.forEach(d => d.share = equalShare);
        } else if (bulkSplitType === 'percentage') {
          // Rescale percentages to sum to 100
          const totalShare = newDetails.reduce((sum, d) => sum + d.share, 0);
          if (totalShare > 0) {
            const scaleFactor = 100 / totalShare;
            newDetails.forEach(d => d.share = d.share * scaleFactor);
          }
        }
      }
      
      setBulkSplitDetails(newDetails);
    } else {
      // Add participant
      const newSelected = [...selectedParticipants, participantId];
      setSelectedParticipants(newSelected);
      
      // Find the participant info
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return;
      
      // Create new detail for this participant
      let newShare = 0;
      if (bulkSplitType === 'equal') {
        newShare = 100 / newSelected.length;
        // Update all shares to be equal
        const newDetails = [
          ...bulkSplitDetails.map(d => ({ ...d, share: newShare })),
          {
            userId: participantId,
            userName: participant.name,
            share: newShare
          }
        ];
        setBulkSplitDetails(newDetails);
      } else if (bulkSplitType === 'percentage') {
        // Add with 0% initially
        const newDetails = [
          ...bulkSplitDetails,
          {
            userId: participantId,
            userName: participant.name,
            share: 0
          }
        ];
        setBulkSplitDetails(newDetails);
      } else if (bulkSplitType === 'person') {
        // Add with $0 initially
        const newDetails = [
          ...bulkSplitDetails,
          {
            userId: participantId,
            userName: participant.name,
            share: 0
          }
        ];
        setBulkSplitDetails(newDetails);
      }
    }
  };

  // Handle split type change
  const handleSplitTypeChange = (value: string) => {
    const newSplitType = value as SplitType;
    setBulkSplitType(newSplitType);
    
    // Reset details based on new split type
    if (newSplitType === 'equal') {
      // For equal split, we need all selected participants with equal shares
      const equalShare = 100 / selectedParticipants.length;
      const newDetails = selectedParticipants.map(id => {
        const participant = participants.find(p => p.id === id);
        return {
          userId: id,
          userName: participant?.name || 'Unknown',
          share: equalShare
        };
      });
      setBulkSplitDetails(newDetails);
    } else if (newSplitType === 'percentage') {
      // For percentage, initialize with equal percentages that sum to 100
      const equalPercentage = 100 / selectedParticipants.length;
      const newDetails = selectedParticipants.map(id => {
        const participant = participants.find(p => p.id === id);
        return {
          userId: id,
          userName: participant?.name || 'Unknown',
          share: equalPercentage
        };
      });
      setBulkSplitDetails(newDetails);
    } else if (newSplitType === 'person') {
      // For person-specific, divide the total price equally as a starting point
      const equalAmount = totalCost / selectedParticipants.length;
      const newDetails = selectedParticipants.map(id => {
        const participant = participants.find(p => p.id === id);
        return {
          userId: id,
          userName: participant?.name || 'Unknown',
          share: equalAmount
        };
      });
      setBulkSplitDetails(newDetails);
    }
  };

  // Handle share value change
  const handleShareChange = (userId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const newDetails = bulkSplitDetails.map(d => 
      d.userId === userId ? { ...d, share: numValue } : d
    );
    
    setBulkSplitDetails(newDetails);
  };

  // Calculate total percentage for validation
  const totalPercentage = bulkSplitType === 'percentage' 
    ? bulkSplitDetails.reduce((sum, d) => sum + d.share, 0) 
    : 100;
    
  // Calculate total amount for fixed amounts
  const totalAmount = bulkSplitType === 'person'
    ? bulkSplitDetails.reduce((sum, d) => sum + d.share, 0)
    : 0;

  // Check if amounts match the total price
  const amountMatchesPrice = bulkSplitType !== 'person' || 
    Math.abs(totalAmount - totalCost) < 0.01;

  // Apply bulk split to all items
  const handleApplyBulkSplit = () => {
    if (bulkSplitType === 'percentage' && Math.abs(totalPercentage - 100) > 0.01) {
      toast({
        title: "Percentages must sum to 100%",
        variant: "destructive"
      });
      return;
    }
    
    if (bulkSplitType === 'person' && !amountMatchesPrice) {
      toast({
        title: `Amounts must sum to ${totalCost.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }
    
    // Get all items with prices
    const itemsToSplit = items.filter(item => item.price !== undefined);
    
    if (itemsToSplit.length === 0) {
      toast({
        title: "No items to split",
        description: "Add prices to items before splitting costs",
        variant: "destructive"
      });
      return;
    }
    
    // Load existing splits
    let allSplits = loadSplitConfig(tripId);
    
    // Apply the selected split to each item
    for (const item of itemsToSplit) {
      if (bulkSplitType === 'equal') {
        // Create a basic equal split
        const itemSplit = createEqualSplit(item.id, participants.filter(p => 
          selectedParticipants.includes(p.id)
        ));
        
        // Add or update the split
        allSplits = updateSplit(allSplits, item.id, bulkSplitType, itemSplit.details);
      } else {
        // For percentage and person splits, we need to adapt based on item price
        if (bulkSplitType === 'percentage') {
          // Percentage splits can be applied directly
          allSplits = updateSplit(allSplits, item.id, bulkSplitType, bulkSplitDetails);
        } else if (bulkSplitType === 'person' && item.price) {
          // For person splits, we need to scale the amounts proportionally
          const itemPrice = item.price * (item.quantity || 1);
          const ratio = itemPrice / totalCost;
          
          const scaledDetails = bulkSplitDetails.map(detail => ({
            ...detail,
            share: detail.share * ratio
          }));
          
          allSplits = updateSplit(allSplits, item.id, bulkSplitType, scaledDetails);
        }
      }
    }
    
    // Save all splits
    saveSplitConfig(tripId, allSplits);
    
    toast({
      title: "Bulk split applied",
      description: `Split applied to ${itemsToSplit.length} items`
    });
    
    // Close dialog
    setBulkSplitDialogOpen(false);
    
    // Notify parent of change
    if (onSplitUpdated) {
      onSplitUpdated();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Split Summary</CardTitle>
            <Badge variant={hasCustomSplits ? "secondary" : "outline"}>
              {hasCustomSplits ? "Custom Split" : "Equal Split"}
            </Badge>
          </div>
          <CardDescription>
            {items.length} items with a total of ${totalCost.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          {/* Total cost and split info */}
          <div className="mb-4 flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Trip Cost</div>
              <div className="text-xl font-bold flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {totalCost.toFixed(2)}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Items with prices</div>
              <div className="text-base">
                {itemsWithPrice} of {items.length} items
              </div>
            </div>
          </div>
          
          {/* Split details */}
          <div className="space-y-3">
            {splitSummary.map((participant) => (
              <div 
                key={participant.userId} 
                className="flex justify-between items-center p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {participant.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{participant.userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {participant.itemCount} items
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">
                    ${participant.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(participant.totalAmount / totalCost * 100).toFixed(0)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* No participants message */}
          {participants.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No participants added yet.</p>
            </div>
          )}
          
          {/* Buttons for bulk operations */}
          <div className="mt-4 space-y-2">
            <Dialog open={bulkSplitDialogOpen} onOpenChange={setBulkSplitDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SplitSquareVertical className="h-4 w-4 mr-2" />
                  Customize Split
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Customize Cost Split</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                  {/* Split type selection */}
                  <div className="space-y-2">
                    <Label>Split Type</Label>
                    <Select 
                      value={bulkSplitType} 
                      onValueChange={(value: string) => handleSplitTypeChange(value as SplitType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select split type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equal">Equal Split</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="person">Custom Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <p className="text-xs text-muted-foreground">
                      {bulkSplitType === 'equal' && "Split the cost equally among selected participants"}
                      {bulkSplitType === 'percentage' && "Assign a percentage of the total to each participant"}
                      {bulkSplitType === 'person' && "Specify exact amounts for each participant"}
                    </p>
                  </div>
                  
                  {/* Participant selection */}
                  <div className="space-y-2">
                    <Label>Select Participants</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`participant-${participant.id}`}
                            checked={selectedParticipants.includes(participant.id)}
                            onCheckedChange={() => handleParticipantToggle(participant.id)}
                          />
                          <Label 
                            htmlFor={`participant-${participant.id}`}
                            className="flex items-center cursor-pointer"
                          >
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="text-xs">
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{participant.name}</span>
                          </Label>
                          
                          {selectedParticipants.includes(participant.id) && (
                            <div className="ml-auto flex items-center space-x-2">
                              <Input
                                type={bulkSplitType === 'person' ? 'number' : 'text'}
                                step={bulkSplitType === 'person' ? '0.01' : undefined}
                                min="0"
                                placeholder={
                                  bulkSplitType === 'percentage' ? '%'
                                  : bulkSplitType === 'person' ? '$'
                                  : 'Equal'
                                }
                                className="w-20 h-8 text-sm"
                                value={
                                  bulkSplitType === 'equal' 
                                    ? (100 / selectedParticipants.length).toFixed(0) + '%'
                                    : bulkSplitDetails.find(d => d.userId === participant.id)?.share.toFixed(
                                        bulkSplitType === 'percentage' ? 0 : 2
                                      ) + (bulkSplitType === 'percentage' ? '%' : '')
                                }
                                onChange={(e) => handleShareChange(participant.id, e.target.value)}
                                disabled={bulkSplitType === 'equal'}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBulkSplitDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplyBulkSplit}>
                    Apply Split
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Invite someone to split expenses */}
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  {items.filter(item => item.price !== undefined && item.price > 0).length > 0 
                    ? "Invite Someone to Split" 
                    : "Invite Someone to TaskaLoop"}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {items.filter(item => item.price !== undefined && item.price > 0).length > 0 
                      ? "Invite Someone to Split Expenses" 
                      : "Invite Someone to TaskaLoop"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                  {/* Email input */}
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="Enter their email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  {/* Select items to split */}
                  <div className="space-y-2">
                    <Label>Select items to split</Label>
                    {items.filter(item => item.price !== undefined && item.price > 0).length > 0 ? (
                      <>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {items.filter(item => item.price !== undefined && item.price > 0).map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`expense-item-${item.id}`}
                                checked={selectedExpenseItems.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedExpenseItems(prev => [...prev, item.id]);
                                  } else {
                                    setSelectedExpenseItems(prev => prev.filter(id => id !== item.id));
                                  }
                                }}
                              />
                              <Label 
                                htmlFor={`expense-item-${item.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                {item.name} - ${((item.price || 0) * item.quantity).toFixed(2)}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Selected total: ${items
                            .filter(item => selectedExpenseItems.includes(item.id))
                            .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                            .toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <div className="p-4 border border-dashed rounded-lg text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          No items with prices found in this trip.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          You can still invite someone to join TaskaLoop and coordinate future trips together!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Custom message */}
                  <div className="space-y-2">
                    <Label htmlFor="invite-message">Custom Message (optional)</Label>
                    <Textarea
                      id="invite-message"
                      placeholder="Add a personal message..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvite}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleExport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Current user summary and settlement options */}
      {currentUserSummary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Summary</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-muted-foreground">You owe</div>
                <div className="text-xl font-bold">
                  ${currentUserSummary.totalAmount.toFixed(2)}
                </div>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {currentUserSummary.itemCount} items
              </Badge>
            </div>
            
            {/* Settlement options */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Settle up with:</div>
              
              {otherParticipants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex justify-between items-center p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {participant.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{participant.userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {getPaidByText() === participant.userName ? "Paid for this trip" : "Sharing cost"}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSettleUp(participant.userId)}
                    disabled={!onSettleUp}
                  >
                    <Wallet className="h-3.5 w-3.5 mr-2" />
                    Pay ${participant.totalAmount.toFixed(2)}
                  </Button>
                </div>
              ))}
              
              {otherParticipants.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>No other participants to settle with.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CostSplitSummary; 