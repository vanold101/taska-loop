import { useState } from 'react';
import { 
  BarChart, 
  PieChart, 
  FileText, 
  Calendar, 
  ShoppingCart, 
  Wallet, 
  Check, 
  Download, 
  PlusCircle,
  Trash2,
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Define the report types and their options
const reportTypes = [
  { id: 'spending', name: 'Spending Report', icon: <Wallet className="h-5 w-5" /> },
  { id: 'trips', name: 'Shopping Trips', icon: <ShoppingCart className="h-5 w-5" /> },
  { id: 'chores', name: 'Chore Completion', icon: <Check className="h-5 w-5" /> },
  { id: 'payments', name: 'Payment History', icon: <Wallet className="h-5 w-5" /> }
];

const chartTypes = [
  { id: 'bar', name: 'Bar Chart', icon: <BarChart className="h-5 w-5" /> },
  { id: 'pie', name: 'Pie Chart', icon: <PieChart className="h-5 w-5" /> },
  { id: 'table', name: 'Data Table', icon: <FileText className="h-5 w-5" /> }
];

// Dimensions to group data by
const dimensions = [
  { id: 'date', name: 'Date' },
  { id: 'store', name: 'Store' },
  { id: 'category', name: 'Category' },
  { id: 'person', name: 'Person' }
];

// Sample report configurations
const sampleReports = [
  {
    id: 'monthly-spending',
    name: 'Monthly Spending',
    description: 'Track spending across months',
    type: 'spending',
    chartType: 'bar',
    dimension: 'date',
    dateRange: 'last6Months'
  },
  {
    id: 'category-breakdown',
    name: 'Category Breakdown',
    description: 'Spending by category',
    type: 'spending',
    chartType: 'pie',
    dimension: 'category',
    dateRange: 'thisMonth'
  },
  {
    id: 'store-comparison',
    name: 'Store Comparison',
    description: 'Compare spending across stores',
    type: 'trips',
    chartType: 'bar',
    dimension: 'store',
    dateRange: 'thisYear'
  }
];

// Date range options
const dateRanges = [
  { id: 'last7Days', name: 'Last 7 Days' },
  { id: 'thisMonth', name: 'This Month' },
  { id: 'last3Months', name: 'Last 3 Months' },
  { id: 'last6Months', name: 'Last 6 Months' },
  { id: 'thisYear', name: 'This Year' },
  { id: 'custom', name: 'Custom Range' }
];

type ReportConfig = {
  id: string;
  name: string;
  description?: string;
  type: string;
  chartType: string;
  dimension: string;
  dateRange: string;
  customStartDate?: Date;
  customEndDate?: Date;
  filters?: Record<string, any>;
  isTemplate?: boolean;
};

interface CustomReportBuilderProps {
  className?: string;
}

const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({ className }) => {
  const [activeReport, setActiveReport] = useState<ReportConfig | null>(null);
  const [isSavedReportsOpen, setIsSavedReportsOpen] = useState(false);
  const [savedReports, setSavedReports] = useState<ReportConfig[]>(sampleReports);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [newReport, setNewReport] = useState<ReportConfig>({
    id: '',
    name: '',
    description: '',
    type: 'spending',
    chartType: 'bar',
    dimension: 'date',
    dateRange: 'thisMonth'
  });
  
  const { toast } = useToast();
  
  // Helper to generate a preview image URL based on report config
  const getReportPreviewImage = (report: ReportConfig) => {
    // This would ideally generate a thumbnail image based on the report configuration
    // For now, we'll use placeholder images
    if (report.chartType === 'pie') {
      return "/assets/reports/pie-chart-preview.png";
    } else if (report.chartType === 'bar') {
      return "/assets/reports/bar-chart-preview.png";
    } else {
      return "/assets/reports/table-preview.png";
    }
  };
  
  // Function to create a new report
  const createNewReport = () => {
    // Generate a new ID for the report
    const newId = `report-${Date.now()}`;
    
    const reportToCreate = {
      ...newReport,
      id: newId
    };
    
    setSavedReports([...savedReports, reportToCreate]);
    setActiveReport(reportToCreate);
    setIsCreatingReport(false);
    
    toast({
      title: "Report Created",
      description: `${reportToCreate.name} has been added to your reports.`
    });
  };
  
  // Function to delete a report
  const deleteReport = (reportId: string) => {
    setSavedReports(savedReports.filter(report => report.id !== reportId));
    
    // If the deleted report was active, clear the active report
    if (activeReport?.id === reportId) {
      setActiveReport(null);
    }
    
    toast({
      title: "Report Deleted",
      description: "The report has been removed from your saved reports."
    });
  };
  
  // Function to run a report
  const runReport = (report: ReportConfig) => {
    setActiveReport(report);
    
    toast({
      title: "Report Generated",
      description: `${report.name} has been generated.`
    });
  };
  
  // Function to export a report as CSV
  const exportReportCSV = () => {
    if (!activeReport) return;
    
    toast({
      title: "Report Exported",
      description: "The report has been exported as CSV."
    });
  };
  
  // Function to export a report as PDF
  const exportReportPDF = () => {
    if (!activeReport) return;
    
    toast({
      title: "Report Exported",
      description: "The report has been exported as PDF."
    });
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Custom Reports</h2>
          <p className="text-muted-foreground">Create and run custom reports to analyze your household data.</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSavedReportsOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            My Reports
          </Button>
          
          <Button
            onClick={() => setIsCreatingReport(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>
      
      {!activeReport ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>No Active Report</CardTitle>
            <CardDescription>
              Create a new report or select one of your saved reports to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Your reports help you analyze and understand your household data.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsCreatingReport(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>{activeReport.name}</CardTitle>
                <CardDescription>{activeReport.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportReportCSV}
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportReportPDF}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-72 bg-muted rounded-md">
              <div className="text-center space-y-4">
                <span className="text-4xl">📊</span>
                <p className="text-lg font-medium">Report data will appear here</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  When connected to actual data sources, this area will show the report chart or table
                  based on the configuration.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {reportTypes.find(t => t.id === activeReport.type)?.name}
              </Badge>
              <Badge variant="outline">
                {chartTypes.find(t => t.id === activeReport.chartType)?.name}
              </Badge>
              <Badge variant="outline">
                By {dimensions.find(d => d.id === activeReport.dimension)?.name}
              </Badge>
              <Badge variant="outline">
                {dateRanges.find(d => d.id === activeReport.dateRange)?.name}
              </Badge>
            </div>
            <Button variant="ghost" onClick={() => setActiveReport(null)}>
              Close
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Dialog for selecting saved reports */}
      <Dialog open={isSavedReportsOpen} onOpenChange={setIsSavedReportsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>My Reports</DialogTitle>
            <DialogDescription>
              Select a report to run or create a new custom report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {savedReports.map((report) => (
              <Card 
                key={report.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  runReport(report);
                  setIsSavedReportsOpen(false);
                }}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">{report.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {report.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-24 bg-muted rounded-md mb-2 flex items-center justify-center">
                    {report.chartType === 'bar' ? (
                      <BarChart className="h-12 w-12 text-muted-foreground/50" />
                    ) : report.chartType === 'pie' ? (
                      <PieChart className="h-12 w-12 text-muted-foreground/50" />
                    ) : (
                      <FileText className="h-12 w-12 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {reportTypes.find(t => t.id === report.type)?.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {chartTypes.find(t => t.id === report.chartType)?.name}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-2 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReport(report.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* New Report Card */}
            <Card 
              className="cursor-pointer border-dashed hover:border-primary/50 transition-colors flex flex-col items-center justify-center"
              onClick={() => {
                setIsCreatingReport(true);
                setIsSavedReportsOpen(false);
              }}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">Create New Report</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for creating a new report */}
      <Dialog open={isCreatingReport} onOpenChange={setIsCreatingReport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Configure your custom report settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input 
                id="report-name" 
                placeholder="Enter a name for your report"
                value={newReport.name}
                onChange={(e) => setNewReport({...newReport, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="report-description">Description (Optional)</Label>
              <Input 
                id="report-description" 
                placeholder="Enter a description for your report"
                value={newReport.description}
                onChange={(e) => setNewReport({...newReport, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select 
                  value={newReport.type} 
                  onValueChange={(value) => setNewReport({...newReport, type: value})}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="chart-type">Chart Type</Label>
                <Select 
                  value={newReport.chartType} 
                  onValueChange={(value) => setNewReport({...newReport, chartType: value})}
                >
                  <SelectTrigger id="chart-type">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="dimension">Group By</Label>
                <Select 
                  value={newReport.dimension} 
                  onValueChange={(value) => setNewReport({...newReport, dimension: value})}
                >
                  <SelectTrigger id="dimension">
                    <SelectValue placeholder="Select dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    {dimensions.map((dim) => (
                      <SelectItem key={dim.id} value={dim.id}>
                        {dim.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="date-range">Date Range</Label>
                <Select 
                  value={newReport.dateRange} 
                  onValueChange={(value) => setNewReport({...newReport, dateRange: value})}
                >
                  <SelectTrigger id="date-range">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map((range) => (
                      <SelectItem key={range.id} value={range.id}>
                        {range.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {newReport.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreatingReport(false)}>
              Cancel
            </Button>
            <Button onClick={createNewReport} disabled={!newReport.name}>
              <Save className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomReportBuilder; 