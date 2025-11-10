/**
 * Corporate Form Component
 * Reusable form for creating/editing corporates
 */

import React, { useState } from 'react';
import {
  Corporate,
  CorporateFormData,
  DealPrecedent,
  RELATIONSHIP_LEVELS,
  SponsorPreferences
} from '../../../types/sponsors';
import SponsorPreferencesGrid from './SponsorPreferencesGrid';
import DealPrecedentsEditor from '../../shared/DealPrecedentsEditor';
import CountryMultiSelect from '../../ui/CountryMultiSelect';

interface CorporateFormProps {
  initialData?: Corporate | null;
  onSave: (data: CorporateFormData) => void;
  onCancel: () => void;
}

const CorporateForm: React.FC<CorporateFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<CorporateFormData>({
    name: initialData?.name || '',
    country: initialData?.country || '',
    headquarters_location: initialData?.headquarters_location || '',
    investment_need_min: initialData?.investment_need_min || 0,
    investment_need_max: initialData?.investment_need_max || 0,
    currency: initialData?.currency || 'USD',
    relationship: initialData?.relationship || 'Developing',
    notes: initialData?.notes || '',
    company_description: initialData?.company_description || '',
    deal_precedents: initialData?.deal_precedents || [],
    countries: initialData?.countries || [],
    infrastructure_types: initialData?.infrastructure_types || {
      transport_infra: 'N',
      energy_infra: 'N'
    },
    regions: initialData?.regions || {
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  const handlePreferencesChange = (preferences: Partial<SponsorPreferences>) => {
    setFormData((prev) => ({
      ...prev,
      infrastructure_types: {
        transport_infra: preferences.transport_infra || 'N',
        energy_infra: preferences.energy_infra || 'N'
      },
      regions: {
        us_market: preferences.us_market || 'N',
        emerging_markets: preferences.emerging_markets || 'N',
        asia_em: preferences.asia_em || 'N',
        africa_em: preferences.africa_em || 'N',
        emea_em: preferences.emea_em || 'N',
        vietnam: preferences.vietnam || 'N',
        mongolia: preferences.mongolia || 'N',
        turkey: preferences.turkey || 'N'
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
      newErrors.name = 'Corporate name is required';
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
      {/* Corporate Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Corporate Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Acme Infrastructure Corp"
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
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g., New York, London, Hanoi"
        />
        <p className="mt-1 text-xs text-gray-500">Optional - Specific city or region</p>
      </div>

      {/* Investment Need Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="investment_need_min" className="block text-sm font-medium text-gray-700 mb-1">
            Investment Need (Min)
          </label>
          <input
            type="number"
            id="investment_need_min"
            name="investment_need_min"
            value={formData.investment_need_min || ''}
            onChange={handleNumberChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">In USD millions</p>
        </div>

        <div>
          <label htmlFor="investment_need_max" className="block text-sm font-medium text-gray-700 mb-1">
            Investment Need (Max)
          </label>
          <input
            type="number"
            id="investment_need_max"
            name="investment_need_max"
            value={formData.investment_need_max || ''}
            onChange={handleNumberChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="USD"
          />
        </div>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {RELATIONSHIP_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Investment Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Preferences</h3>
        <SponsorPreferencesGrid
          preferences={{
            ...formData.infrastructure_types!,
            ...formData.regions!
          }}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Additional information about this corporate..."
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Detailed information about the company, business model, project details, etc..."
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
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Create Corporate'}
        </button>
      </div>
    </form>
  );
};

export default CorporateForm;
