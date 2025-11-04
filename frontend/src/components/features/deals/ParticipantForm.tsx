/**
 * Participant Form Component
 * Modal form for adding participants to deals
 */

import React, { useState, useEffect } from 'react';
import {
  ParticipantEntityType,
  ParticipantRole,
  PARTICIPANT_ENTITY_TYPES,
  PARTICIPANT_ROLES_BY_ENTITY,
  PARTICIPANT_ROLE_LABELS,
  PARTICIPANT_ENTITY_TYPE_LABELS,
} from '../../../types/deals';
import { getCapitalPartners } from '../../../services/capitalPartnersService';
import { getCorporates } from '../../../services/sponsorsService';
import { getLegalAdvisors } from '../../../services/counselService';
import { getAgents } from '../../../services/agentsService';

interface ParticipantFormProps {
  dealId: string;
  onSave: (participantData: ParticipantFormData) => Promise<void>;
  onCancel: () => void;
}

export interface ParticipantFormData {
  entity_type: ParticipantEntityType;
  entity_id: string;
  role: ParticipantRole;
  commitment_amount?: number;
  participation_pct?: number;
  notes?: string;
}

interface EntityOption {
  id: string;
  name: string;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({ dealId, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ParticipantFormData>({
    entity_type: 'capital_partner',
    entity_id: '',
    role: 'lender',
    commitment_amount: undefined,
    participation_pct: undefined,
    notes: '',
  });

  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch entities when entity type changes
  useEffect(() => {
    fetchEntities(formData.entity_type);
  }, [formData.entity_type]);

  const fetchEntities = async (entityType: ParticipantEntityType) => {
    setLoadingEntities(true);
    setError(null);
    try {
      let response;
      switch (entityType) {
        case 'capital_partner':
          response = await getCapitalPartners();
          break;
        case 'corporate':
          response = await getCorporates();
          break;
        case 'legal_advisor':
          response = await getLegalAdvisors();
          break;
        case 'agent':
          response = await getAgents();
          break;
        default:
          setEntities([]);
          return;
      }

      if (response.success && response.data) {
        setEntities(
          response.data.map((entity: any) => ({
            id: entity.id,
            name: entity.name || entity.firm_name || entity.corporate_name || 'Unknown',
          }))
        );
      } else {
        setError('Failed to load entities');
        setEntities([]);
      }
    } catch (err) {
      setError('Failed to load entities');
      setEntities([]);
    } finally {
      setLoadingEntities(false);
    }
  };

  const handleEntityTypeChange = (entityType: ParticipantEntityType) => {
    // Reset entity_id and role when entity type changes
    const availableRoles = PARTICIPANT_ROLES_BY_ENTITY[entityType] || [];
    setFormData({
      ...formData,
      entity_type: entityType,
      entity_id: '',
      role: availableRoles[0] || 'lender',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.entity_id) {
      setError('Please select an entity');
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to add participant');
    } finally {
      setSaving(false);
    }
  };

  const availableRoles = PARTICIPANT_ROLES_BY_ENTITY[formData.entity_type] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add Participant</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Entity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Type *
            </label>
            <select
              value={formData.entity_type}
              onChange={(e) => handleEntityTypeChange(e.target.value as ParticipantEntityType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {PARTICIPANT_ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PARTICIPANT_ENTITY_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {PARTICIPANT_ENTITY_TYPE_LABELS[formData.entity_type]} *
            </label>
            {loadingEntities ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <select
                value={formData.entity_id}
                onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select {PARTICIPANT_ENTITY_TYPE_LABELS[formData.entity_type]}</option>
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as ParticipantRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {PARTICIPANT_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          {/* Commitment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commitment Amount
            </label>
            <input
              type="number"
              value={formData.commitment_amount || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  commitment_amount: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <p className="mt-1 text-sm text-gray-500">Amount committed by this participant</p>
          </div>

          {/* Participation Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participation %
            </label>
            <input
              type="number"
              value={formData.participation_pct || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  participation_pct: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
              max="100"
            />
            <p className="mt-1 text-sm text-gray-500">Percentage of total deal (0-100)</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes about this participant..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loadingEntities}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add Participant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParticipantForm;
