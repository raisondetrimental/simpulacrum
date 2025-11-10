/**
 * Countries Master Manager Page
 * Admin interface for managing the master list of countries
 * Super admin only
 */

import React, { useState, useEffect } from 'react';
import {
  getCountriesMaster,
  createCountry,
  updateCountry,
  deactivateCountry,
  getCountryUsage,
  downloadCountryPreferencesCSV,
  downloadCountryMatrixCSV
} from '../../services/countriesMasterService';
import { Country, CountryUsage } from '../../types/countriesMaster';

const CountriesMasterManager: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [usage, setUsage] = useState<CountryUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', active: true });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [countriesData, usageData] = await Promise.all([
        getCountriesMaster(),
        getCountryUsage()
      ]);
      setCountries(countriesData);
      setUsage(usageData);
    } catch (err) {
      setError('Failed to load countries data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      setError('');
      await createCountry(formData);
      setShowAddForm(false);
      setFormData({ id: '', name: '', active: true });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add country');
    }
  };

  const handleUpdate = async () => {
    if (!editingCountry) return;
    try {
      setError('');
      await updateCountry(editingCountry.id, {
        name: formData.name,
        active: formData.active
      });
      setEditingCountry(null);
      setFormData({ id: '', name: '', active: true });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update country');
    }
  };

  const handleDeactivate = async (countryId: string) => {
    if (!confirm('Are you sure you want to deactivate this country? It will no longer be available for selection.')) {
      return;
    }
    try {
      setError('');
      await deactivateCountry(countryId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate country');
    }
  };

  const startEdit = (country: Country) => {
    setEditingCountry(country);
    setFormData({ id: country.id, name: country.name, active: country.active });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingCountry(null);
    setShowAddForm(false);
    setFormData({ id: '', name: '', active: true });
    setError('');
  };

  const getUsageForCountry = (countryId: string) => {
    return usage.find(u => u.id === countryId)?.count || 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading countries...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Countries Master Manager</h1>
        <p className="mt-2 text-gray-600">
          Manage the master list of countries for investment preferences
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingCountry(null);
            setFormData({ id: '', name: '', active: true });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add New Country
        </button>
        <button
          onClick={() => downloadCountryPreferencesCSV()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export Country Preferences CSV
        </button>
        <button
          onClick={() => downloadCountryMatrixCSV()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Export Matrix CSV
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingCountry) && (
        <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingCountry ? 'Edit Country' : 'Add New Country'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country ID {!editingCountry && <span className="text-red-600">*</span>}
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase() })}
                disabled={!!editingCountry}
                className="w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100"
                placeholder="e.g., chile, brazil"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lowercase, used for data storage (cannot be changed after creation)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="e.g., Chile, Brazil"
              />
              <p className="mt-1 text-xs text-gray-500">
                Display name shown in dropdowns
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4"
            />
            <label className="text-sm text-gray-700">Active (available for selection)</label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={editingCountry ? handleUpdate : handleAdd}
              disabled={!formData.id.trim() || !formData.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
            >
              {editingCountry ? 'Update' : 'Add'} Country
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Countries Table */}
      <div className="bg-white border border-gray-300 rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Display Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {countries.map((country) => (
              <tr key={country.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  {country.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {country.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {country.active ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getUsageForCountry(country.id)} organizations
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {country.display_order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => startEdit(country)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Edit
                  </button>
                  {country.active && (
                    <button
                      onClick={() => handleDeactivate(country.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Usage Statistics */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
        <div className="bg-white border border-gray-300 rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Organizations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  By Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usage.map((stat) => (
                <tr key={stat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {stat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {stat.count}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {Object.entries(stat.by_type || {}).map(([type, count]) => (
                      <span key={type} className="mr-3">
                        {type}: {count}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CountriesMasterManager;
