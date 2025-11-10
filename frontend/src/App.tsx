import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import SuperAdminRoute from './components/common/SuperAdminRoute';
import SuperAdminLayout from './components/common/SuperAdminLayout';
import { AuthProvider } from './contexts/AuthContext';
import { useDashboardData } from './hooks/useDashboardData';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Home pages
import NewHomePage from './pages/home/NewHomePage';

// Dashboard pages
import DashboardHome from './pages/dashboard/DashboardHome';

// Markets pages
import MarketsOverviewPage from './pages/markets/MarketsOverviewPage';
import SovereignYieldsPage from './pages/markets/SovereignYieldsPage';
import CorporateBondsPage from './pages/markets/CorporateBondsPage';
import FXMarketsPage from './pages/markets/FXMarketsPage';
import CentralBanksPage from './pages/markets/CentralBanksPage';
import CreditRatingsPage from './pages/markets/CreditRatingsPage';
import USAHistoricalYieldsPage from './pages/markets/USAHistoricalYieldsPage';
import InfraGapsOverviewPage from './pages/markets/InfraGapsPage';
import TransitFrictionPage from './pages/markets/TransitFrictionPage';
import InternetCoveragePage from './pages/markets/InternetCoveragePage';
// import ToolsPage from './pages/markets/ToolsPage'; // Disabled for cloud deployment

// Country Reports pages
import ArmeniaPage from './pages/markets/ArmeniaPage';
import MongoliaPage from './pages/markets/MongoliaPage';
import TurkiyePage from './pages/markets/TurkiyePage';
import UzbekistanPage from './pages/markets/UzbekistanPage';
import VietnamPage from './pages/markets/VietnamPage';

// Company pages
import TheFirmPage from './pages/company/TheFirmPage';
import ThisWebsitePage from './pages/company/ThisWebsitePage';
import MeridianPage from './pages/company/MeridianPage';

// Investment Strategies
import InvestmentStrategiesPage from './pages/deals/InvestmentStrategiesPage';

// CRM All module pages
import AllOverviewPage from './pages/crm/AllOverviewPage';
import AllOrganizationsPage from './pages/crm/AllOrganizationsPage';
import AllContactsPage from './pages/crm/AllContactsPage';
import AllTableViewPage from './pages/crm/AllTableViewPage';
import AllMeetingHistoryPage from './pages/crm/AllMeetingNotesPage';

// Capital Partners module pages
import OverviewPage from './pages/capital-partners/OverviewPage';
import CapitalPartnersList from './pages/capital-partners/CapitalPartnersList';
import CapitalPartnersTableView from './pages/capital-partners/CapitalPartnersTableView';
import CapitalPartnerDetail from './pages/capital-partners/CapitalPartnerDetail';
import ContactsList from './pages/capital-partners/ContactsList';
import ContactDetail from './pages/capital-partners/ContactDetail';
import ContactEdit from './pages/capital-partners/ContactEdit';
import MeetingNotesNew from './pages/capital-partners/MeetingNotesNew';
import CalendarPage from './pages/capital-partners/CalendarPage';

// Sponsors module pages
import SponsorsOverview from './pages/sponsors/SponsorsOverview';
import CorporatesList from './pages/sponsors/CorporatesList';
import CorporatesTableView from './pages/sponsors/CorporatesTableView';
import CorporateDetail from './pages/sponsors/CorporateDetail';
import SponsorContactsList from './pages/sponsors/SponsorContactsList';
import SponsorContactDetail from './pages/sponsors/SponsorContactDetail';
import SponsorMeetingNotes from './pages/sponsors/SponsorMeetingNotes';

// Counsel module pages
import CounselOverview from './pages/counsel/CounselOverview';
import LegalAdvisorsList from './pages/counsel/LegalAdvisorsList';
import LegalAdvisorsTableView from './pages/counsel/LegalAdvisorsTableView';
import LegalAdvisorDetail from './pages/counsel/LegalAdvisorDetail';
import CounselContactsList from './pages/counsel/CounselContactsList';
import CounselContactDetail from './pages/counsel/CounselContactDetail';
import CounselMeetingNotesNew from './pages/counsel/CounselMeetingNotesNew';

