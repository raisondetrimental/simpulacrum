import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardData } from '../../types/dashboard';
import { apiGet } from '../../services/api';
import { AnimatedStat } from '../../components/ui/AnimatedStat';
import MarketChartsSection from '../../components/home/MarketChartsSection';
import PipelineVisualization from '../../components/home/PipelineVisualization';
import CRMModuleCard from '../../components/home/CRMModuleCard';
import QuickActionsGrid from '../../components/home/QuickActionsGrid';
import MonthlyCalendarWidget from '../../components/home/MonthlyCalendarWidget';
import SharedNotesWidget from '../../components/home/SharedNotesWidget';
import WeeklyWhiteboardCard from '../../components/home/WeeklyWhiteboardCard';
import LatestPostsCard from '../../components/home/LatestPostsCard';
import { useAuth } from '../../contexts/AuthContext';

interface NewHomePageProps {
  data: DashboardData;
}

interface CRMStats {
  capitalPartnersCount: number;
  corporatesCount: number;
  legalAdvisorsCount: number;
  agentsCount: number;
  upcomingMeetingsCount: number;
  contactsCount: number;
  dealsCount: number;
  investmentStrategiesCount: number;
}

interface UpcomingMeeting {
  id: string;
  contactName: string;
  organizationName: string;
  date: string;
  module: 'liquidity' | 'sponsors' | 'counsel' | 'agents';
}

