import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Copy, ListChecks, Info, Sparkles, Clipboard, Check, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { TripItem } from "@/components/TripDetailModal";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type SmartListParserProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: Omit<TripItem, 'id'>[]) => void;
};

const SmartListParser = ({ isOpen, onClose, onAddItems }: SmartListParserProps) => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [parsedItems, setParsedItems] = useState<Omit<TripItem, 'id'>[]>([]);
  const [processing, setProcessing] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'output'>('input');
  
  const taskaPrompt = `#taska
You are helping me create a structured grocery list from a block of unstructured text.

Here's how it works:
1. I will paste a recipe, list of meals, event plan, or raw text containing food or product needs.
2. You will:
  - Parse what items I might need.
  - Ask clarifying questions (e.g., how many servings, specific preferences, vague terms like "snacks" or "drinks").
  - Then generate a final grocery list formatted clearly for copying back into the Taska app.

Output Format:
Please give the final list using this format:

🛒 Grocery List
- [Item name] ([optional quantity])
- [Item name]
- ...

Make sure the list is:
- In plain, copy-friendly text
- Organized and clean (no duplicates or fluff)
- Ready for direct copy/paste into a grocery list app

Now, here is the text I want to base my grocery list on:

${input}`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(taskaPrompt);
    setPromptCopied(true);
    toast({
      title: "Prompt copied to clipboard",
      description: "Now paste it into ChatGPT to generate your list",
    });
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const parseOutput = (output: string) => {
    // Simple parser for the expected format
    // This can be enhanced for more robust parsing
    try {
      const lines = output.split('\n');
      const items: Omit<TripItem, 'id'>[] = [];
      
      let inList = false;
      for (const line of lines) {
        if (line.includes('🛒 Grocery List')) {
          inList = true;
          continue;
        }
        
        if (inList && line.trim().startsWith('-')) {
          const itemText = line.trim().substring(1).trim();
          const quantityMatch = itemText.match(/\(([^)]+)\)$/);
          
          let name = itemText;
          let quantity = 1;
          let unit = '';
          
          if (quantityMatch) {
            name = itemText.substring(0, itemText.lastIndexOf('(')).trim();
            const quantityString = quantityMatch[1];
            
            // Try to extract number and unit
            const numericMatch = quantityString.match(/^(\d+(?:\.\d+)?)/);
            if (numericMatch) {
              quantity = parseFloat(numericMatch[1]);
              unit = quantityString.substring(numericMatch[0].length).trim();
            } else {
              // If no number, use the whole string as unit
              unit = quantityString;
            }
          }
          
          items.push({
            name,
            quantity,
            unit,
            price: 0,
            checked: false,
            category: 'uncategorized',
            addedBy: {
              name: "You",
              avatar: "https://example.com/you.jpg"
            }
          });
        }
      }
      
      return items;
    } catch (error) {
      console.error("Error parsing output:", error);
      return [];
    }
  };

  const handleProcessList = () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please paste the AI-generated grocery list",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    
    // Parse the pasted list
    const items = parseOutput(input);
    
    setTimeout(() => {
      setParsedItems(items);
      setProcessing(false);
      setStep('output');
      
      if (items.length === 0) {
        toast({
          title: "Parsing failed",
          description: "Could not identify any items in the format. Please make sure it follows the proper format.",
          variant: "destructive"
        });
      }
    }, 1000);
  };

  const handleAddToTrip = () => {
    if (parsedItems.length === 0) {
      toast({
        title: "No items",
        description: "No items to add to your trip",
        variant: "destructive"
      });
      return;
    }
    
    onAddItems(parsedItems);
    toast({
      title: "Items added",
      description: `${parsedItems.length} items added to your trip`,
    });
    
    // Reset and close
    setInput("");
    setParsedItems([]);
    setStep('input');
    onClose();
  };

  const resetToInput = () => {
    setStep('input');
    setInput("");
    setParsedItems([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Smart List Parser
          </DialogTitle>
          <DialogDescription>
            Turn unstructured text into an organized grocery list using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4 space-y-4">
          {step === 'input' && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                  Step 1: Copy this prompt to ChatGPT
                </Label>
                <div className="relative bg-gray-100 dark:bg-gray-800 rounded-md p-3 mt-1 text-sm text-gray-700 dark:text-gray-300">
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleCopyPrompt} 
                      className="h-6 w-6"
                    >
                      {promptCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="pr-6 max-h-32 overflow-y-auto font-mono">
                    <pre className="whitespace-pre-wrap">
                      {taskaPrompt}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="output" className="flex items-center">
                  <Clipboard className="h-4 w-4 mr-2 text-blue-500" />
                  Step 2: Paste AI-generated grocery list here
                </Label>
                <Textarea
                  id="output"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your AI-generated grocery list here..."
                  className="min-h-[150px]"
                />
              </div>
              
              <Alert className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-900">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Use ChatGPT to convert recipes, meal plans, or any food-related text into a structured grocery list, then paste it here.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessList}
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Process List
                </Button>
              </div>
            </>
          )}
          
          {step === 'output' && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2 text-blue-500" />
                    Parsed Items ({parsedItems.length})
                  </Label>
                  <Badge variant="outline" className="font-normal">
                    {parsedItems.length} items
                  </Badge>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 max-h-[300px] overflow-y-auto">
                  {parsedItems.length > 0 ? (
                    <ul className="space-y-2">
                      {parsedItems.map((item, index) => (
                        <motion.li 
                          key={index} 
                          className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <span>{item.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {item.quantity} {item.unit}
                          </Badge>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No items could be parsed from the input
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={resetToInput}
                >
                  Back
                </Button>
                <Button
                  onClick={handleAddToTrip}
                  disabled={parsedItems.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Trip
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartListParser; 