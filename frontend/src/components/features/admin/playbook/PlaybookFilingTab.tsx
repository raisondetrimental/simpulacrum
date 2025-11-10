/**
 * Playbook Filing Instructions Tab
 * File organization and search instructions
 */

import React, { useState, useEffect } from 'react';
import {
  getPlaybookFiling,
  updatePlaybookFiling
} from '../../../../services/playbookService';
import { PlaybookFiling, FormStatus } from '../../../../types/playbook';

const PlaybookFilingTab: React.FC = () => {
  const [filing, setFiling] = useState<PlaybookFiling>({ content: '' });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchFiling();
  }, []);

  const fetchFiling = async () => {
    try {
      setLoading(true);
      const response = await getPlaybookFiling();
      if (response.success && response.data) {
        setFiling(response.data);
        setEditContent(response.data.content);
      }
    } catch (error) {
      console.error('Error fetching filing instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditContent(filing.content);
    setFormStatus('idle');
    setStatusMessage('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEditContent(filing.content);
    setFormStatus('idle');
    setStatusMessage('');
  };

  const handleSave = async () => {
    setFormStatus('saving');

    try {
      const response = await updatePlaybookFiling({ content: editContent });
      if (response.success && response.data) {
        setFiling(response.data);
        setFormStatus('success');
        setStatusMessage('Filing instructions updated successfully!');
        setTimeout(() => {
          setEditing(false);
          setStatusMessage('');
        }, 2000);
      }
    } catch (error: any) {
      setFormStatus('error');
      setStatusMessage(error.message || 'Failed to update filing instructions');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading filing instructions...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Filing Instructions</h3>
        {!editing && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Instructions
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions Content
            </label>
            <textarea
              rows={15}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Enter filing and search instructions for the team..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter instructions for file organization, naming conventions, and search tips.
            </p>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-md ${
                formStatus === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              disabled={formStatus === 'saving'}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={formStatus === 'saving'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {formStatus === 'saving' ? 'Saving...' : 'Save Instructions'}
            </button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          {filing.content ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {filing.content}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">
                No filing instructions yet. Click "Edit Instructions" to add them.
              </p>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Instructions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaybookFilingTab;