// Agents module pages
import AgentsOverview from './pages/agents/AgentsOverview';
import AgentsList from './pages/agents/AgentsList';
import AgentDetail from './pages/agents/AgentDetail';
import AgentsTableView from './pages/agents/AgentsTableView';
import AgentContactsList from './pages/agents/AgentContactsList';
import AgentContactDetail from './pages/agents/AgentContactDetail';
import AgentMeetingNotes from './pages/agents/AgentMeetingNotes';

// Deals module pages
import DealsList from './pages/deals/DealsList';
import DealDetail from './pages/deals/DealDetail';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import SuperAdminHome from './pages/admin/SuperAdminHome';
import SuperAdminSettings from './pages/admin/SuperAdminSettings';
import MyNotes from './pages/admin/MyNotes';
import PlaybookManager from './pages/admin/PlaybookManager';
import CountriesMasterManager from './pages/admin/CountriesMasterManager';

// Account pages
import ProfilePage from './pages/account/ProfilePage';

// Whiteboard pages
import WhiteboardOverviewPage from './pages/whiteboard/WhiteboardOverviewPage';
import WeeklyWhiteboardPage from './pages/whiteboard/WeeklyWhiteboardPage';
import GeneralPostsPage from './pages/whiteboard/GeneralPostsPage';

