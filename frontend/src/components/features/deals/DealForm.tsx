/**
 * Deal Form Component
 * Comprehensive form for creating/editing deals with 40+ fields
 */

import React, { useState, useEffect } from 'react';
import {
  Deal,
  DealFormData,
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

    // Financial Terms (Debt)
    total_size: initialData?.total_size || 0,
    currency: initialData?.currency || 'USD',
    structure: initialData?.structure || 'Senior Secured',
    pricing: initialData?.pricing || '',
    spread_bps: initialData?.spread_bps || 0,
    all_in_rate: initialData?.all_in_rate || 0,
    maturity: initialData?.maturity || '',

    // Fees (Debt)
    upfront_fee_bps: initialData?.upfront_fee_bps || 0,
    commitment_fee_bps: initialData?.commitment_fee_bps || 0,
    agency_fee: initialData?.agency_fee || 0,

    // Equity-Specific Terms
    equity_percentage: initialData?.equity_percentage || undefined,
    pre_money_valuation: initialData?.pre_money_valuation || undefined,
    post_money_valuation: initialData?.post_money_valuation || undefined,
    target_irr: initialData?.target_irr || undefined,
    target_multiple: initialData?.target_multiple || undefined,
    liquidation_preference: initialData?.liquidation_preference || '',
    board_seats: initialData?.board_seats || undefined,
    governance_rights: initialData?.governance_rights || '',
    drag_along_rights: initialData?.drag_along_rights || false,
    tag_along_rights: initialData?.tag_along_rights || false,
    anti_dilution_protection: initialData?.anti_dilution_protection || '',

    // JV-Specific Terms
    jv_ownership_split: initialData?.jv_ownership_split || '',
    capital_contribution: initialData?.capital_contribution || '',
    profit_sharing_ratio: initialData?.profit_sharing_ratio || '',
    management_structure: initialData?.management_structure || '',
    voting_rights: initialData?.voting_rights || '',

    // Mezzanine-Specific Terms
    pik_rate: initialData?.pik_rate || undefined,
    equity_kicker: initialData?.equity_kicker || undefined,
    warrant_coverage: initialData?.warrant_coverage || undefined,
    conversion_price: initialData?.conversion_price || undefined,
    conversion_ratio: initialData?.conversion_ratio || '',
    redemption_premium: initialData?.redemption_premium || undefined,

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
    if (formData.sector && !DEAL_SUB_SECTORS[formData.sector].includes(formData.sub_sector || '')) {
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
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

          {/* Deal Size & Currency (Common for all types) */}
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

          {/* DEBT-SPECIFIC FIELDS */}
          {(formData.deal_type === 'project_finance' || formData.deal_type === 'corporate_loan' ||
            formData.deal_type === 'bond' || formData.deal_type === 'bridge_loan' ||
            formData.deal_type === 'term_loan' || formData.deal_type === 'revolving_credit' ||
            formData.deal_type === 'hybrid') && (
            <>
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Debt Terms</h4>

                {/* Structure & Maturity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <div className="mb-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            </>
          )}

          {/* EQUITY-SPECIFIC FIELDS */}
          {(formData.deal_type === 'equity' || formData.deal_type === 'hybrid') && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Equity Terms</h4>

              {/* Equity Percentage & Valuations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="equity_percentage" className="block text-sm font-medium text-gray-700 mb-1">
                    Equity Stake (%)
                  </label>
                  <input
                    type="number"
                    id="equity_percentage"
                    name="equity_percentage"
                    value={formData.equity_percentage || ''}
                    onChange={handleNumberChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label htmlFor="pre_money_valuation" className="block text-sm font-medium text-gray-700 mb-1">
                    Pre-Money Valuation
                  </label>
                  <input
                    type="number"
                    id="pre_money_valuation"
                    name="pre_money_valuation"
                    value={formData.pre_money_valuation || ''}
                    onChange={handleNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="post_money_valuation" className="block text-sm font-medium text-gray-700 mb-1">
                    Post-Money Valuation
                  </label>
                  <input
                    type="number"
                    id="post_money_valuation"
                    name="post_money_valuation"
                    value={formData.post_money_valuation || ''}
                    onChange={handleNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Return Targets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="target_irr" className="block text-sm font-medium text-gray-700 mb-1">
                    Target IRR (%)
                  </label>
                  <input
                    type="number"
                    id="target_irr"
                    name="target_irr"
                    value={formData.target_irr || ''}
                    onChange={handleNumberChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="target_multiple" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Multiple (x)
                  </label>
                  <input
                    type="number"
                    id="target_multiple"
                    name="target_multiple"
                    value={formData.target_multiple || ''}
                    onChange={handleNumberChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Governance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="board_seats" className="block text-sm font-medium text-gray-700 mb-1">
                    Board Seats
                  </label>
                  <input
                    type="number"
                    id="board_seats"
                    name="board_seats"
                    value={formData.board_seats || ''}
                    onChange={handleNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="liquidation_preference" className="block text-sm font-medium text-gray-700 mb-1">
                    Liquidation Preference
                  </label>
                  <input
                    type="text"
                    id="liquidation_preference"
                    name="liquidation_preference"
                    value={formData.liquidation_preference || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1x non-participating, 2x participating"
                  />
                </div>
              </div>

              {/* Protection Rights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="drag_along_rights"
                    name="drag_along_rights"
                    checked={formData.drag_along_rights || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="drag_along_rights" className="ml-2 block text-sm text-gray-700">
                    Drag-Along Rights
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tag_along_rights"
                    name="tag_along_rights"
                    checked={formData.tag_along_rights || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="tag_along_rights" className="ml-2 block text-sm text-gray-700">
                    Tag-Along Rights
                  </label>
                </div>

                <div>
                  <label htmlFor="anti_dilution_protection" className="block text-sm font-medium text-gray-700 mb-1">
                    Anti-Dilution
                  </label>
                  <select
                    id="anti_dilution_protection"
                    name="anti_dilution_protection"
                    value={formData.anti_dilution_protection || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="full_ratchet">Full Ratchet</option>
                    <option value="weighted_average_broad">Weighted Average (Broad)</option>
                    <option value="weighted_average_narrow">Weighted Average (Narrow)</option>
                  </select>
                </div>
              </div>

              {/* Governance Rights */}
              <div>
                <label htmlFor="governance_rights" className="block text-sm font-medium text-gray-700 mb-1">
                  Governance Rights
                </label>
                <textarea
                  id="governance_rights"
                  name="governance_rights"
                  value={formData.governance_rights || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe veto rights, information rights, etc..."
                />
              </div>
            </div>
          )}

          {/* JV-SPECIFIC FIELDS */}
          {(formData.deal_type === 'hybrid') && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Joint Venture Terms</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="jv_ownership_split" className="block text-sm font-medium text-gray-700 mb-1">
                    Ownership Split
                  </label>
                  <input
                    type="text"
                    id="jv_ownership_split"
                    name="jv_ownership_split"
                    value={formData.jv_ownership_split || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 60/40, 51/49"
                  />
                </div>

                <div>
                  <label htmlFor="profit_sharing_ratio" className="block text-sm font-medium text-gray-700 mb-1">
                    Profit Sharing Ratio
                  </label>
                  <input
                    type="text"
                    id="profit_sharing_ratio"
                    name="profit_sharing_ratio"
                    value={formData.profit_sharing_ratio || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Proportional, 50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="capital_contribution" className="block text-sm font-medium text-gray-700 mb-1">
                    Capital Contribution
                  </label>
                  <textarea
                    id="capital_contribution"
                    name="capital_contribution"
                    value={formData.capital_contribution || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe capital contribution structure..."
                  />
                </div>

                <div>
                  <label htmlFor="voting_rights" className="block text-sm font-medium text-gray-700 mb-1">
                    Voting Rights
                  </label>
                  <textarea
                    id="voting_rights"
                    name="voting_rights"
                    value={formData.voting_rights || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe voting structure..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="management_structure" className="block text-sm font-medium text-gray-700 mb-1">
                  Management Structure
                </label>
                <textarea
                  id="management_structure"
                  name="management_structure"
                  value={formData.management_structure || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe management and decision-making structure..."
                />
              </div>
            </div>
          )}

          {/* MEZZANINE-SPECIFIC FIELDS */}
          {(formData.deal_type === 'mezzanine' || formData.deal_type === 'hybrid') && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Mezzanine Terms</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="pik_rate" className="block text-sm font-medium text-gray-700 mb-1">
                    PIK Rate (%)
                  </label>
                  <input
                    type="number"
                    id="pik_rate"
                    name="pik_rate"
                    value={formData.pik_rate || ''}
                    onChange={handleNumberChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Payment-in-Kind rate</p>
                </div>

                <div>
                  <label htmlFor="equity_kicker" className="block text-sm font-medium text-gray-700 mb-1">
                    Equity Kicker (%)
                  </label>
                  <input
                    type="number"
                    id="equity_kicker"
                    name="equity_kicker"
                    value={formData.equity_kicker || ''}
                    onChange={handleNumberChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="warrant_coverage" className="block text-sm font-medium text-gray-700 mb-1">
                    Warrant Coverage (%)
                  </label>
                  <input
                    type="number"
                    id="warrant_coverage"
                    name="warrant_coverage"
                    value={formData.warrant_coverage || ''}
                    onChange={handleNumberChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="conversion_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Conversion Price
                  </label>
                  <input
                    type="number"
                    id="conversion_price"
                    name="conversion_price"
                    value={formData.conversion_price || ''}
                    onChange={handleNumberChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="conversion_ratio" className="block text-sm font-medium text-gray-700 mb-1">
                    Conversion Ratio
                  </label>
                  <input
                    type="text"
                    id="conversion_ratio"
                    name="conversion_ratio"
                    value={formData.conversion_ratio || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1:1, 2:1"
                  />
                </div>

                <div>
                  <label htmlFor="redemption_premium" className="block text-sm font-medium text-gray-700 mb-1">
                    Redemption Premium (%)
                  </label>
                  <input
                    type="number"
                    id="redemption_premium"
                    name="redemption_premium"
                    value={formData.redemption_premium || ''}
                    onChange={handleNumberChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}
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
