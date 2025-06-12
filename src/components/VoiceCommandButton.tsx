import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Add TypeScript declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type VoiceCommandButtonProps = {
  onTaskCommand: (title: string, dueDate?: string) => void;
  onTripCommand: (store: string, eta?: string) => void;
};

const VoiceCommandButton = ({ onTaskCommand, onTripCommand }: VoiceCommandButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptValue = result[0].transcript;
          setTranscript(transcriptValue);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            processCommand(transcript);
          }
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast({
            title: "Voice recognition error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
        };
      }
    } else {
      toast({
        title: "Voice commands not supported",
        description: "Your browser doesn't support voice commands. Try using Chrome or Edge.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast, isListening, transcript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      // Processing will happen in the onend callback
    } else {
      setTranscript("");
      setShowHint(true);
      recognitionRef.current.start();
      setIsListening(true);
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const processCommand = (text: string) => {
    if (!text) return;
    
    setIsProcessing(true);
    
    // Convert to lowercase for easier matching
    const lowerText = text.toLowerCase();
    
    // Task command patterns
    // Examples: "add task buy milk", "create task finish report by tomorrow"
    const taskPatterns = [
      /add task (.*)/i,
      /create task (.*)/i,
      /new task (.*)/i,
      /task (.*)/i
    ];
    
    // Trip command patterns
    // Examples: "add trip to walmart", "go to target for 30 minutes"
    const tripPatterns = [
      /add trip to (.*)/i,
      /create trip to (.*)/i,
      /go to (.*)/i,
      /trip to (.*)/i
    ];
    
    // Check for task commands
    for (const pattern of taskPatterns) {
      const match = lowerText.match(pattern);
      if (match && match[1]) {
        const taskDetails = match[1];
        
        // Check for due date in the task details
        const dueDatePatterns = [
          /by (tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
          /due (tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
          /on (tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
        ];
        
        let dueDate = undefined;
        let title = taskDetails;
        
        for (const datePattern of dueDatePatterns) {
          const dateMatch = taskDetails.match(datePattern);
          if (dateMatch && dateMatch[1]) {
            dueDate = convertToDueDate(dateMatch[1]);
            // Remove the date part from the title
            title = taskDetails.replace(dateMatch[0], '').trim();
            break;
          }
        }
        
        // Execute the task command
        onTaskCommand(title, dueDate);
        
        toast({
          title: "Task created",
          description: `Created task: "${title}"${dueDate ? ` due ${dueDate}` : ''}`,
        });
        
        setIsProcessing(false);
        return;
      }
    }
    
    // Check for trip commands
    for (const pattern of tripPatterns) {
      const match = lowerText.match(pattern);
      if (match && match[1]) {
        const tripDetails = match[1];
        
        // Check for ETA in the trip details
        const etaPatterns = [
          /for (\d+) minutes/i,
          /for (\d+) mins/i,
          /(\d+) minutes/i,
          /(\d+) mins/i
        ];
        
        let eta = "15"; // Default ETA
        let store = tripDetails;
        
        for (const etaPattern of etaPatterns) {
          const etaMatch = tripDetails.match(etaPattern);
          if (etaMatch && etaMatch[1]) {
            eta = etaMatch[1];
            // Remove the ETA part from the store name
            store = tripDetails.replace(etaMatch[0], '').trim();
            break;
          }
        }
        
        // Execute the trip command
        onTripCommand(store, eta);
        
        toast({
          title: "Trip created",
          description: `Created trip to ${store} for ${eta} minutes`,
        });
        
        setIsProcessing(false);
        return;
      }
    }
    
    // If no command matched
    toast({
      title: "Command not recognized",
      description: "Try saying 'add task [task name]' or 'trip to [store name]'",
      variant: "destructive",
    });
    
    setIsProcessing(false);
  };

  // Helper function to convert spoken date to actual date
  const convertToDueDate = (spokenDate: string): string => {
    const today = new Date();
    let dueDate = new Date();
    
    spokenDate = spokenDate.toLowerCase();
    
    if (spokenDate === 'tomorrow') {
      dueDate.setDate(today.getDate() + 1);
    } else if (spokenDate === 'today') {
      // dueDate is already today
    } else {
      // Handle day names (monday, tuesday, etc.)
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = days.indexOf(spokenDate);
      
      if (dayIndex !== -1) {
        const currentDay = today.getDay();
        let daysToAdd = dayIndex - currentDay;
        
        // If the day has already passed this week, go to next week
        if (daysToAdd <= 0) {
          daysToAdd += 7;
        }
        
        dueDate.setDate(today.getDate() + daysToAdd);
      }
    }
    
    // Format as YYYY-MM-DD
    return dueDate.toISOString().split('T')[0];
  };

  return (
    <div className="fixed bottom-24 right-20 z-40">
      <AnimatePresence>
        {showHint && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-16 right-0 bg-white dark:bg-gloop-dark-surface p-3 rounded-lg shadow-md premium-card min-w-[200px] max-w-[300px] mb-2"
          >
            <p className="text-sm font-medium">I heard:</p>
            <p className="text-sm text-gloop-text-muted dark:text-gloop-dark-text-muted">{transcript || "Listening..."}</p>
            <div className="text-xs mt-2 text-gloop-primary">
              Try saying: "add task buy milk" or "trip to walmart"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
          isListening 
            ? "bg-red-500 text-white" 
            : "bg-gloop-accent dark:bg-gloop-dark-accent text-gloop-primary"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        disabled={isProcessing}
        aria-label={isProcessing ? "Processing voice command" : isListening ? "Stop listening" : "Start voice command"}
        aria-live="polite"
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
        
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500 opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default VoiceCommandButton;
