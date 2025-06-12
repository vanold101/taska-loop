import { useState, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Ruler, ChevronDown } from "lucide-react";
import {
  UnitDefinition,
  UnitType,
  units,
  unitsMap,
  getUnitsByType,
  getUnitsForItem,
  guessUnitForItem,
  convertUnit,
  formatValueWithUnit,
} from "@/services/UnitConversionService";

// Simple version for new modal implementation
interface SimpleUnitSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Extended version for backwards compatibility
interface DetailedUnitSelectorProps {
  itemName: string;
  quantity: number;
  unit?: string;
  onQuantityChange: (quantity: number) => void;
  onUnitChange: (unit: string) => void;
  className?: string;
  showConversion?: boolean;
  compact?: boolean;
}

type UnitSelectorProps = SimpleUnitSelectorProps | DetailedUnitSelectorProps;

// Type guard to check which prop interface is being used
function isSimpleProps(props: UnitSelectorProps): props is SimpleUnitSelectorProps {
  return 'value' in props && 'onChange' in props;
}

const UnitSelector = (props: UnitSelectorProps) => {
  // Handle the simple props case (used in new implementation)
  if (isSimpleProps(props)) {
    const { value, onChange, className = "" } = props;
    
    return (
      <div className={className}>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name} ({unit.abbreviation})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  // Original implementation for backwards compatibility
  const {
    itemName,
    quantity,
    unit,
    onQuantityChange,
    onUnitChange,
    className = "",
    showConversion = false,
    compact = false,
  } = props;
  
  // Get the current unit definition, or guess one based on item name
  const [currentUnit, setCurrentUnit] = useState<UnitDefinition>(
    unit ? unitsMap[unit] : guessUnitForItem(itemName)
  );
  
  const [availableUnits, setAvailableUnits] = useState<UnitDefinition[]>([]);
  const [activeType, setActiveType] = useState<UnitType>(currentUnit?.type || 'quantity');
  
  // Update available units when item name changes
  useEffect(() => {
    const suggestedUnits = getUnitsForItem(itemName);
    
    // If there are suggested units, set them
    if (suggestedUnits.length > 0) {
      setAvailableUnits(suggestedUnits);
      
      // If current unit is not among suggested units, update it
      if (!unit && !suggestedUnits.some(u => u.id === currentUnit?.id)) {
        const newUnit = guessUnitForItem(itemName);
        setCurrentUnit(newUnit);
        setActiveType(newUnit.type);
        onUnitChange(newUnit.id);
      }
    } else {
      // Default to quantity units if no suggestions
      setAvailableUnits(getUnitsByType('quantity'));
    }
  }, [itemName]);
  
  // Update current unit when unit prop changes
  useEffect(() => {
    if (unit && unitsMap[unit]) {
      setCurrentUnit(unitsMap[unit]);
      setActiveType(unitsMap[unit].type);
    }
  }, [unit]);
  
  // Handle unit type selection
  const handleTypeSelect = (type: UnitType) => {
    setActiveType(type);
    const typeUnits = getUnitsByType(type);
    setAvailableUnits(typeUnits);
    
    // Select first unit of this type if available
    if (typeUnits.length > 0) {
      const newUnit = typeUnits[0];
      setCurrentUnit(newUnit);
      onUnitChange(newUnit.id);
    }
  };
  
  // Handle unit selection
  const handleUnitSelect = (unitId: string) => {
    if (!unitId || !unitsMap[unitId]) return;
    
    const newUnit = unitsMap[unitId];
    setCurrentUnit(newUnit);
    onUnitChange(unitId);
    
    // If converting between compatible units, recalculate quantity
    if (currentUnit && newUnit.type === currentUnit.type && showConversion) {
      const convertedQuantity = convertUnit(quantity, currentUnit.id, newUnit.id);
      if (convertedQuantity !== null) {
        onQuantityChange(Math.round(convertedQuantity * 100) / 100); // Round to 2 decimal places
      }
    }
  };
  
  // Unit type options
  const unitTypes: { type: UnitType; label: string }[] = [
    { type: 'quantity', label: 'Qty' },
    { type: 'weight', label: 'Weight' },
    { type: 'volume', label: 'Volume' },
    { type: 'package', label: 'Package' },
  ];
  
  // Compact mode renders just the unit selector without the quantity input
  if (compact) {
    return (
      <div className={className}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-2 flex items-center justify-between rounded-l-none border-l-0"
              aria-label={`Current unit: ${currentUnit?.abbreviation || 'each'}`}
              aria-haspopup="true"
            >
              <span>{currentUnit?.abbreviation || 'ea'}</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-2">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="unit-type" className="text-xs pl-1">
                Measurement Type
              </Label>
              <div className="grid grid-cols-4 gap-1">
                {unitTypes.map((option) => (
                  <Button
                    key={option.type}
                    variant={activeType === option.type ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleTypeSelect(option.type)}
                    aria-label={`Select ${option.label} measurement type`}
                    aria-pressed={activeType === option.type}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              
              <Label htmlFor="unit" className="text-xs mt-2 pl-1">
                Unit
              </Label>
              <div className="grid grid-cols-3 gap-1">
                {availableUnits
                  .filter((unit) => unit.type === activeType)
                  .map((unit) => (
                    <Button
                      key={unit.id}
                      variant={currentUnit?.id === unit.id ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleUnitSelect(unit.id)}
                      aria-label={`Select ${unit.name} (${unit.abbreviation})`}
                      aria-pressed={currentUnit?.id === unit.id}
                    >
                      {unit.abbreviation}
                    </Button>
                  ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
  
  // Standard mode with quantity input
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 flex items-center justify-between"
          >
            <span className="mr-1">{currentUnit?.abbreviation || 'ea'}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-2">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="unit-type" className="text-xs pl-1">
              Measurement Type
            </Label>
            <div className="grid grid-cols-4 gap-1">
              {unitTypes.map((option) => (
                <Button
                  key={option.type}
                  variant={activeType === option.type ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => handleTypeSelect(option.type)}
                  aria-label={`Select ${option.label} measurement type`}
                  aria-pressed={activeType === option.type}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            
            <Label htmlFor="unit" className="text-xs mt-2 pl-1">
              Unit
            </Label>
            <div className="grid grid-cols-3 gap-1">
              {availableUnits
                .filter((unit) => unit.type === activeType)
                .map((unit) => (
                  <Button
                    key={unit.id}
                    variant={currentUnit?.id === unit.id ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleUnitSelect(unit.id)}
                    aria-label={`Select ${unit.name} (${unit.abbreviation})`}
                    aria-pressed={currentUnit?.id === unit.id}
                  >
                    {unit.abbreviation}
                  </Button>
                ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Input
        type="number"
        min="0.01"
        step="0.01"
        value={quantity}
        onChange={(e) => onQuantityChange(parseFloat(e.target.value) || 0)}
        className="h-9 w-20"
      />
    </div>
  );
};

export default UnitSelector; 