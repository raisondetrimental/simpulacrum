/**
 * Playbook Manager - Super Admin Only
 * Manages all six sheets from The Playbook Excel file
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaybookTab } from '../../types/playbook';
import PlaybookContactsTab from '../../components/features/admin/playbook/PlaybookContactsTab';
import PlaybookCalendarTab from '../../components/features/admin/playbook/PlaybookCalendarTab';
import PlaybookDealsTab from '../../components/features/admin/playbook/PlaybookDealsTab';
import PlaybookPeopleTab from '../../components/features/admin/playbook/PlaybookPeopleTab';
import PlaybookWorkstreamsTab from '../../components/features/admin/playbook/PlaybookWorkstreamsTab';

const PlaybookManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlaybookTab>('workstreams');
  const navigate = useNavigate();

  const tabs: { id: PlaybookTab; label: string; description: string }[] = [
    {
      id: 'workstreams',
      label: 'Workstreams',
      description: 'Mission goals and priorities tracking'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      description: 'Team calendar with task assignments and participant tracking'
    },
    {
      id: 'contacts',
      label: 'External Contacts',
      description: 'Manage external stakeholder contacts with follow-up tracking'
    },
    {
      id: 'deals',
      label: 'Deal Flow',
      description: 'Track deal pipeline with financial metrics (separate from main deals)'
    },
    {
      id: 'people',
      label: 'People/Team',
      description: 'Team directory with roles and DISC profiles'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          The Playbook
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 -mx-8">
        <div className="px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                title={tab.description}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {/* Tab Panels */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'workstreams' && <PlaybookWorkstreamsTab />}
          {activeTab === 'calendar' && <PlaybookCalendarTab />}
          {activeTab === 'contacts' && <PlaybookContactsTab />}
          {activeTab === 'deals' && <PlaybookDealsTab />}
          {activeTab === 'people' && <PlaybookPeopleTab />}
        </div>
      </div>
    </div>
  );
};

export default PlaybookManager;
