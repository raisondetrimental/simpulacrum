/**
 * Pipeline Detail Page
 * Create/edit pipeline strategies with organization selection and financing structures
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type {
  CreatePipelineRequest,
  PipelineStage,
  CommitmentLevel,
  LenderRole,
  AdvisorType,
  FinancingScenario,
  FinancingType
} from '../../types/pipeline';
import { getPipeline, createPipeline, updatePipeline } from '../../services/pipelineService';
import { getCapitalPartners } from '../../services/capitalPartnersService';
import { getCorporates } from '../../services/sponsorsService';
import { getLegalAdvisors } from '../../services/counselService';
import { getAgents } from '../../services/agentsService';
import { ALL_COUNTRIES } from '../../constants/countries';
import RelatedDealsSection from '../../components/features/pipeline/RelatedDealsSection';

interface Organization {
  id: string;
  name: string;
  organization_type: string;
  country?: string;
}

const STAGES: { value: PipelineStage; label: string }[] = [
  { value: 'ideation', label: 'Ideation' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'structuring', label: 'Structuring' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'ready_to_close', label: 'Ready to Close' }
];

const COMMITMENT_LEVELS: { value: CommitmentLevel; label: string }[] = [
  { value: 'exploring', label: 'Exploring' },
  { value: 'interested', label: 'Interested' },
  { value: 'committed', label: 'Committed' },
  { value: 'signed', label: 'Signed' }
];

const LENDER_ROLES: { value: LenderRole; label: string }[] = [
  { value: 'lead_arranger', label: 'Lead Arranger' },
  { value: 'co_arranger', label: 'Co-Arranger' },
  { value: 'participant', label: 'Participant' }
];

const ADVISOR_TYPES: { value: AdvisorType; label: string }[] = [
  { value: 'legal', label: 'Legal' },
  { value: 'technical', label: 'Technical' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'financial', label: 'Financial' }
];

const FINANCING_TYPES: { value: FinancingType; label: string }[] = [
  { value: 'debt', label: 'Debt / Project Finance' },
  { value: 'equity', label: 'Equity' },
  { value: 'mezzanine', label: 'Mezzanine' },
  { value: 'hybrid', label: 'Hybrid' }
];

const DEAL_STRUCTURES = [
  'Senior Secured',
  'Senior Unsecured',
  'Subordinated',
  'Convertible',
  'Mezzanine',
  'PIK Toggle',
  'Other'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'Other'];

const PipelineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id && id !== 'new';

  // Form state
  const [name, setName] = useState('');
  const [leadInitial, setLeadInitial] = useState('');
  const [stage, setStage] = useState<PipelineStage>('ideation');
  const [targetCountry, setTargetCountry] = useState('');
  const [sector, setSector] = useState('');
  const [dealType, setDealType] = useState('');
  const [targetCloseDate, setTargetCloseDate] = useState('');

  // Organization state
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<string>('');
  const [sponsorCommitment, setSponsorCommitment] = useState<CommitmentLevel>('exploring');
  const [lenders, setLenders] = useState<Array<{
    organization_id: string;
    role: LenderRole;
    participation_percentage: number;
    commitment_level: CommitmentLevel;
  }>>([]);
  const [advisors, setAdvisors] = useState<Array<{
    organization_id: string;
    advisor_type: AdvisorType;
    commitment_level: CommitmentLevel;
  }>>([]);

  // Financing scenarios
  const [scenarios, setScenarios] = useState<FinancingScenario[]>([
    {
      name: 'Base Case',
      is_preferred: true,
      financing_type: 'debt',
      total_value: 0,
      currency: 'USD'
    }
  ]);

  // Related deals
  const [relatedDeals, setRelatedDeals] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
    if (isEditMode) {
      loadPipeline();
    }
  }, [id]);

  const loadOrganizations = async () => {
    try {
      const [capitalPartnersResp, corporatesResp, legalAdvisorsResp, agentsResp] = await Promise.all([
        getCapitalPartners(),
        getCorporates(),
        getLegalAdvisors(),
        getAgents()
      ]);

      const allOrgs: Organization[] = [
        ...(capitalPartnersResp.data || []).map((o: any) => ({ ...o, organization_type: 'capital_partner' })),
        ...(corporatesResp.data || []).map((o: any) => ({ ...o, organization_type: 'sponsor' })),
        ...(legalAdvisorsResp.data || []).map((o: any) => ({ ...o, organization_type: 'counsel' })),
        ...(agentsResp.data || []).map((o: any) => ({ ...o, organization_type: 'agent' }))
      ];

      setAllOrganizations(allOrgs);
    } catch (err) {
      console.error('Error loading organizations:', err);
    }
  };

  const loadPipeline = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getPipeline(id);

      setName(data.name);
      setLeadInitial(data.lead_initial);
      setStage(data.stage);
      setTargetCountry(data.target_country);
      setSector(data.sector);
      setDealType(data.deal_type);
      setTargetCloseDate(data.target_close_date);

      if (data.sponsor?.organization_id) {
        setSelectedSponsor(data.sponsor.organization_id);
        setSponsorCommitment(data.sponsor.commitment_level);
      }

      setLenders(data.lenders || []);
      setAdvisors(data.advisors || []);

      if (data.financing_scenarios && data.financing_scenarios.length > 0) {
        setScenarios(data.financing_scenarios);
      }

      setRelatedDeals(data.related_deals || []);
    } catch (err) {
      setError('Failed to load pipeline');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Pipeline name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const pipelineData: CreatePipelineRequest = {
        name: name.trim(),
        lead_initial: leadInitial,
        stage,
        target_country: targetCountry,
        sector,
        deal_type: dealType,
        target_close_date: targetCloseDate,
        sponsor: selectedSponsor ? {
          organization_id: selectedSponsor,
          commitment_level: sponsorCommitment
        } : undefined,
        lenders,
        advisors,
        financing_scenarios: scenarios,
        related_deals: relatedDeals
      };

      if (isEditMode) {
        await updatePipeline(id!, pipelineData);
      } else {
        await createPipeline(pipelineData);
      }

      navigate('/pipeline');
    } catch (err: any) {
      setError(err.message || 'Failed to save pipeline');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addLender = () => {
    setLenders([...lenders, {
      organization_id: '',
      role: 'participant',
      participation_percentage: 0,
      commitment_level: 'exploring'
    }]);
  };

  const removeLender = (index: number) => {
    setLenders(lenders.filter((_, i) => i !== index));
  };

  const updateLender = (index: number, field: string, value: any) => {
    const updated = [...lenders];
    updated[index] = { ...updated[index], [field]: value };
    setLenders(updated);
  };

  const addAdvisor = () => {
    setAdvisors([...advisors, {
      organization_id: '',
      advisor_type: 'legal',
      commitment_level: 'exploring'
    }]);
  };

  const removeAdvisor = (index: number) => {
    setAdvisors(advisors.filter((_, i) => i !== index));
  };

  const updateAdvisor = (index: number, field: string, value: any) => {
    const updated = [...advisors];
    updated[index] = { ...updated[index], [field]: value };
    setAdvisors(updated);
  };

  const addScenario = () => {
    setScenarios([...scenarios, {
      name: `Scenario ${scenarios.length + 1}`,
      is_preferred: false,
      financing_type: 'debt' as FinancingType,
      total_value: 0,
      currency: 'USD'
    }]);
  };

  const removeScenario = (index: number) => {
    if (scenarios.length === 1) {
      setError('At least one financing scenario is required');
      return;
    }
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  const updateScenario = (index: number, field: string, value: any) => {
    const updated = [...scenarios];
    updated[index] = { ...updated[index], [field]: value };
    setScenarios(updated);
  };

  const setPreferredScenario = (index: number) => {
    const updated = scenarios.map((s, i) => ({
      ...s,
      is_preferred: i === index
    }));
    setScenarios(updated);
  };

  // Related deals handlers
  const addRelatedDeal = (dealId: string) => {
    if (!relatedDeals.includes(dealId)) {
      setRelatedDeals([...relatedDeals, dealId]);
    }
  };

  const removeRelatedDeal = (dealId: string) => {
    setRelatedDeals(relatedDeals.filter(id => id !== dealId));
  };

  const getOrganizationsByType = (type: string) => {
    return allOrganizations.filter(o => o.organization_type === type);
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Pipeline Strategy' : 'New Pipeline Strategy'}
          </h1>
          <p className="text-gray-600 mt-1">
            Build and track deal opportunities from concept to execution
          </p>
        </div>
        <Link
          to="/pipeline"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Pipeline
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pipeline Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Armenia Solar Project Financing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Initial
              </label>
              <input
                type="text"
                value={leadInitial}
                onChange={(e) => setLeadInitial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Team member leading this opportunity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PipelineStage)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {STAGES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Country
              </label>
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a country...</option>
                {/* Priority countries first */}
                {ALL_COUNTRIES.filter(c => c.priority).map(country => (
                  <option key={country.id} value={country.name}>{country.name}</option>
                ))}
                <option disabled>────────────</option>
                {/* Other countries */}
                {ALL_COUNTRIES.filter(c => !c.priority).map(country => (
                  <option key={country.id} value={country.name}>{country.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Renewable Energy, Transport"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal Type
              </label>
              <input
                type="text"
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Project Finance, Corporate Loan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Close Date
              </label>
              <input
                type="date"
                value={targetCloseDate}
                onChange={(e) => setTargetCloseDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sponsor */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sponsor</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sponsor Organization
              </label>
              <select
                value={selectedSponsor}
                onChange={(e) => setSelectedSponsor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select sponsor...</option>
                {getOrganizationsByType('sponsor').map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commitment Level
              </label>
              <select
                value={sponsorCommitment}
                onChange={(e) => setSponsorCommitment(e.target.value as CommitmentLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedSponsor}
              >
                {COMMITMENT_LEVELS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lenders */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Lenders</h2>
            <button
              type="button"
              onClick={addLender}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Add Lender
            </button>
          </div>

          {lenders.length === 0 ? (
            <p className="text-gray-500 text-sm">No lenders added yet</p>
          ) : (
            <div className="space-y-4">
              {lenders.map((lender, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization
                      </label>
                      <select
                        value={lender.organization_id}
                        onChange={(e) => updateLender(index, 'organization_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select organization...</option>
                        {getOrganizationsByType('capital_partner').map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={lender.role}
                        onChange={(e) => updateLender(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {LENDER_ROLES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Participation %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={lender.participation_percentage}
                        onChange={(e) => updateLender(index, 'participation_percentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commitment
                      </label>
                      <select
                        value={lender.commitment_level}
                        onChange={(e) => updateLender(index, 'commitment_level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {COMMITMENT_LEVELS.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeLender(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Lender
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advisors */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Advisors</h2>
            <button
              type="button"
              onClick={addAdvisor}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Add Advisor
            </button>
          </div>

          {advisors.length === 0 ? (
            <p className="text-gray-500 text-sm">No advisors added yet</p>
          ) : (
            <div className="space-y-4">
              {advisors.map((advisor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization
                      </label>
                      <select
                        value={advisor.organization_id}
                        onChange={(e) => updateAdvisor(index, 'organization_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select organization...</option>
                        {[
                          ...getOrganizationsByType('counsel'),
                          ...getOrganizationsByType('agent')
                        ].map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Advisor Type
                      </label>
                      <select
                        value={advisor.advisor_type}
                        onChange={(e) => updateAdvisor(index, 'advisor_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {ADVISOR_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commitment
                      </label>
                      <select
                        value={advisor.commitment_level}
                        onChange={(e) => updateAdvisor(index, 'commitment_level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {COMMITMENT_LEVELS.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeAdvisor(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Advisor
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financing Scenarios */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Financing Scenarios</h2>
            <button
              type="button"
              onClick={addScenario}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Add Scenario
            </button>
          </div>

          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 ${scenario.is_preferred ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={scenario.name}
                      onChange={(e) => updateScenario(index, 'name', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                      placeholder="Scenario name"
                    />
                    {scenario.is_preferred && (
                      <span className="px-2 py-1 bg-green-600 text-white rounded-md text-xs font-medium">
                        Preferred
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!scenario.is_preferred && (
                      <button
                        type="button"
                        onClick={() => setPreferredScenario(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Set as Preferred
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeScenario(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={scenarios.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Financing Type
                    </label>
                    <select
                      value={scenario.financing_type}
                      onChange={(e) => updateScenario(index, 'financing_type', e.target.value as FinancingType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {FINANCING_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Value
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={scenario.total_value}
                      onChange={(e) => updateScenario(index, 'total_value', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={scenario.currency}
                      onChange={(e) => updateScenario(index, 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {CURRENCIES.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* DEBT-SPECIFIC FIELDS */}
                {(scenario.financing_type === 'debt' || scenario.financing_type === 'hybrid') && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Debt Terms</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Structure</label>
                        <select
                          value={scenario.structure || ''}
                          onChange={(e) => updateScenario(index, 'structure', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select...</option>
                          {DEAL_STRUCTURES.map(struct => (
                            <option key={struct} value={struct}>{struct}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maturity</label>
                        <input
                          type="text"
                          value={scenario.maturity || ''}
                          onChange={(e) => updateScenario(index, 'maturity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 5 years"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pricing</label>
                        <input
                          type="text"
                          value={scenario.pricing || ''}
                          onChange={(e) => updateScenario(index, 'pricing', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., SOFR + 450bps"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spread (bps)</label>
                        <input
                          type="number"
                          value={scenario.spread_bps || ''}
                          onChange={(e) => updateScenario(index, 'spread_bps', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">All-in Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={scenario.all_in_rate || ''}
                          onChange={(e) => updateScenario(index, 'all_in_rate', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upfront Fee (bps)</label>
                        <input
                          type="number"
                          value={scenario.upfront_fee_bps || ''}
                          onChange={(e) => updateScenario(index, 'upfront_fee_bps', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Security Package</label>
                        <textarea
                          value={scenario.security_package || ''}
                          onChange={(e) => updateScenario(index, 'security_package', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe security, collateral, pledges..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* EQUITY-SPECIFIC FIELDS */}
                {(scenario.financing_type === 'equity' || scenario.financing_type === 'hybrid') && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Equity Terms</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equity Stake (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          max="100"
                          value={scenario.equity_percentage || ''}
                          onChange={(e) => updateScenario(index, 'equity_percentage', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pre-Money Valuation</label>
                        <input
                          type="number"
                          value={scenario.pre_money_valuation || ''}
                          onChange={(e) => updateScenario(index, 'pre_money_valuation', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Post-Money Valuation</label>
                        <input
                          type="number"
                          value={scenario.post_money_valuation || ''}
                          onChange={(e) => updateScenario(index, 'post_money_valuation', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target IRR (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={scenario.target_irr || ''}
                          onChange={(e) => updateScenario(index, 'target_irr', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Multiple (x)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={scenario.target_multiple || ''}
                          onChange={(e) => updateScenario(index, 'target_multiple', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Board Seats</label>
                        <input
                          type="number"
                          value={scenario.board_seats || ''}
                          onChange={(e) => updateScenario(index, 'board_seats', parseInt(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Governance Rights</label>
                        <textarea
                          value={scenario.governance_rights || ''}
                          onChange={(e) => updateScenario(index, 'governance_rights', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe governance rights..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* MEZZANINE-SPECIFIC FIELDS */}
                {(scenario.financing_type === 'mezzanine' || scenario.financing_type === 'hybrid') && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Mezzanine Terms</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PIK Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={scenario.pik_rate || ''}
                          onChange={(e) => updateScenario(index, 'pik_rate', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                        <p className="mt-1 text-xs text-gray-500">Payment-in-Kind rate</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equity Kicker (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={scenario.equity_kicker || ''}
                          onChange={(e) => updateScenario(index, 'equity_kicker', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warrant Coverage (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={scenario.warrant_coverage || ''}
                          onChange={(e) => updateScenario(index, 'warrant_coverage', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={scenario.conversion_price || ''}
                          onChange={(e) => updateScenario(index, 'conversion_price', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Ratio</label>
                        <input
                          type="text"
                          value={scenario.conversion_ratio || ''}
                          onChange={(e) => updateScenario(index, 'conversion_ratio', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 1:1, 2:1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Redemption Premium (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={scenario.redemption_premium || ''}
                          onChange={(e) => updateScenario(index, 'redemption_premium', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related Deals */}
        <RelatedDealsSection
          relatedDealIds={relatedDeals}
          onAddDeal={addRelatedDeal}
          onRemoveDeal={removeRelatedDeal}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            to="/pipeline"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Pipeline' : 'Create Pipeline'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PipelineDetailPage;
