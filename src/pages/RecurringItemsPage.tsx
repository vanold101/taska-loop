import React from 'react';
import { AppLayout } from '../components/AppLayout';
import RecurringItemsManager from '../components/RecurringItemsManager';

export default function RecurringItemsPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <RecurringItemsManager />
      </div>
    </AppLayout>
  );
} 