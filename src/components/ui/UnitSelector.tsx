import React from 'react';
import { Button } from "@/components/ui/button";
import { TouchTargetButton } from "@/components/ui/TouchTargetButton";
import { ChevronDown } from "lucide-react";

interface Unit {
  id: string;
  abbreviation: string;
}

interface UnitType {
  type: string;
  label: string;
}

interface UnitSelectorProps {
  currentUnit?: Unit;
  activeType: string;
  option: UnitType;
  unit: Unit;
  handleTypeSelect: (type: string) => void;
  handleUnitSelect: (id: string) => void;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  currentUnit,
  activeType,
  option,
  unit,
  handleTypeSelect,
  handleUnitSelect,
}) => {
  return (
    <div className="flex items-center gap-1">
      <TouchTargetButton
        variant="outline"
        padding="compact"
        buttonClassName="h-10 px-2 flex items-center justify-between rounded-l-none border-l-0"
        aria-label={`Current unit: ${currentUnit?.abbreviation || 'each'}`}
      >
        <span>{currentUnit?.abbreviation || 'ea'}</span>
        <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />
      </TouchTargetButton>

      <TouchTargetButton
        key={option.type}
        variant={activeType === option.type ? "default" : "outline"}
        padding="compact"
        buttonClassName="h-8 text-xs"
        onClick={() => handleTypeSelect(option.type)}
        aria-label={`Select ${option.label} measurement type`}
      >
        {option.label}
      </TouchTargetButton>

      <TouchTargetButton
        key={unit.id}
        variant={currentUnit?.id === unit.id ? "default" : "outline"}
        padding="compact"
        buttonClassName="h-8 text-xs"
        onClick={() => handleUnitSelect(unit.id)}
        aria-label={`Select ${unit.abbreviation} unit`}
      >
        {unit.abbreviation}
      </TouchTargetButton>
    </div>
  );
}; 