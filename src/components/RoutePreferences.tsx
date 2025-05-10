import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, PersonStanding, Train, Bike } from 'lucide-react';
import type { RoutePreferences as RoutePreferencesType } from '@/types/routing';

interface RoutePreferencesProps {
  preferences: RoutePreferencesType;
  onPreferencesChange: (preferences: RoutePreferencesType) => void;
}

const RoutePreferences: React.FC<RoutePreferencesProps> = ({
  preferences,
  onPreferencesChange
}) => {
  const handleChange = (key: keyof RoutePreferencesType, value: any) => {
    onPreferencesChange({
      ...preferences,
      [key]: value
    });
  };

  const transportModeIcons = {
    DRIVING: <Car className="h-4 w-4" />,
    WALKING: <PersonStanding className="h-4 w-4" />,
    TRANSIT: <Train className="h-4 w-4" />,
    BICYCLING: <Bike className="h-4 w-4" />
  };

  return (
    <div className="space-y-4 p-4 premium-card rounded-lg">
      <h3 className="font-semibold mb-3">Route Preferences</h3>
      
      <div className="space-y-4">
        {/* Transport Mode */}
        <div className="space-y-2">
          <Label>Transport Mode</Label>
          <Select
            value={preferences.transportMode || 'DRIVING'}
            onValueChange={(value) => handleChange('transportMode', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(transportModeIcons).map(([mode, icon]) => (
                <SelectItem key={mode} value={mode}>
                  <div className="flex items-center gap-2">
                    {icon}
                    <span>{mode.charAt(0) + mode.slice(1).toLowerCase()}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Route Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="avoid-highways">Avoid Highways</Label>
            <Switch
              id="avoid-highways"
              checked={preferences.avoidHighways}
              onCheckedChange={(checked) => handleChange('avoidHighways', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="avoid-tolls">Avoid Tolls</Label>
            <Switch
              id="avoid-tolls"
              checked={preferences.avoidTolls}
              onCheckedChange={(checked) => handleChange('avoidTolls', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="return-start">Return to Start</Label>
            <Switch
              id="return-start"
              checked={preferences.returnToStart}
              onCheckedChange={(checked) => handleChange('returnToStart', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="consider-traffic">Consider Traffic</Label>
            <Switch
              id="consider-traffic"
              checked={preferences.considerTraffic}
              onCheckedChange={(checked) => handleChange('considerTraffic', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePreferences; 