/**
 * Deal Precedents Editor Component
 * Allows adding, editing, and deleting deal precedents
 */

import React, { useState } from 'react';
import { DealPrecedent, DEAL_STRUCTURES, DEAL_CURRENCIES } from '../../types/liquidity';

interface DealPrecedentsEditorProps {
  deals: DealPrecedent[];
  onChange: (deals: DealPrecedent[]) => void;
}

const DealPrecedentsEditor: React.FC<DealPrecedentsEditorProps> = ({
  deals,
  onChange
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DealPrecedent>>({
    deal_date: '',
    deal_name: '',
    structure: 'Senior Secured',
    pricing: '',
    spread_bps: 0,
    currency: 'USD',
    size: 0,
    maturity: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      deal_date: '',
      deal_name: '',
      structure: 'Senior Secured',
      pricing: '',
      spread_bps: 0,
      currency: 'USD',
      size: 0,
      maturity: '',
      notes: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Reset form data but DON'T reset isAdding/editingId flags
    setFormData({
      deal_date: '',
      deal_name: '',
      structure: 'Senior Secured',
      pricing: '',
      spread_bps: 0,
      currency: 'USD',
      size: 0,
      maturity: '',
      notes: ''
    });

    // Now set the flags
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (deal: DealPrecedent, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setFormData(deal);
    setEditingId(deal.id);
    setIsAdding(false);
  };

  const handleSave = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!formData.deal_name || !formData.deal_date) {
      alert('Please provide deal name and date');
      return;
    }

    if (editingId) {
      // Update existing deal
      const updatedDeals = deals.map(d =>
        d.id === editingId ? { ...formData, id: editingId, created_at: d.created_at } as DealPrecedent : d
      );
      onChange(updatedDeals);
    } else {
      // Add new deal
      const newDeal: DealPrecedent = {
        ...formData,
        id: `deal_${Date.now()}`,
        created_at: new Date().toISOString()
      } as DealPrecedent;
      onChange([...deals, newDeal]);
    }

    resetForm();
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this deal precedent?')) {
      onChange(deals.filter(d => d.id !== id));
    }
  };

  const handleChange = (field: keyof DealPrecedent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (!amount || amount === 0) return 'N/A';
    if (amount >= 1_000_000_000) {
      return `${currency} ${(amount / 1_000_000_000).toFixed(2)}B`;
    } else if (amount >= 1_000_000) {
      return `${currency} ${(amount / 1_000_000).toFixed(2)}M`;
    } else {
      return `${currency} ${amount.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Deal Precedents
          {deals.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
            </span>
          )}
        </h3>
        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Add Deal
          </button>
        )}
      </div>

      {/* Deal Form (Add or Edit) */}
      {(isAdding || editingId) && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {editingId ? 'Edit Deal Precedent' : 'Add New Deal Precedent'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deal Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.deal_date || ''}
                onChange={(e) => handleChange('deal_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Deal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.deal_name || ''}
                onChange={(e) => handleChange('deal_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Project ABC Financing"
                required
              />
            </div>

            {/* Structure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Structure
              </label>
              <select
                value={formData.structure || 'Senior Secured'}
                onChange={(e) => handleChange('structure', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEAL_STRUCTURES.map(structure => (
                  <option key={structure} value={structure}>{structure}</option>
                ))}
              </select>
            </div>

            {/* Pricing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pricing
              </label>
              <input
                type="text"
                value={formData.pricing || ''}
                onChange={(e) => handleChange('pricing', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SOFR+350"
              />
            </div>

            {/* Spread (bps) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spread (bps)
              </label>
              <input
                type="number"
                value={formData.spread_bps || 0}
                onChange={(e) => handleChange('spread_bps', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 350"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency || 'USD'}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEAL_CURRENCIES.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size (in base currency)
              </label>
              <input
                type="number"
                value={formData.size || 0}
                onChange={(e) => handleChange('size', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100000000"
              />
            </div>

            {/* Maturity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maturity
              </label>
              <input
                type="text"
                value={formData.maturity || ''}
                onChange={(e) => handleChange('maturity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5 years"
              />
            </div>

            {/* Notes (full width) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional details about this deal..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={(e) => handleSave(e)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
            >
              {editingId ? 'Update Deal' : 'Save Deal'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetForm();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Deals List */}
      {deals.length > 0 ? (
        <div className="space-y-2">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{deal.deal_name}</h4>
                    <span className="text-xs text-gray-500">{formatDate(deal.deal_date)}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Structure:</span>
                      <p className="font-medium text-gray-900">{deal.structure}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pricing:</span>
                      <p className="font-medium text-gray-900">{deal.pricing || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Spread:</span>
                      <p className="font-medium text-gray-900">{deal.spread_bps || 'N/A'} bps</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Size:</span>
                      <p className="font-medium text-gray-900">{formatCurrency(deal.size, deal.currency)}</p>
                    </div>
                  </div>

                  {deal.notes && (
                    <p className="mt-2 text-sm text-gray-600">{deal.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={(e) => handleEdit(deal, e)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(deal.id, e)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && !editingId && (
          <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            No deal precedents yet. Click "Add Deal" to record your first deal.
          </div>
        )
      )}
    </div>
  );
};

export default DealPrecedentsEditor;
