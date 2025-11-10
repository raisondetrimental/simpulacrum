/**
 * Agent Form Component
 * Reusable form for creating/editing agents
 */

import React, { useState } from 'react';
import {
  Agent,
  AgentFormData,
  DealPrecedent,
  RELATIONSHIP_LEVELS,
  AgentPreferences,
  AGENT_TYPES
} from '../../../types/agents';
import AgentPreferencesGrid from './AgentPreferencesGrid';
import DealPrecedentsEditor from '../../shared/DealPrecedentsEditor';
import CountryMultiSelect from '../../ui/CountryMultiSelect';

interface AgentFormProps {
  initialData?: Agent | null;
  onSave: (data: AgentFormData) => void;
  onCancel: () => void;
}

const AgentForm: React.FC<AgentFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<AgentFormData>({
    name: initialData?.name || '',
    agent_type: initialData?.agent_type || 'Placement Agent',
    country: initialData?.country || '',
    headquarters_location: initialData?.headquarters_location || '',
    relationship: initialData?.relationship || 'Developing',
    notes: initialData?.notes || '',
    deal_precedents: initialData?.deal_precedents || [],
    countries: initialData?.countries || [],
    agent_preferences: initialData?.agent_preferences || {
      transport_infra: 'N',
      energy_infra: 'N',
      us_market: 'N',
      emerging_markets: 'N',
      asia_em: 'N',
      africa_em: 'N',
      emea_em: 'N'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePreferencesChange = (preferences: Partial<AgentPreferences>) => {
    setFormData((prev) => ({
      ...prev,
      agent_preferences: {
        transport_infra: preferences.transport_infra || 'N',
        energy_infra: preferences.energy_infra || 'N',
        us_market: preferences.us_market || 'N',
        emerging_markets: preferences.emerging_markets || 'N',
        asia_em: preferences.asia_em || 'N',
        africa_em: preferences.africa_em || 'N',
        emea_em: preferences.emea_em || 'N'
      }
    }));
  };

  const handleDealPrecedentsChange = (deals: DealPrecedent[]) => {
    setFormData((prev) => ({
      ...prev,
      deal_precedents: deals
    }));
  };

  const handleCountriesChange = (countries: string[]) => {
    setFormData((prev) => ({
      ...prev,
      countries
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Agent name is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Agent Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Agent Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Goldman Sachs"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Agent Type */}
      <div>
        <label htmlFor="agent_type" className="block text-sm font-medium text-gray-700 mb-1">
          Agent Type <span className="text-red-600">*</span>
        </label>
        <select
          id="agent_type"
          name="agent_type"
          value={formData.agent_type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {AGENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.country ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., US, UK, Singapore"
        />
        {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
      </div>

      {/* Headquarters Location */}
      <div>
        <label
          htmlFor="headquarters_location"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Headquarters Location
        </label>
        <input
          type="text"
          id="headquarters_location"
          name="headquarters_location"
          value={formData.headquarters_location}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="e.g., New York, London, Singapore"
        />
        <p className="mt-1 text-xs text-gray-500">Optional - Specific city or region</p>
      </div>

      {/* Relationship */}
      <div>
        <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
          Relationship Strength
        </label>
        <select
          id="relationship"
          name="relationship"
          value={formData.relationship}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {RELATIONSHIP_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Agent Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Agent Preferences</h3>
        <AgentPreferencesGrid
          preferences={formData.agent_preferences!}
          onChange={handlePreferencesChange}
          readonly={false}
          collapsible={true}
        />
      </div>

      {/* Country Investment Preferences */}
      <div>
        <CountryMultiSelect
          selectedCountries={formData.countries || []}
          onChange={handleCountriesChange}
          label="Investment Focus Countries"
          placeholder="Select countries of investment interest..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Select specific countries where this organization has investment focus
        </p>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Additional information about this agent..."
        />
      </div>

      {/* Deal Precedents */}
      <div className="border-t border-gray-200 pt-6">
        <DealPrecedentsEditor
          deals={formData.deal_precedents || []}
          onChange={handleDealPrecedentsChange}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Create Agent'}
        </button>
      </div>
    </form>
  );
};

export default AgentForm;
