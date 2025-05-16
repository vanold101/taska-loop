import { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trip } from '@/context/TaskContext';
import { 
  exportTripToPDF, 
  exportTripToCSV,
  exportTripsHistoryToCSV 
} from '@/services/ExportService';
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  trip?: Trip;
  trips?: Trip[];
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  align?: 'start' | 'center' | 'end';
  includeHistory?: boolean;
}

const ExportButton = ({ 
  trip,
  trips = [],
  label = 'Export',
  variant = 'outline',
  size = 'default',
  className,
  align = 'end',
  includeHistory = false
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = () => {
    if (!trip) {
      toast({
        title: 'Export Error',
        description: 'No trip data available to export',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsExporting(true);
      exportTripToPDF(trip);
      toast({
        title: 'PDF Export Successful',
        description: 'Your shopping trip has been exported as a PDF file'
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'PDF Export Failed',
        description: 'There was an error exporting the PDF. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!trip) {
      toast({
        title: 'Export Error',
        description: 'No trip data available to export',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsExporting(true);
      exportTripToCSV(trip);
      toast({
        title: 'CSV Export Successful',
        description: 'Your shopping trip has been exported as a CSV file'
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: 'CSV Export Failed',
        description: 'There was an error exporting the CSV. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHistoryCSV = () => {
    if (trips.length === 0) {
      toast({
        title: 'Export Error',
        description: 'No trips history data available to export',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsExporting(true);
      exportTripsHistoryToCSV(trips);
      toast({
        title: 'History Export Successful',
        description: 'Your shopping history has been exported as a CSV file'
      });
    } catch (error) {
      console.error('History export error:', error);
      toast({
        title: 'History Export Failed',
        description: 'There was an error exporting the history. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={cn("flex items-center", className)}
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {label}
          <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        {trip && (
          <>
            <DropdownMenuItem onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              <span>Export as PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4 text-green-500" />
              <span>Export as CSV</span>
            </DropdownMenuItem>
          </>
        )}
        
        {includeHistory && trips.length > 0 && (
          <>
            {trip && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={handleExportHistoryCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4 text-purple-500" />
              <span>Export All History</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton; 