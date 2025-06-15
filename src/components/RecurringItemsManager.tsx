import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { useTaskContext } from '../context/TaskContext';
import { RecurringItemTemplate, recurringItemsService } from '../services/RecurringItemsService';
import { RecurrenceFrequency } from '../services/RecurrenceService';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  BarChart3, 
  Calendar,
  Store,
  DollarSign,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const RecurringItemsManager: React.FC = () => {
  const { 
    recurringTemplates, 
    addRecurringTemplate, 
    updateRecurringTemplate, 
    removeRecurringTemplate,
    processRecurringItemsNow 
  } = useTaskContext();
  
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RecurringItemTemplate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state for creating/editing templates
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'ea',
    price: '',
    category: '',
    notes: '',
    recurrenceFrequency: 'weekly' as RecurrenceFrequency,
    preferredStores: [] as string[]
  });

  const units = [
    { value: 'ea', label: 'Each' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'g', label: 'Grams' },
    { value: 'lb', label: 'Pounds' },
    { value: 'oz', label: 'Ounces' },
    { value: 'l', label: 'Liters' },
    { value: 'ml', label: 'Milliliters' },
    { value: 'pkg', label: 'Package' },
    { value: 'box', label: 'Box' },
    { value: 'can', label: 'Can' },
    { value: 'bottle', label: 'Bottle' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const commonStores = [
    "Trader Joe's",
    "Whole Foods",
    "Costco",
    "Kroger",
    "Target",
    "Walmart",
    "Safeway",
    "Publix"
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 1,
      unit: 'ea',
      price: '',
      category: '',
      notes: '',
      recurrenceFrequency: 'weekly',
      preferredStores: []
    });
  };

  const handleCreateTemplate = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the recurring item.",
        variant: "destructive"
      });
      return;
    }

    const template: Omit<RecurringItemTemplate, 'id'> = {
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      price: formData.price ? parseFloat(formData.price) : undefined,
      category: formData.category || undefined,
      notes: formData.notes || undefined,
      checked: false,
      isRecurringTemplate: true,
      isRecurring: true,
      recurrenceFrequency: formData.recurrenceFrequency,
      nextDueDate: new Date().toISOString(),
      preferredStores: formData.preferredStores.length > 0 ? formData.preferredStores : undefined,
      addedBy: {
        name: "You",
        avatar: "https://example.com/you.jpg"
      }
    };

    addRecurringTemplate(template);
    resetForm();
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Recurring Item Created",
      description: `${template.name} will be added to your shopping lists ${template.recurrenceFrequency}.`
    });
  };

  const handleEditTemplate = (template: RecurringItemTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      quantity: template.quantity,
      unit: template.unit || 'ea',
      price: template.price?.toString() || '',
      category: template.category || '',
      notes: template.notes || '',
      recurrenceFrequency: template.recurrenceFrequency,
      preferredStores: template.preferredStores || []
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    const updates: Partial<RecurringItemTemplate> = {
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      price: formData.price ? parseFloat(formData.price) : undefined,
      category: formData.category || undefined,
      notes: formData.notes || undefined,
      recurrenceFrequency: formData.recurrenceFrequency,
      preferredStores: formData.preferredStores.length > 0 ? formData.preferredStores : undefined,
    };

    updateRecurringTemplate(editingTemplate.id, updates);
    resetForm();
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
    
    toast({
      title: "Template Updated",
      description: "Your recurring item template has been updated."
    });
  };

  const handleDeleteTemplate = (templateId: string, itemName: string) => {
    removeRecurringTemplate(templateId);
    toast({
      title: "Template Deleted",
      description: `${itemName} recurring template has been removed.`
    });
  };

  const handleProcessNow = async () => {
    setIsProcessing(true);
    try {
      const stats = processRecurringItemsNow();
      
      if (stats.itemsProcessed > 0) {
        toast({
          title: "Recurring Items Processed",
          description: `Added ${stats.itemsProcessed} items to ${stats.tripsUpdated} existing trips and created ${stats.newTripsCreated} new trips.`
        });
      } else {
        toast({
          title: "No Items Due",
          description: "No recurring items are due to be added at this time."
        });
      }
      
      if (stats.errors.length > 0) {
        console.error('Processing errors:', stats.errors);
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "There was an error processing recurring items.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFrequencyBadgeColor = (frequency: RecurrenceFrequency) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'weekly': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'bi-weekly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'monthly': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const isDue = (template: RecurringItemTemplate) => {
    if (!template.nextDueDate) return false;
    const dueDate = parseISO(template.nextDueDate);
    const now = new Date();
    return dueDate <= now;
  };

  const dueTemplates = recurringTemplates.filter(isDue);
  const statistics = recurringItemsService.getStatistics();

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Recurring Items</h2>
          <p className="text-muted-foreground">Manage items that automatically get added to your shopping lists</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleProcessNow}
            disabled={isProcessing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Process Now
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Recurring Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Recurring Item</DialogTitle>
                <DialogDescription>
                  Add an item that will automatically be added to your shopping lists
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Milk, Bread, Bananas"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select 
                    value={formData.recurrenceFrequency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, recurrenceFrequency: value as RecurrenceFrequency }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="price">Estimated Price (optional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label>Preferred Stores (optional)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {commonStores.map(store => (
                      <div key={store} className="flex items-center space-x-2">
                        <Checkbox
                          id={store}
                          checked={formData.preferredStores.includes(store)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                preferredStores: [...prev.preferredStores, store] 
                              }));
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                preferredStores: prev.preferredStores.filter(s => s !== store) 
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={store} className="text-sm">{store}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{statistics.totalTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold">{statistics.dueToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Next Processing</p>
                <p className="text-sm font-medium">Tomorrow 8:00 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Est. Monthly</p>
                <p className="text-2xl font-bold">
                  ${recurringTemplates.reduce((sum, t) => sum + (t.price || 0), 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due Items Alert */}
      {dueTemplates.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                {dueTemplates.length} Item{dueTemplates.length > 1 ? 's' : ''} Due
              </h3>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
              The following recurring items are ready to be added to your shopping lists.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {dueTemplates.map(template => (
                <Badge key={template.id} variant="outline" className="text-orange-800 border-orange-300">
                  {template.name}
                </Badge>
              ))}
            </div>
            <Button 
              onClick={handleProcessNow} 
              disabled={isProcessing}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing ? 'Processing...' : 'Add to Shopping Lists'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recurring Items</CardTitle>
        </CardHeader>
        <CardContent>
          {recurringTemplates.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recurring Items</h3>
              <p className="text-muted-foreground mb-4">
                Create recurring items to automatically add them to your shopping lists
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringTemplates.map(template => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg ${isDue(template) ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge className={getFrequencyBadgeColor(template.recurrenceFrequency)}>
                          {template.recurrenceFrequency}
                        </Badge>
                        {isDue(template) && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Due
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{template.quantity} {template.unit}</span>
                        {template.price && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {template.price.toFixed(2)}
                          </span>
                        )}
                        {template.preferredStores && template.preferredStores.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {template.preferredStores.join(', ')}
                          </span>
                        )}
                      </div>
                      
                      {template.nextDueDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Next due: {format(parseISO(template.nextDueDate), 'PPP')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id, template.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Recurring Item</DialogTitle>
            <DialogDescription>
              Update your recurring item template
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Item Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-frequency">Frequency</Label>
              <Select 
                value={formData.recurrenceFrequency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, recurrenceFrequency: value as RecurrenceFrequency }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-price">Estimated Price</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate}>
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringItemsManager; 