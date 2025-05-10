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
  PlusCircle
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
import { createSettlementTransaction } from "@/services/LedgerService";

interface CostSplitSummaryProps {
  tripId: string;
  tripName: string;
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
  tripId,
  tripName,
  items,
  participants,
  onSettleUp,
  onSplitUpdated
}: CostSplitSummaryProps) => {
  const [splitSummary, setSplitSummary] = useState<TripSplitSummary[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [hasCustomSplits, setHasCustomSplits] = useState(false);
  const [bulkSplitDialogOpen, setBulkSplitDialogOpen] = useState(false);
  const [bulkSplitType, setBulkSplitType] = useState<SplitType>('equal');
  const [bulkSplitDetails, setBulkSplitDetails] = useState<SplitDetail[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const { toast } = useToast();

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
            Cost Split Summary
          </div>
          <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-green-500 text-white">
            <DollarSign className="h-3 w-3 mr-1" />
            ${totalCost.toFixed(2)}
          </Badge>
        </CardTitle>
        <CardDescription>
          {hasCustomSplits ? (
            <span className="flex items-center text-amber-500">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Custom splits applied
            </span>
          ) : (
            <span>Equal split among {participants.length} participants</span>
          )}
        </CardDescription>
      </CardHeader>
      
      {/* Trip total cost */}
      <Card className="border-gloop-outline dark:border-gloop-outline">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>{tripName}</span>
            <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-green-500 text-white">
              <DollarSign className="h-3 w-3 mr-1" />
              ${totalCost.toFixed(2)}
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm">
            {itemsWithPrice} item{itemsWithPrice !== 1 ? 's' : ''} with prices
          </CardDescription>
        </CardHeader>
        
        {/* Paid by information */}
        <CardContent className="pt-0">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center">
              <Wallet className="h-4 w-4 mr-2 text-gloop-primary" />
              <span className="text-sm font-medium">Paid by:</span>
            </div>
            <span className="text-sm font-semibold">{getPaidByText()}</span>
          </div>
        </CardContent>
        
        <CardContent className="space-y-4">
          {/* Trip paid notification */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                Trip expenses added to ledger
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                When you complete the trip, all expenses will be added to the ledger automatically.
                Participants will be notified of their share based on the splits configured below.
              </p>
            </div>
          </div>
          
          {/* Bulk Split Dialog */}
          <Dialog open={bulkSplitDialogOpen} onOpenChange={setBulkSplitDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <SplitSquareVertical className="h-4 w-4" />
                Split Entire Trip
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Split entire trip</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-2">
                {/* Trip total display */}
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trip total:</span>
                  <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-green-500 text-white">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ${totalCost.toFixed(2)}
                  </Badge>
                </div>
                
                {/* Split type selector */}
                <div className="space-y-2">
                  <Label htmlFor="splitType">Split method:</Label>
                  <Select 
                    value={bulkSplitType} 
                    onValueChange={handleSplitTypeChange}
                  >
                    <SelectTrigger id="splitType">
                      <SelectValue placeholder="Select split method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal" className="flex items-center">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Equal split
                        </div>
                      </SelectItem>
                      <SelectItem value="percentage">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Percentage split
                        </div>
                      </SelectItem>
                      <SelectItem value="person">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Fixed amounts
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <p className="text-xs text-muted-foreground">
                    {bulkSplitType === 'equal' && "Cost will be divided equally among selected participants"}
                    {bulkSplitType === 'percentage' && "Specify percentage of the total cost for each participant"}
                    {bulkSplitType === 'person' && "Specify exact amount each participant will pay"}
                  </p>
                </div>
                
                {/* Participant selection */}
                <div className="space-y-2 pt-2">
                  <Label>Who's splitting this trip?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {participants.map(participant => (
                      <div 
                        key={participant.id}
                        className={`flex items-center space-x-2 p-2 rounded-md border ${
                          selectedParticipants.includes(participant.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted'
                        }`}
                        onClick={() => handleParticipantToggle(participant.id)}
                      >
                        <Checkbox 
                          id={`participant-${participant.id}`}
                          checked={selectedParticipants.includes(participant.id)}
                          onCheckedChange={() => handleParticipantToggle(participant.id)}
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Label 
                          htmlFor={`participant-${participant.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {participant.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Share inputs - shown for percentage and person splits */}
                {(bulkSplitType === 'percentage' || bulkSplitType === 'person') && selectedParticipants.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <Label>Adjust shares:</Label>
                      {bulkSplitType === 'percentage' && (
                        <Badge 
                          variant={Math.abs(totalPercentage - 100) < 0.01 ? "outline" : "destructive"}
                          className="font-mono"
                        >
                          Total: {totalPercentage.toFixed(1)}%
                        </Badge>
                      )}
                      {bulkSplitType === 'person' && (
                        <Badge 
                          variant={amountMatchesPrice ? "outline" : "destructive"}
                          className="font-mono"
                        >
                          Total: ${totalAmount.toFixed(2)} / ${totalCost.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {bulkSplitDetails
                        .filter(detail => selectedParticipants.includes(detail.userId))
                        .map(detail => (
                          <div key={detail.userId} className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {detail.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm flex-1">{detail.userName}</span>
                            <div className="relative">
                              <Input
                                type="number"
                                value={detail.share}
                                min={0}
                                step={bulkSplitType === 'percentage' ? 1 : 0.01}
                                max={bulkSplitType === 'percentage' ? 100 : undefined}
                                onChange={(e) => handleShareChange(detail.userId, e.target.value)}
                                className="w-20 text-right"
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                {bulkSplitType === 'percentage' ? '%' : '$'}
                              </span>
                            </div>
                          </div>
                      ))}
                    </div>
                    
                    {/* Quick equalizer button */}
                    {selectedParticipants.length > 1 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full" 
                        onClick={() => {
                          let equalShare: number;
                          
                          if (bulkSplitType === 'percentage') {
                            equalShare = 100 / selectedParticipants.length;
                          } else if (bulkSplitType === 'person') {
                            equalShare = totalCost / selectedParticipants.length;
                          } else {
                            return;
                          }
                          
                          const newDetails = bulkSplitDetails.map(d => 
                            selectedParticipants.includes(d.userId) 
                              ? { ...d, share: equalShare } 
                              : d
                          );
                          
                          setBulkSplitDetails(newDetails);
                        }}
                      >
                        Equalize Selected
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkSplitDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApplyBulkSplit}>
                  Apply to All Items
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Individual Item Splitting Message */}
          <div className="text-center text-sm text-muted-foreground border-t border-b py-2">
            <p>You can also split individual items by clicking the "Split" button on each item in the items tab.</p>
          </div>
          
          {itemsWithPrice === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No items with prices yet</p>
              <p className="text-sm">Add prices to items to see the cost split</p>
            </div>
          ) : (
            <>
              {/* Current user summary */}
              {currentUserSummary && (
                <div className="border rounded-lg p-3 bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {currentUserSummary.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{currentUserSummary.userName}</div>
                        <div className="text-xs text-muted-foreground">
                          {currentUserSummary.itemCount} items
                        </div>
                      </div>
                    </div>
                    <Badge className="font-mono bg-primary/20 text-primary border-primary/30 text-base">
                      ${currentUserSummary.totalAmount.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              )}
              
              {/* Other participants */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Other participants
                </h3>
                
                <div className="space-y-2">
                  {otherParticipants.map(participant => (
                    <div key={participant.userId} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
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
                        <div className="flex flex-col items-end">
                          <Badge className="font-mono mb-1">
                            ${participant.totalAmount.toFixed(2)}
                          </Badge>
                          
                          {/* Settle up button */}
                          {onSettleUp && (
                            <Button 
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleSettleUp(participant.userId)}
                            >
                              <Wallet className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CostSplitSummary; 