import React, { useState, useEffect } from 'react';
import { useAuth, ChorePreference } from '../context/AuthContext';
import { useTutorial } from '../context/TutorialContext';
import { useTaskContext } from '../context/TaskContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AppLayout } from '@/components/AppLayout';
import { Play, Settings, Heart, HelpCircle } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateChorePreferences, isLoading: authLoading, isAdmin } = useAuth();
  const { startTutorial } = useTutorial();
  const { tasks } = useTaskContext();
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
    if (!tasks) return [];
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

  const handleRestartTutorial = () => {
    if (user) {
      localStorage.removeItem(`tutorial_completed_${user.id}`);
      startTutorial();
      toast({
        title: "Tutorial Started",
        description: "The welcome tutorial has been restarted.",
      });
    }
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div className="p-4">Loading settings...</div>
      </AppLayout>
    );
  }

  const getPreferenceForChore = (choreId: string): ChorePreference['preference'] => {
    const pref = currentPreferences.find(p => p.choreId === choreId);
    return pref ? pref.preference : 'neutral';
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Settings
            </h1>
            <p className="text-slate-500">Manage your application settings and preferences</p>
          </div>

          {/* Tutorial Section */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                Welcome Tutorial
              </CardTitle>
              <CardDescription>
                Take a tour of TaskaLoop's features with our interactive tutorial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-800">Restart Tutorial</h4>
                  <p className="text-sm text-slate-500">
                    See the welcome tutorial again to learn about all features
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleRestartTutorial}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Tutorial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chore Preferences */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Chore Preferences
              </CardTitle>
              <CardDescription>
                Let us know which chores you like or dislike. This can help with future chore assignments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uniqueChores.length === 0 && !authLoading && (
                <div className="text-center py-8 text-slate-500">
                  <p>No chores available to set preferences for yet.</p>
                  <p className="text-sm mt-1">Add some tasks first to set your preferences!</p>
                </div>
              )}
              
              {uniqueChores.map(chore => (
                <div key={chore.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <Label htmlFor={`pref-${chore.id}`} className="flex-grow pr-4 font-medium">
                    {chore.name}
                  </Label>
                  <Select
                    value={getPreferenceForChore(chore.id)}
                    onValueChange={(value: ChorePreference['preference']) => handlePreferenceChange(chore.id, value)}
                  >
                    <SelectTrigger id={`pref-${chore.id}`} className="w-[150px]">
                      <SelectValue placeholder="Set preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liked">😊 Liked</SelectItem>
                      <SelectItem value="neutral">😐 Neutral</SelectItem>
                      <SelectItem value="disliked">😕 Disliked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              
              {uniqueChores.length > 0 && (
                <div className="pt-4">
                  <Button 
                    onClick={handleSaveChanges} 
                    disabled={authLoading}
                    className="w-full sm:w-auto"
                  >
                    {authLoading ? 'Saving...' : 'Save Chore Preferences'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Settings Placeholder */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
              <CardDescription>
                More settings and preferences will be available here in future updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <p>More settings coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage; 