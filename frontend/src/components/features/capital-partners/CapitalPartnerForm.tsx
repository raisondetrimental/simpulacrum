/**
 * Capital Partner Form Component
 * Reusable form for creating/editing capital partners
 */

import React, { useState } from 'react';
import {
  CapitalPartner,
  CapitalPartnerFormData,
  DealPrecedent,
  InvestmentPreferences,
  ORGANIZATION_TYPES,
  RELATIONSHIP_LEVELS
} from '../../../types/liquidity';
import DealPrecedentsEditor from '../../shared/DealPrecedentsEditor';
import PreferencesGrid from './PreferencesGrid';
import CountryMultiSelect from '../../ui/CountryMultiSelect';

interface CapitalPartnerFormProps {
  initialData?: CapitalPartner | null;
  onSave: (data: CapitalPartnerFormData) => void;
  onCancel: () => void;
}

const CapitalPartnerForm: React.FC<CapitalPartnerFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<CapitalPartnerFormData>({
    name: initialData?.name || '',
    type: initialData?.type || '',
    country: initialData?.country || '',
    headquarters_location: initialData?.headquarters_location || '',
    investment_min: initialData?.investment_min || 0,
    investment_max: initialData?.investment_max || 0,
    currency: initialData?.currency || 'USD',
    relationship: initialData?.relationship || 'Developing',
    notes: initialData?.notes || '',
    company_description: initialData?.company_description || '',
    deal_precedents: initialData?.deal_precedents || [],
    countries: initialData?.countries || [],
    preferences: initialData?.preferences || {
      investment_grade: 'N',
      high_yield: 'N',
      infra_debt: 'N',
      senior_secured: 'N',
      subordinated: 'N',
      bonds: 'N',
      loan_agreement: 'N',
      quasi_sovereign_only: 'N',
      public_bond_high_yield: 'N',
      us_market: 'N',
      emerging_markets: 'N',
      asia_em: 'N',
      africa_em: 'N',
      emea_em: 'N',
      coal: 'N',
      energy_infra: 'N',
      transport_infra: 'N',
      more_expensive_than_usual: 'N',
      require_bank_guarantee: 'N'
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  const handlePreferencesChange = (preferences: Partial<InvestmentPreferences>) => {
    setFormData((prev) => ({
      ...prev,
      preferences
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
      newErrors.name = 'Organization name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Organization type is required';
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
      {/* Organization Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., CalPERS, GPIF, NBIM"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Organization Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Type <span className="text-red-600">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select type...</option>
          {ORGANIZATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
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
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.country ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., US, UK, Japan"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., New York, London, Tokyo"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {RELATIONSHIP_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Investment Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="investment_min" className="block text-sm font-medium text-gray-700 mb-1">
            Investment Capacity (Min)
          </label>
          <input
            type="number"
            id="investment_min"
            name="investment_min"
            value={formData.investment_min || ''}
            onChange={handleNumberChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">In USD millions</p>
        </div>

        <div>
          <label htmlFor="investment_max" className="block text-sm font-medium text-gray-700 mb-1">
            Investment Capacity (Max)
          </label>
          <input
            type="number"
            id="investment_max"
            name="investment_max"
            value={formData.investment_max || ''}
            onChange={handleNumberChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">In USD millions</p>
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <input
            type="text"
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="USD"
          />
        </div>
      </div>

      {/* Investment Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Preferences</h3>
        <PreferencesGrid
          preferences={formData.preferences || {}}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional information about this capital partner..."
        />
      </div>

      {/* Company Description */}
      <div>
        <label htmlFor="company_description" className="block text-sm font-medium text-gray-700 mb-1">
          Company Description
        </label>
        <textarea
          id="company_description"
          name="company_description"
          value={formData.company_description}
          onChange={handleChange}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Detailed information about the company, investment mandate, focus areas, etc..."
        />
        <p className="mt-1 text-xs text-gray-500">Provide comprehensive company information for reference</p>
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
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Create Capital Partner'}
        </button>
      </div>
    </form>
  );
};

export default CapitalPartnerForm;
