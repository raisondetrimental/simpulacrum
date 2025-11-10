/**
 * Legal Advisor Form Component
 * Reusable form for creating/editing legal advisors
 */

import React, { useState } from 'react';
import {
  LegalAdvisor,
  LegalAdvisorFormData,
  RELATIONSHIP_LEVELS,
  CounselPreferences
} from '../../../types/counsel';
import CounselPreferencesGrid from './CounselPreferencesGrid';
import CountryMultiSelect from '../../ui/CountryMultiSelect';

interface LegalAdvisorFormProps {
  initialData?: LegalAdvisor | null;
  onSave: (data: LegalAdvisorFormData) => void;
  onCancel: () => void;
}

const LegalAdvisorForm: React.FC<LegalAdvisorFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  // Initialize default preferences
  const defaultPreferences: Partial<CounselPreferences> = {
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
    vietnam: 'N',
    mongolia: 'N',
    turkey: 'N',
    coal: 'N',
    energy_infra: 'N',
    transport_infra: 'N',
    more_expensive_than_usual: 'N',
    require_bank_guarantee: 'N'
  };

  const [formData, setFormData] = useState<LegalAdvisorFormData>({
    name: initialData?.name || '',
    country: initialData?.country || '',
    headquarters_location: initialData?.headquarters_location || '',
    relationship: initialData?.relationship || 'Developing',
    notes: initialData?.notes || '',
    counsel_preferences: initialData?.counsel_preferences || defaultPreferences,
    countries: initialData?.countries || []
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

  const handlePreferencesChange = (preferences: Partial<CounselPreferences>) => {
    setFormData((prev) => ({
      ...prev,
      counsel_preferences: preferences
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
      newErrors.name = 'Legal advisor name is required';
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
      {/* Legal Advisor Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Legal Advisor Name <span className="text-red-600">*</span>
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
          placeholder="e.g., Baker McKenzie, Allen & Overy"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
          placeholder="e.g., US, UK, Vietnam"
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
          placeholder="e.g., New York, London, Hanoi"
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

      {/* Counsel Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Counsel Preferences</h3>
        <CounselPreferencesGrid
          preferences={formData.counsel_preferences || defaultPreferences}
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
          placeholder="Additional information about this legal advisor..."
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
          {initialData ? 'Save Changes' : 'Create Legal Advisor'}
        </button>
      </div>
    </form>
  );
};

export default LegalAdvisorForm;
