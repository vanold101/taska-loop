import React, { useState, useEffect } from 'react';
import { useAuth, ChorePreference } from '../context/AuthContext';
import { useTaskContext } from '../context/TaskContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import NavBar from '@/components/NavBar'; // Assuming a NavBar component exists for navigation

const SettingsPage = () => {
  const { user, updateChorePreferences, isLoading: authLoading } = useAuth();
  const { tasks } = useTaskContext(); // Removed isLoading: tasksLoading
  const { toast } = useToast();

  // Local state to manage preference changes before saving
  const [currentPreferences, setCurrentPreferences] = useState<ChorePreference[]>([]);

  useEffect(() => {
    if (user && user.chorePreferences) {
      setCurrentPreferences(user.chorePreferences);
    }
  }, [user]);

  // Get unique chore titles from tasks context
  const uniqueChores = React.useMemo(() => {
    if (!tasks) return []; // Handle tasks not being available yet
    const choreSet = new Set<string>();
    tasks.forEach(task => choreSet.add(task.title));
    return Array.from(choreSet).map(title => ({ id: title, name: title }));
  }, [tasks]);

  const handlePreferenceChange = (choreId: string, preference: ChorePreference['preference']) => {
    setCurrentPreferences(prev => {
      const existingPrefIndex = prev.findIndex(p => p.choreId === choreId);
      if (existingPrefIndex > -1) {
        const updatedPrefs = [...prev];
        updatedPrefs[existingPrefIndex] = { ...updatedPrefs[existingPrefIndex], preference };
        return updatedPrefs;
      }
      return [...prev, { choreId, preference }];
    });
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save preferences.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await updateChorePreferences(currentPreferences);
      toast({
        title: 'Preferences Saved',
        description: 'Your chore preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Could not save your chore preferences. Please try again.',
        variant: 'destructive',
      });
      console.error('Failed to save chore preferences:', error);
    }
  };

  if (authLoading) { // Rely on authLoading primarily
    return <div className="p-4">Loading settings...</div>;
  }

  const getPreferenceForChore = (choreId: string): ChorePreference['preference'] => {
    const pref = currentPreferences.find(p => p.choreId === choreId);
    return pref ? pref.preference : 'neutral'; // Default to neutral if no preference set
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-4 md:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Settings</CardTitle>
            <CardDescription>Manage your application settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Chore Preferences</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Let us know which chores you like or dislike. This can help with future chore assignments.
              </p>
              {uniqueChores.length === 0 && !authLoading && (
                <p className="text-sm text-muted-foreground">No chores available to set preferences for yet. Add some tasks first!</p>
              )}
              <div className="space-y-4">
                {uniqueChores.map(chore => (
                  <div key={chore.id} className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor={`pref-${chore.id}`} className="flex-grow pr-4">{chore.name}</Label>
                    <Select
                      value={getPreferenceForChore(chore.id)}
                      onValueChange={(value: ChorePreference['preference']) => handlePreferenceChange(chore.id, value)}
                    >
                      <SelectTrigger id={`pref-${chore.id}`} className="w-[150px]">
                        <SelectValue placeholder="Set preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liked">Liked</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="disliked">Disliked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              {uniqueChores.length > 0 && (
                <Button onClick={handleSaveChanges} className="mt-6" disabled={authLoading}>
                  {authLoading ? 'Saving...' : 'Save Chore Preferences'}
                </Button>
              )}
            </section>
            {/* Other settings sections can be added here */}
          </CardContent>
        </Card>
      </main>
      <NavBar />
    </div>
  );
};

export default SettingsPage; 