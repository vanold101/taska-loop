import { useState, useEffect } from "react";
import { 
  SplitType, 
  SplitDetail, 
  ItemSplit, 
  createEqualSplit, 
  loadSplitConfig, 
  updateSplit, 
  saveSplitConfig 
} from "@/services/CostSplitService";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Split, UserPlus, DollarSign, Percent, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ItemSplitSelectorProps {
  tripId: string;
  itemId: string;
  itemName: string;
  itemPrice?: number;
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
  onSplitUpdated?: () => void;
}

const ItemSplitSelector = ({
  tripId,
  itemId,
  itemName,
  itemPrice,
  participants,
  onSplitUpdated
}: ItemSplitSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const { toast } = useToast();

  // Load existing split configuration when dialog opens
  useEffect(() => {
    if (isOpen) {
      const splits = loadSplitConfig(tripId);
      const itemSplit = splits.find(s => s.itemId === itemId);
      
      if (itemSplit) {
        setSplitType(itemSplit.splitType);
        setSplitDetails(itemSplit.details);
        setSelectedParticipants(itemSplit.details.map(d => d.userId));
      } else {
        // Default to equal split among all participants
        const defaultSplit = createEqualSplit(itemId, participants);
        setSplitType(defaultSplit.splitType);
        setSplitDetails(defaultSplit.details);
        setSelectedParticipants(participants.map(p => p.id));
      }
    }
  }, [isOpen, tripId, itemId, participants]);

  // Handle split type change
  const handleSplitTypeChange = (value: string) => {
    const newSplitType = value as SplitType;
    setSplitType(newSplitType);
    
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
      setSplitDetails(newDetails);
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
      setSplitDetails(newDetails);
    } else if (newSplitType === 'person') {
      // For person-specific, divide the total price equally as a starting point
      const equalAmount = (itemPrice || 0) / selectedParticipants.length;
      const newDetails = selectedParticipants.map(id => {
        const participant = participants.find(p => p.id === id);
        return {
          userId: id,
          userName: participant?.name || 'Unknown',
          share: equalAmount
        };
      });
      setSplitDetails(newDetails);
    }
  };

  // Handle participant selection
  const handleParticipantToggle = (participantId: string) => {
    const isSelected = selectedParticipants.includes(participantId);
    
    if (isSelected) {
      // Remove participant
      const newSelected = selectedParticipants.filter(id => id !== participantId);
      setSelectedParticipants(newSelected);
      
      // Update split details to remove this participant
      const newDetails = splitDetails.filter(d => d.userId !== participantId);
      
      // Redistribute shares for remaining participants
      if (newSelected.length > 0) {
        if (splitType === 'equal') {
          const equalShare = 100 / newSelected.length;
          newDetails.forEach(d => d.share = equalShare);
        } else if (splitType === 'percentage') {
          // Rescale percentages to sum to 100
          const totalShare = newDetails.reduce((sum, d) => sum + d.share, 0);
          if (totalShare > 0) {
            const scaleFactor = 100 / totalShare;
            newDetails.forEach(d => d.share = d.share * scaleFactor);
          }
        }
      }
      
      setSplitDetails(newDetails);
    } else {
      // Add participant
      const newSelected = [...selectedParticipants, participantId];
      setSelectedParticipants(newSelected);
      
      // Find the participant info
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return;
      
      // Create new detail for this participant
      let newShare = 0;
      if (splitType === 'equal') {
        newShare = 100 / newSelected.length;
        // Update all shares to be equal
        const newDetails = [
          ...splitDetails.map(d => ({ ...d, share: newShare })),
          {
            userId: participantId,
            userName: participant.name,
            share: newShare
          }
        ];
        setSplitDetails(newDetails);
      } else if (splitType === 'percentage') {
        // Add with 0% initially
        const newDetails = [
          ...splitDetails,
          {
            userId: participantId,
            userName: participant.name,
            share: 0
          }
        ];
        setSplitDetails(newDetails);
      } else if (splitType === 'person') {
        // Add with $0 initially
        const newDetails = [
          ...splitDetails,
          {
            userId: participantId,
            userName: participant.name,
            share: 0
          }
        ];
        setSplitDetails(newDetails);
      }
    }
  };

  // Handle share value change
  const handleShareChange = (userId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const newDetails = splitDetails.map(d => 
      d.userId === userId ? { ...d, share: numValue } : d
    );
    
    setSplitDetails(newDetails);
  };

  // Calculate total percentage to show validation
  const totalPercentage = splitType === 'percentage' 
    ? splitDetails.reduce((sum, d) => sum + d.share, 0) 
    : 100;
    
  // Calculate total amount for fixed amounts
  const totalAmount = splitType === 'person'
    ? splitDetails.reduce((sum, d) => sum + d.share, 0)
    : 0;
    
  // Check if amounts match item price
  const amountMatchesPrice = splitType !== 'person' || itemPrice === undefined || 
    Math.abs(totalAmount - itemPrice) < 0.01;

  // Save the split configuration
  const handleSave = () => {
    if (splitType === 'percentage' && Math.abs(totalPercentage - 100) > 0.01) {
      toast({
        title: "Percentages must sum to 100%",
        variant: "destructive"
      });
      return;
    }
    
    if (splitType === 'person' && itemPrice !== undefined && !amountMatchesPrice) {
      toast({
        title: `Amounts must sum to ${itemPrice.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }
    
    // Save split configuration
    const splits = loadSplitConfig(tripId);
    const updatedSplits = updateSplit(splits, itemId, splitType, splitDetails);
    saveSplitConfig(tripId, updatedSplits);
    
    // Notify parent
    if (onSplitUpdated) {
      onSplitUpdated();
    }
    
    toast({
      title: "Split updated",
      description: `Updated split for ${itemName}`
    });
    
    setIsOpen(false);
  };

  // Format a share value for display
  const formatShare = (share: number, type: SplitType): string => {
    if (type === 'percentage') {
      return `${share.toFixed(1)}%`;
    } else if (type === 'person') {
      return `$${share.toFixed(2)}`;
    } else {
      return `${share.toFixed(1)}%`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 flex items-center gap-1 text-xs"
        >
          <Split className="h-3.5 w-3.5" />
          Split
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Split Cost for {itemName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* No price warning */}
          {itemPrice === undefined && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-amber-800 dark:text-amber-300">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No price available
              </h4>
              <p className="text-sm mt-1">
                Add a price to this item before splitting the cost.
              </p>
            </div>
          )}
          
          {/* Item price display */}
          {itemPrice !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Item total:</span>
              <Badge variant="outline" className="font-mono">
                ${itemPrice.toFixed(2)}
              </Badge>
            </div>
          )}
          
          {/* Split options only shown if price is available */}
          {itemPrice !== undefined && (
            <>
              {/* Split type selector */}
              <div className="space-y-2">
                <Label htmlFor="splitType">Split method:</Label>
                <Select 
                  value={splitType} 
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
                        <Percent className="h-4 w-4 mr-2" />
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
                  {splitType === 'equal' && "Cost will be divided equally among selected participants"}
                  {splitType === 'percentage' && "Specify percentage of the total cost for each participant"}
                  {splitType === 'person' && "Specify exact amount each participant will pay"}
                </p>
              </div>
              
              {/* Participant selection */}
              <div className="space-y-2 pt-2">
                <Label>Who's splitting this item?</Label>
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
              {(splitType === 'percentage' || splitType === 'person') && selectedParticipants.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <Label>Adjust shares:</Label>
                    {splitType === 'percentage' && (
                      <Badge 
                        variant={Math.abs(totalPercentage - 100) < 0.01 ? "outline" : "destructive"}
                        className="font-mono"
                      >
                        Total: {totalPercentage.toFixed(1)}%
                      </Badge>
                    )}
                    {splitType === 'person' && itemPrice !== undefined && (
                      <Badge 
                        variant={amountMatchesPrice ? "outline" : "destructive"}
                        className="font-mono"
                      >
                        Total: ${totalAmount.toFixed(2)} / ${itemPrice.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {splitDetails
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
                              step={splitType === 'percentage' ? 1 : 0.01}
                              max={splitType === 'percentage' ? 100 : undefined}
                              onChange={(e) => handleShareChange(detail.userId, e.target.value)}
                              className="w-20 text-right"
                            />
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              {splitType === 'percentage' ? '%' : '$'}
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
                        
                        if (splitType === 'percentage') {
                          equalShare = 100 / selectedParticipants.length;
                        } else if (splitType === 'person' && itemPrice !== undefined) {
                          equalShare = itemPrice / selectedParticipants.length;
                        } else {
                          return;
                        }
                        
                        const newDetails = splitDetails.map(d => 
                          selectedParticipants.includes(d.userId) 
                            ? { ...d, share: equalShare } 
                            : d
                        );
                        
                        setSplitDetails(newDetails);
                      }}
                    >
                      Equalize Selected
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Action buttons */}
          {itemPrice !== undefined ? (
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Split
              </Button>
            </div>
          ) : (
            <div className="flex justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemSplitSelector; 