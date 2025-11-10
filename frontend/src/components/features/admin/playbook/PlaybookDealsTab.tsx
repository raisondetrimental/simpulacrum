/**
 * Playbook Deal Flow Tab
 * Track deal pipeline with financial metrics (separate from main deals)
 */

import React, { useState, useEffect } from 'react';
import {
  getPlaybookDeals,
  createPlaybookDeal,
  updatePlaybookDeal,
  deletePlaybookDeal
} from '../../../../services/playbookService';
import { PlaybookDeal, CURRENCIES, FormStatus } from '../../../../types/playbook';

const PlaybookDealsTab: React.FC = () => {
  const [deals, setDeals] = useState<PlaybookDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingDeal, setViewingDeal] = useState<PlaybookDeal | null>(null);
  const [editingDeal, setEditingDeal] = useState<PlaybookDeal | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');

  const [formData, setFormData] = useState<Omit<PlaybookDeal, 'id'>>({
    mu_id: '',
    deal_acronym: '',
    deal: '',
    fx: 'USD',
    total_facility: null,
    sponsor: '',
    financial_close: null,
    lead: '',
    type: '',
    security: '',
    benchmark: '',
    benchmark_value: null,
    spread: null,
    rate: null
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await getPlaybookDeals();
      if (response.success && response.data) {
        setDeals(response.data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeal = (deal: PlaybookDeal) => {
    setViewingDeal(deal);
    setShowDetailModal(true);
  };

  const handleOpenModal = (deal?: PlaybookDeal) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        mu_id: deal.mu_id,
        deal_acronym: deal.deal_acronym,
        deal: deal.deal,
        fx: deal.fx,
        total_facility: deal.total_facility,
        sponsor: deal.sponsor,
        financial_close: deal.financial_close,
        lead: deal.lead,
        type: deal.type,
        security: deal.security,
        benchmark: deal.benchmark,
        benchmark_value: deal.benchmark_value,
        spread: deal.spread,
        rate: deal.rate
      });
    } else {
      setEditingDeal(null);
      setFormData({
        mu_id: '',
        deal_acronym: '',
        deal: '',
        fx: 'USD',
        total_facility: null,
        sponsor: '',
        financial_close: null,
        lead: '',
        type: '',
        security: '',
        benchmark: '',
        benchmark_value: null,
        spread: null,
        rate: null
      });
    }
    setShowModal(true);
    setFormStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('saving');

    try {
      if (editingDeal) {
        await updatePlaybookDeal(editingDeal.id, formData);
      } else {
        await createPlaybookDeal(formData);
      }
      setFormStatus('success');
      fetchDeals();
      setTimeout(() => setShowModal(false), 1000);
    } catch (error) {
      setFormStatus('error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deal?')) return;
    try {
      await deletePlaybookDeal(id);
      fetchDeals();
    } catch (error) {
      alert('Failed to delete deal');
    }
  };

  if (loading) return <div className="text-center py-8">Loading deals...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Deal Flow</h3>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Deal
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                MU ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Deal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sponsor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Lead
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deals.map((deal) => (
              <tr
                key={deal.id}
                onClick={() => handleViewDeal(deal)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3 text-sm">{deal.mu_id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{deal.deal}</div>
                  <div className="text-xs text-gray-500">{deal.deal_acronym}</div>
                </td>
                <td className="px-4 py-3 text-sm">{deal.sponsor}</td>
                <td className="px-4 py-3 text-sm">
                  {deal.total_facility
                    ? `${deal.fx} ${deal.total_facility.toLocaleString()}`
                    : '-'}
                </td>
                <td className="px-4 py-3 text-sm">{deal.lead}</td>
                <td
                  className="px-4 py-3 text-right text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleOpenModal(deal)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(deal.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingDeal ? 'Edit Deal' : 'New Deal'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">MU ID</label>
                    <input
                      type="text"
                      value={formData.mu_id}
                      onChange={(e) => setFormData({ ...formData, mu_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deal Acronym</label>
                    <input
                      type="text"
                      value={formData.deal_acronym}
                      onChange={(e) => setFormData({ ...formData, deal_acronym: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lead (Initials)</label>
                    <input
                      type="text"
                      value={formData.lead}
                      onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deal Name</label>
                  <input
                    type="text"
                    value={formData.deal}
                    onChange={(e) => setFormData({ ...formData, deal: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sponsor</label>
                  <input
                    type="text"
                    value={formData.sponsor}
                    onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <select
                      value={formData.fx}
                      onChange={(e) => setFormData({ ...formData, fx: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Facility</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.total_facility || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_facility: e.target.value ? parseFloat(e.target.value) : null
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Spread (bps)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.spread || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spread: e.target.value ? parseFloat(e.target.value) : null
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Benchmark</label>
                    <input
                      type="text"
                      value={formData.benchmark}
                      onChange={(e) => setFormData({ ...formData, benchmark: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rate || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate: e.target.value ? parseFloat(e.target.value) : null
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formStatus === 'saving'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {formStatus === 'saving' ? 'Saving...' : editingDeal ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {showDetailModal && viewingDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Deal Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">MU ID</label>
                    <p className="text-gray-900 font-semibold">{viewingDeal.mu_id || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Deal Acronym</label>
                    <p className="text-gray-900">{viewingDeal.deal_acronym || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Lead</label>
                    <p className="text-gray-900">{viewingDeal.lead || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Deal Name</label>
                  <p className="text-lg font-semibold text-gray-900">{viewingDeal.deal || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Sponsor</label>
                  <p className="text-gray-900">{viewingDeal.sponsor || '-'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Total Facility</label>
                    <p className="text-gray-900 font-semibold">
                      {viewingDeal.total_facility
                        ? `${viewingDeal.fx} ${viewingDeal.total_facility.toLocaleString()}`
                        : '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Financial Close</label>
                    <p className="text-gray-900">
                      {viewingDeal.financial_close
                        ? new Date(viewingDeal.financial_close).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Deal Type</label>
                    <p className="text-gray-900">{viewingDeal.type || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Security</label>
                    <p className="text-gray-900">{viewingDeal.security || '-'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Financial Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Benchmark</label>
                      <p className="text-gray-900">{viewingDeal.benchmark || '-'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Benchmark Value</label>
                      <p className="text-gray-900">
                        {viewingDeal.benchmark_value !== null
                          ? `${(viewingDeal.benchmark_value * 100).toFixed(2)}%`
                          : '-'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Spread</label>
                      <p className="text-gray-900">
                        {viewingDeal.spread !== null ? `${viewingDeal.spread} bps` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Final Rate</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewingDeal.rate !== null ? `${(viewingDeal.rate * 100).toFixed(2)}%` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenModal(viewingDeal);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Deal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookDealsTab;
