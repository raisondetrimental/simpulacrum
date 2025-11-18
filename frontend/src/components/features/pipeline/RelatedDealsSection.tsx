import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Deal {
  id: string;
  deal_name: string;
  deal_number: string;
  country: string;
  sector: string;
  total_size: number;
  currency: string;
  status: string;
  deal_type: string;
}

interface RelatedDealsSectionProps {
  relatedDealIds: string[];
  onAddDeal: (dealId: string) => void;
  onRemoveDeal: (dealId: string) => void;
}

const RelatedDealsSection: React.FC<RelatedDealsSectionProps> = ({
  relatedDealIds,
  onAddDeal,
  onRemoveDeal
}) => {
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [relatedDeals, setRelatedDeals] = useState<Deal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    // Update related deals when IDs change
    const related = allDeals.filter(deal => relatedDealIds.includes(deal.id));
    setRelatedDeals(related);
  }, [relatedDealIds, allDeals]);

  const fetchDeals = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}/api/deals`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setAllDeals(data.data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const availableDeals = allDeals.filter(deal => {
    // Filter out already linked deals
    if (relatedDealIds.includes(deal.id)) return false;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        deal.deal_name?.toLowerCase().includes(search) ||
        deal.deal_number?.toLowerCase().includes(search) ||
        deal.country?.toLowerCase().includes(search) ||
        deal.sector?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const handleAddDeal = (dealId: string) => {
    onAddDeal(dealId);
    setSearchTerm('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Deals</h2>
          <p className="text-sm text-gray-600 mt-1">
            Link precedent transactions from the deals database for reference
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Related Deal
        </button>
      </div>

      {/* Related Deals List */}
      {relatedDeals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-medium">No related deals linked</p>
          <p className="text-sm text-gray-500 mt-1">
            Add precedent transactions to reference comparable deal structures and terms
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {relatedDeals.map((deal) => (
            <div
              key={deal.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/deals/${deal.id}`}
                      className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      {deal.deal_name}
                    </Link>
                    {deal.deal_number && (
                      <span className="text-sm text-gray-500 font-mono">
                        {deal.deal_number}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Country:</span>
                      <p className="font-medium text-gray-900">{deal.country}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Sector:</span>
                      <p className="font-medium text-gray-900 capitalize">{deal.sector}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Deal Size:</span>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(deal.total_size, deal.currency)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium text-gray-900 capitalize">{deal.deal_type}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveDeal(deal.id)}
                  className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Remove related deal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Add Related Deal</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Select a precedent transaction from the deals database
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search deals by name, number, country, or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Deals List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
                  <p className="text-gray-600 mt-4">Loading deals...</p>
                </div>
              ) : availableDeals.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">No deals found</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search terms
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {availableDeals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => {
                        handleAddDeal(deal.id);
                        setShowAddModal(false);
                      }}
                      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {deal.deal_name}
                        </span>
                        {deal.deal_number && (
                          <span className="text-sm text-gray-500 font-mono">
                            {deal.deal_number}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Country:</span>
                          <p className="font-medium text-gray-900">{deal.country}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Sector:</span>
                          <p className="font-medium text-gray-900 capitalize">{deal.sector}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Deal Size:</span>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(deal.total_size, deal.currency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="font-medium text-gray-900 capitalize">{deal.deal_type}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm('');
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatedDealsSection;