const NewHomePage: React.FC<NewHomePageProps> = ({ data }) => {
  const { user } = useAuth();
  const [crmStats, setCRMStats] = useState<CRMStats>({
    capitalPartnersCount: 0,
    corporatesCount: 0,
    legalAdvisorsCount: 0,
    agentsCount: 0,
    upcomingMeetingsCount: 0,
    contactsCount: 0,
    dealsCount: 0,
    investmentStrategiesCount: 0
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin or super admin
  const isAdmin = user?.role === 'admin' || user?.is_super_admin === true;

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      // Fetch all CRM data in parallel with credentials for authentication
      const [
        cpData,
        corpData,
        laData,
        agentsData,
        contactsData,
        sponsorContactsData,
        counselContactsData,
        agentContactsData,
        pipelineData,
        investmentStrategiesData
      ] = await Promise.all([
        apiGet('/api/capital-partners'),
        apiGet('/api/corporates'),
        apiGet('/api/legal-advisors'),
        apiGet('/api/agents'),
        apiGet('/api/contacts-new'),
        apiGet('/api/sponsor-contacts'),
        apiGet('/api/counsel-contacts'),
        apiGet('/api/agent-contacts'),
        apiGet('/api/pipeline'),
        apiGet('/api/investment-strategies')
      ]);

      const capitalPartnersCount = cpData.success ? cpData.data.length : 0;
      const corporatesCount = corpData.success ? corpData.data.length : 0;
      const legalAdvisorsCount = laData.success ? laData.data.length : 0;
      const agentsCount = agentsData.success ? agentsData.data.length : 0;
      const dealsCount = Array.isArray(pipelineData) ? pipelineData.length : 0;
      const investmentStrategiesCount = investmentStrategiesData.success
        ? investmentStrategiesData.data.length
        : 0;

      const liquidityContacts = contactsData.success ? contactsData.data : [];
      const sponsorContacts = sponsorContactsData.success ? sponsorContactsData.data : [];
      const counselContacts = counselContactsData.success ? counselContactsData.data : [];
      const agentContacts = agentContactsData.success ? agentContactsData.data : [];

      const totalContacts =
        liquidityContacts.length +
        sponsorContacts.length +
        counselContacts.length +
        agentContacts.length;

      // Get upcoming meetings from all four modules
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingFromLiquidity = liquidityContacts
        .filter((c: any) => {
          if (!c.next_contact_reminder) return false;
          const reminderDate = new Date(c.next_contact_reminder);
          return reminderDate >= today;
        })
        .map((c: any) => ({
          id: c.id,
          contactName: c.name,
          organizationName: c.team_name || 'Unknown',
          date: c.next_contact_reminder,
          module: 'liquidity' as const
        }));

      const upcomingFromSponsors = sponsorContacts
        .filter((c: any) => {
          if (!c.next_contact_reminder) return false;
          const reminderDate = new Date(c.next_contact_reminder);
          return reminderDate >= today;
        })
        .map((c: any) => ({
          id: c.id,
          contactName: c.name,
          organizationName: c.corporate_name || 'Unknown',
          date: c.next_contact_reminder,
          module: 'sponsors' as const
        }));

      const upcomingFromCounsel = counselContacts
        .filter((c: any) => {
          if (!c.next_contact_reminder) return false;
          const reminderDate = new Date(c.next_contact_reminder);
          return reminderDate >= today;
        })
        .map((c: any) => ({
          id: c.id,
          contactName: c.name,
          organizationName: c.legal_advisor_name || 'Unknown',
          date: c.next_contact_reminder,
          module: 'counsel' as const
        }));

      const upcomingFromAgents = agentContacts
        .filter((c: any) => {
          if (!c.next_contact_reminder) return false;
          const reminderDate = new Date(c.next_contact_reminder);
          return reminderDate >= today;
        })
        .map((c: any) => ({
          id: c.id,
          contactName: c.name,
          organizationName: c.agent_name || 'Unknown',
          date: c.next_contact_reminder,
          module: 'agents' as const
        }));

      const allUpcoming = [
        ...upcomingFromLiquidity,
        ...upcomingFromSponsors,
        ...upcomingFromCounsel,
        ...upcomingFromAgents
      ]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 8);

      setCRMStats({
        capitalPartnersCount,
        corporatesCount,
        legalAdvisorsCount,
        agentsCount,
        upcomingMeetingsCount: allUpcoming.length,
        contactsCount: totalContacts,
        dealsCount,
        investmentStrategiesCount
      });

      setUpcomingMeetings(allUpcoming);

      // Handle pipeline data - could be direct array or wrapped in object
      console.log('Pipeline data received:', pipelineData);
      const pipelines = Array.isArray(pipelineData)
        ? pipelineData
        : (pipelineData?.data || pipelineData?.pipelines || []);
      console.log('Pipelines to display:', pipelines);
      setDeals(pipelines);
    } catch (error) {
      console.error('Failed to fetch CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDateColor = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return 'text-red-600';
    if (daysUntil === 0) return 'text-orange-600';
    if (daysUntil <= 7) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="text-center py-8 px-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Meridian Universal Intelligence Platform
          </h1>
        </div>
      </div>

      {/* Announcements and Monthly Calendar Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SharedNotesWidget isAdmin={isAdmin} />
        <MonthlyCalendarWidget meetings={upcomingMeetings} loading={loading} />
      </div>

      {/* Quick Actions Command Center */}
      <QuickActionsGrid upcomingCount={crmStats.upcomingMeetingsCount} />

      {/* Interactive Market Charts */}
      <MarketChartsSection data={data} />

      {/* CRM Modules Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">CRM Platform Modules</h2>
          <Link to="/crm/all" className="text-sm font-medium text-slate-600 hover:text-slate-800">
            View All Organizations →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Liquidity Module */}
          <CRMModuleCard
            title="Liquidity"
            description="Capital partner relationship management"
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            color="green"
            organizationCount={crmStats.capitalPartnersCount}
            contactCount={crmStats.contactsCount > 0 ? Math.floor(crmStats.contactsCount * 0.35) : 0}
            subLinks={[
              { name: 'Overview', path: '/liquidity' },
              { name: 'Capital Partners', path: '/liquidity/capital-partners' },
              { name: 'Contacts', path: '/liquidity/contacts' },
              { name: 'Table View', path: '/liquidity/capital-partners-table' },
              { name: 'Calendar', path: '/liquidity/calendar' }
            ]}
          />

          {/* Sponsors Module */}
          <CRMModuleCard
            title="Sponsors"
            description="Corporate sponsor CRM"
            icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            color="purple"
            organizationCount={crmStats.corporatesCount}
            contactCount={crmStats.contactsCount > 0 ? Math.floor(crmStats.contactsCount * 0.35) : 0}
            subLinks={[
              { name: 'Overview', path: '/sponsors' },
              { name: 'Corporates', path: '/sponsors/corporates' },
              { name: 'Contacts', path: '/sponsors/contacts' },
              { name: 'Table View', path: '/sponsors/corporates-table' }
            ]}
          />

          {/* Counsel Module */}
          <CRMModuleCard
            title="Counsel"
            description="Legal advisor tracking"
            icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
            color="violet"
            organizationCount={crmStats.legalAdvisorsCount}
            contactCount={crmStats.contactsCount > 0 ? Math.floor(crmStats.contactsCount * 0.20) : 0}
            subLinks={[
              { name: 'Overview', path: '/counsel' },
              { name: 'Legal Advisors', path: '/counsel/legal-advisors' },
              { name: 'Contacts', path: '/counsel/contacts' },
              { name: 'Table View', path: '/counsel/legal-advisors-table' }
            ]}
          />

          {/* Agents Module */}
          <CRMModuleCard
            title="Agents"
            description="Transaction agent network"
            icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            color="blue"
            organizationCount={crmStats.agentsCount}
            contactCount={crmStats.contactsCount > 0 ? Math.floor(crmStats.contactsCount * 0.10) : 0}
            subLinks={[
              { name: 'Overview', path: '/agents' },
              { name: 'Agents List', path: '/agents/agents' },
              { name: 'Contacts', path: '/agents/contacts' },
              { name: 'Table View', path: '/agents/agents-table' }
            ]}
          />
        </div>
      </div>

      {/* Weekly Whiteboard and Latest Posts Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyWhiteboardCard />
        <LatestPostsCard />
      </div>

      {/* Deal Pipeline Visualization */}
      <PipelineVisualization deals={deals} loading={loading} />

      {/* Footer Links */}
      <div className="text-center space-x-6 pb-8 pt-4 border-t border-gray-200">
        <Link
          to="/meridian"
          className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors"
        >
          About Meridian
        </Link>
        <span className="text-gray-300">•</span>
        <Link
          to="/the-firm"
          className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors"
        >
          Firm Philosophy
        </Link>
        <span className="text-gray-300">•</span>
        <Link
          to="/this-website"
          className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors"
        >
          Documentation
        </Link>
      </div>
    </div>
  );
};

export default NewHomePage;
