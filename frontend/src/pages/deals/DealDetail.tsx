/**
 * Deal Detail Page
 * View and edit a specific deal with participant management
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Deal,
  DealWithParticipants,
  DealParticipant,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_TYPE_LABELS,
  PARTICIPANT_ROLE_LABELS,
  PARTICIPANT_STATUS_COLORS,
  formatDealSize,
  formatDealDate,
} from '../../types/deals';
import {
  getDeal,
  deleteDeal,
  updateDeal,
  getDealParticipants,
  addDealParticipant,
  removeDealParticipant,
} from '../../services/dealsService';
import { getCapitalPartners } from '../../services/capitalPartnersService';
import { getCorporates } from '../../services/sponsorsService';
import { getLegalAdvisors } from '../../services/counselService';
import { getAgents } from '../../services/agentsService';
import DealForm from '../../components/features/deals/DealForm';
import ParticipantForm, { ParticipantFormData } from '../../components/features/deals/ParticipantForm';

const DealDetail: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = window.location.pathname;

  // If the path is /deals/new, treat id as 'new' even if paramId is undefined
  const id = paramId || (location.endsWith('/new') ? 'new' : undefined);

  const [deal, setDeal] = useState<DealWithParticipants | null>(null);
  const [participants, setParticipants] = useState<DealParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    lenders: true,
    sponsors: true,
    counsel: true,
    agents: true,
  });
  const [entityLookup, setEntityLookup] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id && id !== 'new') {
      fetchDeal();
      fetchParticipants();
      fetchEntityLookup();
    } else if (id === 'new') {
      setIsEditing(true);
      setLoading(false);
    } else {
      // Handle undefined id - treat as error
      setError('Invalid route - no deal ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchEntityLookup = async () => {
    try {
      const lookup: Record<string, string> = {};

      // Fetch all entity types in parallel
      const [capitalPartnersRes, corporatesRes, legalAdvisorsRes, agentsRes] = await Promise.all([
        getCapitalPartners(),
        getCorporates(),
        getLegalAdvisors(),
        getAgents(),
      ]);

      // Build lookup map: entity_id -> entity_name
      if (capitalPartnersRes.success && capitalPartnersRes.data) {
        capitalPartnersRes.data.forEach((cp: any) => {
          lookup[cp.id] = cp.name;
        });
      }

      if (corporatesRes.success && corporatesRes.data) {
        corporatesRes.data.forEach((corp: any) => {
          lookup[corp.id] = corp.name;
        });
      }

      if (legalAdvisorsRes.success && legalAdvisorsRes.data) {
        legalAdvisorsRes.data.forEach((legal: any) => {
          lookup[legal.id] = legal.name;
        });
      }

      if (agentsRes.success && agentsRes.data) {
        agentsRes.data.forEach((agent: any) => {
          lookup[agent.id] = agent.name;
        });
      }

      setEntityLookup(lookup);
    } catch (err) {
      console.error('Failed to fetch entity lookup:', err);
    }
  };

  const fetchDeal = async () => {
    if (!id || id === 'new') return;

    setLoading(true);
    try {
      const response = await getDeal(id);

      if (response.success && response.data) {
        setDeal(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to load deal');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    if (!id || id === 'new') return;

    try {
      const response = await getDealParticipants(id);

      if (response.success && response.data) {
        setParticipants(response.data);
      }
    } catch (err) {
      // Silently fail - participants will remain empty
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (id === 'new') {
        // Create new deal through service
        navigate('/deals'); // Redirect to list after creation
      } else {
        const response = await updateDeal(id!, formData);

        if (response.success && response.data) {
          setDeal({ ...response.data, participants: deal?.participants });
          setIsEditing(false);
          setError(null);
        } else {
          setError(response.message || 'Failed to save deal');
        }
      }
    } catch (err) {
      setError('Failed to connect to API');
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;

    try {
      const response = await deleteDeal(id);

      if (response.success) {
        navigate('/deals');
      } else {
        setError(response.message || 'Failed to delete deal');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleAddParticipant = async (participantData: ParticipantFormData) => {
    if (!id || id === 'new') return;

    try {
      const response = await addDealParticipant(id, participantData);

      if (response.success) {
        // Refresh participants
        await fetchParticipants();
        setShowParticipantForm(false);
      } else {
        throw new Error(response.message || 'Failed to add participant');
      }
    } catch (err: any) {
      throw err; // Re-throw so the form can display the error
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!id || id === 'new') return;

    if (!window.confirm('Remove this participant from the deal?')) {
      return;
    }

    try {
      const response = await removeDealParticipant(id, participantId);

      if (response.success) {
        // Refresh participants
        fetchParticipants();
      } else {
        alert(`Failed to remove participant: ${response.message}`);
      }
    } catch (err) {
      alert('Failed to remove participant');
    }
  };

  const toggleSection = (section: 'lenders' | 'sponsors' | 'counsel' | 'agents') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getEntityName = (entityId: string): string => {
    return entityLookup[entityId] || entityId; // Fallback to ID if name not found
  };

  // Group participants by role
  const lenders = participants.filter(p =>
    ['lender', 'arranger', 'lead_arranger', 'agent', 'bookrunner', 'underwriter', 'investor'].includes(p.role)
  );
  const sponsors = participants.filter(p =>
    ['sponsor', 'borrower', 'guarantor', 'offtaker', 'epc_contractor', 'operator'].includes(p.role)
  );
  const counsel = participants.filter(p => p.entity_type === 'legal_advisor');
  const agents = participants.filter(p => p.entity_type === 'agent');

  // Calculate totals
  const totalCommitments = participants.reduce((sum, p) => sum + (p.commitment_amount || 0), 0);
  const totalFunded = participants.reduce((sum, p) => sum + (p.funded_amount || 0), 0);
  const commitmentPct = deal?.total_size ? (totalCommitments / deal.total_size) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => navigate('/deals')}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Back to Deals List
        </button>
      </div>
    );
  }

  // New deal form
  if (id === 'new') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/deals')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">New Deal</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <DealForm
            onSave={handleSave}
            onCancel={() => navigate('/deals')}
          />
        </div>
      </div>
    );
  }

  // Existing deal view/edit
  if (!deal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Deal not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/deals')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">{deal.deal_name}</h1>
              <span className={`px-3 py-1 rounded text-sm font-medium ${DEAL_STATUS_COLORS[deal.status]}`}>
                {DEAL_STATUS_LABELS[deal.status]}
              </span>
            </div>
            <p className="text-gray-600">
              {deal.deal_type && DEAL_TYPE_LABELS[deal.deal_type]} • {deal.country} • {formatDealSize(deal.total_size, deal.currency)}
            </p>
          </div>
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Deal
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <DealForm
            initialData={deal}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          {/* Financial Summary */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Financial Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Deal Size</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDealSize(deal.total_size, deal.currency)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Commitments</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDealSize(totalCommitments, deal.currency)}
                </div>
                <div className="text-xs text-gray-500">{commitmentPct.toFixed(1)}% of total</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Funded</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDealSize(totalFunded, deal.currency)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Participants</div>
                <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
                <div className="text-xs text-gray-500">
                  {lenders.length} lenders • {sponsors.length} sponsors • {counsel.length} counsel • {agents.length} agents
                </div>
              </div>
            </div>

            {/* Commitment Progress Bar */}
            {deal.total_size > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Syndication Progress</span>
                  <span className="font-medium text-gray-900">{commitmentPct.toFixed(1)}%</span>
                </div>
                <div className="bg-white rounded-full h-3 overflow-hidden border border-blue-300">
                  <div
                    className={`h-full transition-all duration-300 ${
                      commitmentPct >= 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(commitmentPct, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Deal Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Deal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Basic Information</h3>

                {deal.deal_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Deal Number</label>
                    <p className="text-gray-900">{deal.deal_number}</p>
                  </div>
                )}

                {deal.sector && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Sector</label>
                    <p className="text-gray-900">{deal.sector.replace(/_/g, ' ')}</p>
                  </div>
                )}

                {deal.sub_sector && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Sub-Sector</label>
                    <p className="text-gray-900">{deal.sub_sector.replace(/_/g, ' ')}</p>
                  </div>
                )}

                {deal.region && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Region</label>
                    <p className="text-gray-900">{deal.region}</p>
                  </div>
                )}
              </div>

              {/* Financial Terms */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Financial Terms</h3>

                {deal.structure && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Structure</label>
                    <p className="text-gray-900">{deal.structure}</p>
                  </div>
                )}

                {deal.pricing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Pricing</label>
                    <p className="text-gray-900">{deal.pricing}</p>
                  </div>
                )}

                {deal.spread_bps > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Spread</label>
                    <p className="text-gray-900">+{deal.spread_bps} bps</p>
                  </div>
                )}

                {deal.all_in_rate > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">All-in Rate</label>
                    <p className="text-gray-900">{deal.all_in_rate}%</p>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Key Dates</h3>

                {deal.deal_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Deal Date</label>
                    <p className="text-gray-900">{formatDealDate(deal.deal_date)}</p>
                  </div>
                )}

                {deal.closing_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Closing Date</label>
                    <p className="text-gray-900">{formatDealDate(deal.closing_date)}</p>
                  </div>
                )}

                {deal.maturity_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Maturity Date</label>
                    <p className="text-gray-900">{formatDealDate(deal.maturity_date)}</p>
                  </div>
                )}

                {deal.maturity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Maturity</label>
                    <p className="text-gray-900">{deal.maturity}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Details */}
            {(deal.project_name || deal.project_description) && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-700 mb-3">Project Details</h3>

                {deal.project_name && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600">Project Name</label>
                    <p className="text-gray-900">{deal.project_name}</p>
                  </div>
                )}

                {deal.project_capacity && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600">Capacity</label>
                    <p className="text-gray-900">{deal.project_capacity}</p>
                  </div>
                )}

                {deal.project_description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{deal.project_description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Description & Notes */}
            {(deal.description || deal.notes) && (
              <div className="mt-6 pt-6 border-t space-y-4">
                {deal.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{deal.description}</p>
                  </div>
                )}

                {deal.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Notes</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{deal.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Participants Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Participants ({participants.length})</h2>
              <button
                onClick={() => setShowParticipantForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                + Add Participant
              </button>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No participants yet</p>
                <button
                  onClick={() => setShowParticipantForm(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Add the first participant
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lenders Section */}
                {lenders.length > 0 && (
                  <div className="border border-gray-200 rounded-md">
                    <button
                      onClick={() => toggleSection('lenders')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">Lenders ({lenders.length})</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedSections.lenders ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {expandedSections.lenders && (
                      <div className="divide-y divide-gray-200">
                        {lenders.map(participant => (
                          <div key={participant.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{getEntityName(participant.entity_id)}</span>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                    {PARTICIPANT_ROLE_LABELS[participant.role]}
                                  </span>
                                  {participant.status && (
                                    <span className={`px-2 py-0.5 text-xs rounded ${PARTICIPANT_STATUS_COLORS[participant.status]}`}>
                                      {participant.status}
                                    </span>
                                  )}
                                </div>

                                {participant.commitment_amount > 0 && (
                                  <div className="text-sm text-gray-600">
                                    Commitment: {formatDealSize(participant.commitment_amount, deal.currency)}
                                    {participant.participation_pct > 0 && ` (${participant.participation_pct}%)`}
                                  </div>
                                )}

                                {participant.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{participant.notes}</p>
                                )}
                              </div>

                              <button
                                onClick={() => handleRemoveParticipant(participant.id)}
                                className="ml-4 text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sponsors Section */}
                {sponsors.length > 0 && (
                  <div className="border border-gray-200 rounded-md">
                    <button
                      onClick={() => toggleSection('sponsors')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">Sponsors ({sponsors.length})</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedSections.sponsors ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {expandedSections.sponsors && (
                      <div className="divide-y divide-gray-200">
                        {sponsors.map(participant => (
                          <div key={participant.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{getEntityName(participant.entity_id)}</span>
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                                    {PARTICIPANT_ROLE_LABELS[participant.role]}
                                  </span>
                                </div>

                                {participant.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{participant.notes}</p>
                                )}
                              </div>

                              <button
                                onClick={() => handleRemoveParticipant(participant.id)}
                                className="ml-4 text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Counsel Section */}
                {counsel.length > 0 && (
                  <div className="border border-gray-200 rounded-md">
                    <button
                      onClick={() => toggleSection('counsel')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">Counsel ({counsel.length})</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedSections.counsel ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {expandedSections.counsel && (
                      <div className="divide-y divide-gray-200">
                        {counsel.map(participant => (
                          <div key={participant.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{getEntityName(participant.entity_id)}</span>
                                  <span className="px-2 py-0.5 bg-violet-100 text-violet-800 text-xs rounded">
                                    {PARTICIPANT_ROLE_LABELS[participant.role]}
                                  </span>
                                </div>

                                {participant.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{participant.notes}</p>
                                )}
                              </div>

                              <button
                                onClick={() => handleRemoveParticipant(participant.id)}
                                className="ml-4 text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Agents Section */}
                {agents.length > 0 && (
                  <div className="border border-gray-200 rounded-md">
                    <button
                      onClick={() => toggleSection('agents')}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">Transaction Agents ({agents.length})</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedSections.agents ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {expandedSections.agents && (
                      <div className="divide-y divide-gray-200">
                        {agents.map(participant => (
                          <div key={participant.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{getEntityName(participant.entity_id)}</span>
                                  <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-xs rounded">
                                    {PARTICIPANT_ROLE_LABELS[participant.role]}
                                  </span>
                                </div>

                                {participant.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{participant.notes}</p>
                                )}
                              </div>

                              <button
                                onClick={() => handleRemoveParticipant(participant.id)}
                                className="ml-4 text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
            <p>Created: {new Date(deal.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(deal.updated_at).toLocaleString()}</p>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Delete Deal?
            </h3>
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <strong>{deal.deal_name}</strong>?
            </p>
            <p className="text-red-600 font-semibold mb-4">
              Warning: This will also delete all {participants.length} participant(s)!
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participant Form Modal */}
      {showParticipantForm && id && id !== 'new' && (
        <ParticipantForm
          dealId={id}
          onSave={handleAddParticipant}
          onCancel={() => setShowParticipantForm(false)}
        />
      )}
    </div>
  );
};

export default DealDetail;
