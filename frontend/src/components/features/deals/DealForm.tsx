/**
 * Deal Form Component
 * Comprehensive form for creating/editing deals with 40+ fields
 */

import React, { useState, useEffect } from 'react';
import {
  Deal,
  DealFormData,
  DealStatus,
  DealType,
  DealSector,
  DealRegion,
  DealStructure,
  SyndicationType,
  DEAL_STATUSES,
  DEAL_TYPES,
  DEAL_SECTORS,
  DEAL_SUB_SECTORS,
  DEAL_REGIONS,
  DEAL_STRUCTURES,
  SYNDICATION_TYPES,
  DEAL_CURRENCIES,
  validateDealForm,
} from '../../../types/deals';

interface DealFormProps {
  initialData?: Deal | null;
  onSave: (data: DealFormData) => void;
  onCancel: () => void;
}

const DealForm: React.FC<DealFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<DealFormData>({
    // Basic Information
    deal_name: initialData?.deal_name || '',
    deal_number: initialData?.deal_number || '',

    // Dates
    deal_date: initialData?.deal_date || '',
    signing_date: initialData?.signing_date || '',
    closing_date: initialData?.closing_date || '',
    first_drawdown_date: initialData?.first_drawdown_date || '',
    maturity_date: initialData?.maturity_date || '',

    // Classification
    status: initialData?.status || 'pipeline',
    deal_type: initialData?.deal_type || 'project_finance',
    sector: initialData?.sector || 'energy',
    sub_sector: initialData?.sub_sector || '',
    country: initialData?.country || '',
    region: initialData?.region || 'Emerging Markets',

    // Financial Terms
    total_size: initialData?.total_size || 0,
    currency: initialData?.currency || 'USD',
    structure: initialData?.structure || 'Senior Secured',
    pricing: initialData?.pricing || '',
    spread_bps: initialData?.spread_bps || 0,
    all_in_rate: initialData?.all_in_rate || 0,
    maturity: initialData?.maturity || '',

    // Fees
    upfront_fee_bps: initialData?.upfront_fee_bps || 0,
    commitment_fee_bps: initialData?.commitment_fee_bps || 0,
    agency_fee: initialData?.agency_fee || 0,

    // Covenants & Terms
    covenants: initialData?.covenants || {},
    security_package: initialData?.security_package || '',
    guarantees: initialData?.guarantees || [],

    // Project Details
    project_name: initialData?.project_name || '',
    project_capacity: initialData?.project_capacity || '',
    project_description: initialData?.project_description || '',

    // Documentation
    description: initialData?.description || '',
    notes: initialData?.notes || '',
    key_risks: initialData?.key_risks || '',
    mitigants: initialData?.mitigants || '',

    // Syndication
    syndication_type: initialData?.syndication_type || 'club',
    lead_arranger_id: initialData?.lead_arranger_id || '',

    // Metadata
    deal_team_members: initialData?.deal_team_members || [],
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'basic' | 'financial' | 'project' | 'documentation'>('basic');

  // Update sub-sectors when sector changes
  useEffect(() => {
    if (formData.sector && !DEAL_SUB_SECTORS[formData.sector].includes(formData.sub_sector)) {
      setFormData(prev => ({ ...prev, sub_sector: '' }));
    }
  }, [formData.sector]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors([]); // Clear errors on change
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateDealForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(formData);
  };

  const availableSubSectors = formData.sector ? DEAL_SUB_SECTORS[formData.sector] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSection('basic')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeSection === 'basic'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Basic Info
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('financial')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeSection === 'financial'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Financial Terms
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('project')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeSection === 'project'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Project Details
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('documentation')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeSection === 'documentation'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Documentation
        </button>
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      {activeSection === 'basic' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

          {/* Deal Name */}
          <div>
            <label htmlFor="deal_name" className="block text-sm font-medium text-gray-700 mb-1">
              Deal Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="deal_name"
              name="deal_name"
              value={formData.deal_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Mongolia Solar Project Financing"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deal Number */}
            <div>
              <label htmlFor="deal_number" className="block text-sm font-medium text-gray-700 mb-1">
                Deal Number
              </label>
              <input
                type="text"
                id="deal_number"
                name="deal_number"
                value={formData.deal_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DEAL-2025-001"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-600">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {DEAL_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="deal_type" className="block text-sm font-medium text-gray-700 mb-1">
                Deal Type
              </label>
              <select
                id="deal_type"
                name="deal_type"
                value={formData.deal_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEAL_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                Sector
              </label>
              <select
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEAL_SECTORS.map(sector => (
                  <option key={sector} value={sector}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-Sector & Syndication Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sub_sector" className="block text-sm font-medium text-gray-700 mb-1">
                Sub-Sector
              </label>
              <select
                id="sub_sector"
                name="sub_sector"
                value={formData.sub_sector}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select sub-sector</option>
                {availableSubSectors.map(subSector => (
                  <option key={subSector} value={subSector}>
                    {subSector.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="syndication_type" className="block text-sm font-medium text-gray-700 mb-1">
                Syndication Type
              </label>
              <select
                id="syndication_type"
                name="syndication_type"
                value={formData.syndication_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SYNDICATION_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Geography */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mongolia, Vietnam"
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEAL_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="deal_date" className="block text-sm font-medium text-gray-700 mb-1">
                Deal Date
              </label>
              <input
                type="date"
                id="deal_date"
                name="deal_date"
                value={formData.deal_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="signing_date" className="block text-sm font-medium text-gray-700 mb-1">
                Signing Date
              </label>
              <input
                type="date"
                id="signing_date"
                name="signing_date"
                value={formData.signing_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="closing_date" className="block text-sm font-medium text-gray-700 mb-1">
                Closing Date
              </label>
              <input
                type="date"
                id="closing_date"
                name="closing_date"
                value={formData.closing_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_drawdown_date" className="block text-sm font-medium text-gray-700 mb-1">
                First Drawdown Date
              </label>
              <input
                type="date"
                id="first_drawdown_date"
                name="first_drawdown_date"
                value={formData.first_drawdown_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="maturity_date" className="block text-sm font-medium text-gray-700 mb-1">
                Maturity Date
              </label>
              <input
                type="date"
                id="maturity_date"
                name="maturity_date"
                value={formData.maturity_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: FINANCIAL TERMS */}
      {activeSection === 'financial' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Financial Terms</h3>

          {/* Deal Size & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="total_size" className="block text-sm font-medium text-gray-700 mb-1">
                Total Size (base currency)
              </label>
              <input
                type="number"
                id="total_size"
                name="total_size"
                value={formData.total_size || ''}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">Enter as full number (e.g., 75000000 for $75M)</p>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency <span className="text-red-600">*</span>
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {DEAL_CURRENCIES.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Structure & Maturity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="structure" className="block text-sm font-medium text-gray-700 mb-1">
                Structure
              </label>
              <select
                id="structure"
                name="structure"
                value={formData.structure}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEAL_STRUCTURES.map(structure => (
                  <option key={structure} value={structure}>{structure}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="maturity" className="block text-sm font-medium text-gray-700 mb-1">
                Maturity (text)
              </label>
              <input
                type="text"
                id="maturity"
                name="maturity"
                value={formData.maturity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5 years, 7.5 years"
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-1">
              Pricing
            </label>
            <input
              type="text"
              id="pricing"
              name="pricing"
              value={formData.pricing}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SOFR + 450bps, Fixed 7.5%"
            />
          </div>

          {/* Spread & All-in Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="spread_bps" className="block text-sm font-medium text-gray-700 mb-1">
                Spread (bps)
              </label>
              <input
                type="number"
                id="spread_bps"
                name="spread_bps"
                value={formData.spread_bps || ''}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="all_in_rate" className="block text-sm font-medium text-gray-700 mb-1">
                All-in Rate (%)
              </label>
              <input
                type="number"
                id="all_in_rate"
                name="all_in_rate"
                value={formData.all_in_rate || ''}
                onChange={handleNumberChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="upfront_fee_bps" className="block text-sm font-medium text-gray-700 mb-1">
                Upfront Fee (bps)
              </label>
              <input
                type="number"
                id="upfront_fee_bps"
                name="upfront_fee_bps"
                value={formData.upfront_fee_bps || ''}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="commitment_fee_bps" className="block text-sm font-medium text-gray-700 mb-1">
                Commitment Fee (bps)
              </label>
              <input
                type="number"
                id="commitment_fee_bps"
                name="commitment_fee_bps"
                value={formData.commitment_fee_bps || ''}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="agency_fee" className="block text-sm font-medium text-gray-700 mb-1">
                Agency Fee
              </label>
              <input
                type="number"
                id="agency_fee"
                name="agency_fee"
                value={formData.agency_fee || ''}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Security Package */}
          <div>
            <label htmlFor="security_package" className="block text-sm font-medium text-gray-700 mb-1">
              Security Package
            </label>
            <textarea
              id="security_package"
              name="security_package"
              value={formData.security_package}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe security, collateral, pledges..."
            />
          </div>
        </div>
      )}

      {/* SECTION 3: PROJECT DETAILS */}
      {activeSection === 'project' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>

          {/* Project Name */}
          <div>
            <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="project_name"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Gobi Solar Farm Phase 1"
            />
          </div>

          {/* Project Capacity */}
          <div>
            <label htmlFor="project_capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Project Capacity
            </label>
            <input
              type="text"
              id="project_capacity"
              name="project_capacity"
              value={formData.project_capacity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50 MW, 100,000 bpd, 1,000 km"
            />
          </div>

          {/* Project Description */}
          <div>
            <label htmlFor="project_description" className="block text-sm font-medium text-gray-700 mb-1">
              Project Description
            </label>
            <textarea
              id="project_description"
              name="project_description"
              value={formData.project_description}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed project description, scope, timeline, key milestones..."
            />
          </div>
        </div>
      )}

      {/* SECTION 4: DOCUMENTATION */}
      {activeSection === 'documentation' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Documentation & Risks</h3>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deal Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="General deal description, background, context..."
            />
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
              placeholder="Internal notes, reminders, action items..."
            />
          </div>

          {/* Key Risks */}
          <div>
            <label htmlFor="key_risks" className="block text-sm font-medium text-gray-700 mb-1">
              Key Risks
            </label>
            <textarea
              id="key_risks"
              name="key_risks"
              value={formData.key_risks}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Key risks identified in this transaction..."
            />
          </div>

          {/* Mitigants */}
          <div>
            <label htmlFor="mitigants" className="block text-sm font-medium text-gray-700 mb-1">
              Mitigants
            </label>
            <textarea
              id="mitigants"
              name="mitigants"
              value={formData.mitigants}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Risk mitigation strategies and structures..."
            />
          </div>
        </div>
      )}

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
          {initialData ? 'Save Changes' : 'Create Deal'}
        </button>
      </div>
    </form>
  );
};

export default DealForm;