const App: React.FC = () => {
  const { data, loading, error, lastUpdated } = useDashboardData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Super Admin Portal - separate layout */}
          <Route path="/admin/super" element={
            <ProtectedRoute>
              <SuperAdminRoute>
                <SuperAdminLayout />
              </SuperAdminRoute>
            </ProtectedRoute>
          }>
            <Route index element={<SuperAdminHome />} />
            <Route path="notes" element={<MyNotes />} />
            <Route path="playbook" element={<PlaybookManager />} />
            <Route path="countries" element={<CountriesMasterManager />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>

          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout lastUpdated={lastUpdated}>
                <Routes>
                  <Route path="/" element={<NewHomePage data={data} />} />

                  {/* Whiteboard routes */}
                  <Route path="/whiteboard" element={<WhiteboardOverviewPage />} />
                  <Route path="/whiteboard/weekly" element={<WeeklyWhiteboardPage />} />
                  <Route path="/whiteboard/general" element={<GeneralPostsPage />} />

                  {/* Dashboard routes */}
                  <Route path="/dashboard" element={<DashboardHome data={data} />} />

                  {/* Market Intelligence routes */}
                  <Route path="/dashboard/markets" element={<MarketsOverviewPage data={data} />} />
                  <Route path="/dashboard/sovereign" element={<SovereignYieldsPage data={data.sections.sovereign_yields} />} />
                  <Route path="/dashboard/corporate" element={<CorporateBondsPage data={data.sections.corporate_yields} />} />
                  <Route path="/dashboard/fx" element={<FXMarketsPage />} />
                  <Route path="/dashboard/central-banks" element={<CentralBanksPage data={data.sections.central_bank_rates} />} />
                  <Route path="/dashboard/ratings" element={<CreditRatingsPage data={data.sections.credit_ratings} />} />
                  <Route path="/dashboard/usa-historical-yields" element={<USAHistoricalYieldsPage />} />
                  {/* Tools page disabled for cloud deployment - Excel COM not available */}
                  {/* <Route path="/dashboard/tools" element={<ToolsPage />} /> */}

                  {/* Country Reports routes */}
                  <Route path="/dashboard/armenia" element={<ArmeniaPage />} />
                  <Route path="/dashboard/mongolia" element={<MongoliaPage />} />
                  <Route path="/dashboard/turkiye" element={<TurkiyePage />} />
                  <Route path="/dashboard/uzbekistan" element={<UzbekistanPage />} />
                  <Route path="/dashboard/vietnam" element={<VietnamPage />} />

                  {/* Infrastructure routes */}
                  <Route path="/dashboard/infra-gaps" element={<InfraGapsOverviewPage />} />
                  <Route path="/dashboard/transit-friction" element={<TransitFrictionPage />} />
                  <Route path="/dashboard/internet-coverage" element={<InternetCoveragePage />} />
                  <Route path="/the-firm" element={<TheFirmPage />} />
                  <Route path="/this-website" element={<ThisWebsitePage />} />
                  <Route path="/meridian" element={<MeridianPage />} />

                  {/* CRM All module routes */}
                  <Route path="/crm/all" element={<AllOverviewPage />} />
                  <Route path="/crm/all/organizations" element={<AllOrganizationsPage />} />
                  <Route path="/crm/all/contacts" element={<AllContactsPage />} />
                  <Route path="/crm/all/table" element={<AllTableViewPage />} />
                  <Route path="/crm/all/meeting-notes" element={<AllMeetingHistoryPage />} />

                  <Route path="/liquidity" element={<OverviewPage />} />

                  {/* Capital Partners module routes */}
                  <Route path="/liquidity/capital-partners" element={<CapitalPartnersList />} />
                  <Route path="/liquidity/capital-partners-table" element={<CapitalPartnersTableView />} />
                  <Route path="/liquidity/capital-partners/:id" element={<CapitalPartnerDetail />} />
                  <Route path="/liquidity/contacts" element={<ContactsList />} />
                  <Route path="/liquidity/contacts/new" element={<ContactEdit />} />
                  <Route path="/liquidity/contacts/:id/edit" element={<ContactEdit />} />
                  <Route path="/liquidity/contacts/:id" element={<ContactDetail />} />
                  <Route path="/liquidity/meeting" element={<MeetingNotesNew />} />
                  <Route path="/liquidity/calendar" element={<CalendarPage />} />

                  {/* Sponsors module routes */}
                  <Route path="/sponsors" element={<SponsorsOverview />} />
                  <Route path="/sponsors/corporates" element={<CorporatesList />} />
                  <Route path="/sponsors/corporates-table" element={<CorporatesTableView />} />
                  <Route path="/sponsors/corporates/:id" element={<CorporateDetail />} />
                  <Route path="/sponsors/contacts" element={<SponsorContactsList />} />
                  <Route path="/sponsors/contacts/:id" element={<SponsorContactDetail />} />
                  <Route path="/sponsors/meeting-notes/:contactId" element={<SponsorMeetingNotes />} />
                  <Route path="/sponsors/meeting" element={<SponsorMeetingNotes />} />

                  {/* Counsel module routes */}
                  <Route path="/counsel" element={<CounselOverview />} />
                  <Route path="/counsel/legal-advisors" element={<LegalAdvisorsList />} />
                  <Route path="/counsel/legal-advisors-table" element={<LegalAdvisorsTableView />} />
                  <Route path="/counsel/legal-advisors/:id" element={<LegalAdvisorDetail />} />
                  <Route path="/counsel/contacts" element={<CounselContactsList />} />
                  <Route path="/counsel/contacts/:id" element={<CounselContactDetail />} />
                  <Route path="/counsel/meeting-notes/:contactId" element={<CounselMeetingNotesNew />} />
                  <Route path="/counsel/meeting" element={<CounselMeetingNotesNew />} />

                  {/* Agents module routes */}
                  <Route path="/agents" element={<AgentsOverview />} />
                  <Route path="/agents/list" element={<AgentsList />} />
                  <Route path="/agents/table" element={<AgentsTableView />} />
                  <Route path="/agents/:id" element={<AgentDetail />} />
                  <Route path="/agents/contacts" element={<AgentContactsList />} />
                  <Route path="/agents/contacts/:id" element={<AgentContactDetail />} />
                  <Route path="/agents/meeting-notes/:contactId" element={<AgentMeetingNotes />} />
                  <Route path="/agents/meeting" element={<AgentMeetingNotes />} />

                  {/* Deals module routes */}
                  <Route path="/deals" element={<DealsList />} />
                  <Route path="/deals/new" element={<DealDetail />} />
                  <Route path="/deals/:id" element={<DealDetail />} />
                  <Route path="/deals/:id/edit" element={<DealDetail />} />

                  {/* Investment Strategies */}
                  <Route path="/investment-strategies" element={<InvestmentStrategiesPage />} />

                  {/* Admin routes */}
                  <Route path="/admin/users" element={<UserManagement />} />

                  {/* Account routes */}
                  <Route path="/account" element={<ProfilePage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;