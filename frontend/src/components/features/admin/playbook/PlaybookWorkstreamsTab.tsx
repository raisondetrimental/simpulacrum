/**
 * Playbook Workstreams Tab
 * Hierarchical tree view with parent tasks and subtasks, completion tracking
 */

import React, { useState, useEffect } from 'react';
import {
  getPlaybookWorkstreams,
  createPlaybookWorkstream,
  updatePlaybookWorkstream,
  deletePlaybookWorkstream,
  toggleWorkstreamCompletion,
  createSubtask
} from '../../../../services/playbookService';
import { PlaybookWorkstream, PlaybookSubtask, FormStatus, WORKSTREAM_CLASSIFIERS } from '../../../../types/playbook';

const PlaybookWorkstreamsTab: React.FC = () => {
  const [workstreams, setWorkstreams] = useState<PlaybookWorkstream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkstream, setEditingWorkstream] = useState<PlaybookWorkstream | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showClassifierGuide, setShowClassifierGuide] = useState(false);

  // Subtask creation modal state
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [parentWorkstreamId, setParentWorkstreamId] = useState<string | null>(null);
  const [subtaskFormData, setSubtaskFormData] = useState({
    process: '',
    category: '',
    deliverable: ''
  });

  const [formData, setFormData] = useState<Omit<PlaybookWorkstream, 'id'>>({
    mission_goal: '',
    process: '',
    category: '',
    deliverable: '',
    done: false,
    key: '',
    description: '',
    completed: false,
    subtasks: []
  });

  useEffect(() => {
    fetchWorkstreams();
  }, []);

  const fetchWorkstreams = async () => {
    try {
      setLoading(true);
      const response = await getPlaybookWorkstreams();
      if (response.success && response.data) {
        setWorkstreams(response.data);
        // Expand all by default
        const allIds = new Set(response.data.map(w => w.id));
        setExpandedIds(allIds);
      }
    } catch (error) {
      console.error('Error fetching workstreams:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleToggleCompletion = async (workstreamId: string, subtaskId?: string) => {
    try {
      const response = await toggleWorkstreamCompletion(workstreamId, subtaskId);
      if (response.success) {
        fetchWorkstreams();
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const handleOpenModal = (workstream?: PlaybookWorkstream) => {
    if (workstream) {
      setEditingWorkstream(workstream);
      setFormData({
        mission_goal: workstream.mission_goal,
        process: workstream.process,
        category: workstream.category,
        deliverable: workstream.deliverable,
        done: workstream.done,
        key: workstream.key,
        description: workstream.description,
        completed: workstream.completed,
        subtasks: workstream.subtasks
      });
    } else {
      setEditingWorkstream(null);
      setFormData({
        mission_goal: '',
        process: '',
        category: '',
        deliverable: '',
        done: false,
        key: '',
        description: '',
        completed: false,
        subtasks: []
      });
    }
    setShowModal(true);
    setFormStatus('idle');
    setStatusMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('saving');

    try {
      if (editingWorkstream) {
        const response = await updatePlaybookWorkstream(editingWorkstream.id, formData);
        if (response.success) {
          setFormStatus('success');
          setStatusMessage('Workstream updated successfully!');
          fetchWorkstreams();
          setTimeout(() => setShowModal(false), 1500);
        }
      } else {
        const response = await createPlaybookWorkstream(formData);
        if (response.success) {
          setFormStatus('success');
          setStatusMessage('Workstream created successfully!');
          fetchWorkstreams();
          setTimeout(() => setShowModal(false), 1500);
        }
      }
    } catch (error: any) {
      setFormStatus('error');
      setStatusMessage(error.message || 'Failed to save workstream');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workstream and all its subtasks?')) return;
    try {
      const response = await deletePlaybookWorkstream(id);
      if (response.success) fetchWorkstreams();
    } catch (error) {
      alert('Failed to delete workstream');
    }
  };

  const handleOpenSubtaskModal = (workstreamId: string) => {
    setParentWorkstreamId(workstreamId);
    setSubtaskFormData({
      process: '',
      category: '',
      deliverable: ''
    });
    setShowSubtaskModal(true);
    setFormStatus('idle');
    setStatusMessage('');
  };

  const handleSubmitSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentWorkstreamId) return;

    setFormStatus('saving');

    try {
      const response = await createSubtask(parentWorkstreamId, subtaskFormData);
      if (response.success) {
        setFormStatus('success');
        setStatusMessage('Subtask created successfully!');
        fetchWorkstreams();
        setTimeout(() => setShowSubtaskModal(false), 1500);
      }
    } catch (error: any) {
      setFormStatus('error');
      setStatusMessage(error.message || 'Failed to create subtask');
    }
  };

  // Group workstreams by category and add sequential numbering
  const getGroupedWorkstreams = () => {
    const grouped: { [key: string]: PlaybookWorkstream[] } = {};

    workstreams.forEach(ws => {
      const category = ws.key?.toUpperCase() || 'OTHER';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(ws);
    });

    return grouped;
  };

  const getCategoryNumber = (workstream: PlaybookWorkstream): string => {
    const category = workstream.key?.toUpperCase() || 'OTHER';
    const grouped = getGroupedWorkstreams();
    const categoryWorkstreams = grouped[category] || [];
    const index = categoryWorkstreams.findIndex(ws => ws.id === workstream.id);
    return `${category}${index + 1}`;
  };

  const getKeyBadgeColor = (key: string): string => {
    if (!key) return 'bg-gray-200 text-gray-700';
    const lower = key.toLowerCase();
    if (lower.includes('a')) return 'bg-indigo-100 text-indigo-700';
    if (lower.includes('b')) return 'bg-sky-100 text-sky-700';
    if (lower.includes('c')) return 'bg-emerald-100 text-emerald-700';
    if (lower.includes('d')) return 'bg-amber-100 text-amber-700';
    if (lower.includes('e')) return 'bg-rose-100 text-rose-700';
    if (lower.includes('o')) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-200 text-gray-700';
  };

  if (loading) return <div className="text-center py-8">Loading workstreams...</div>;

  return (
    <div>
      {/* Classifier Reference Guide */}
      <div className="mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <button
          onClick={() => setShowClassifierGuide(!showClassifierGuide)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-blue-900">Workstream Classifiers Reference</span>
          </div>
          <svg
            className={`w-5 h-5 text-blue-600 transition-transform ${showClassifierGuide ? 'transform rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {showClassifierGuide && (
          <div className="px-4 pb-4 pt-2">
            <p className="text-sm text-blue-800 mb-3">
              Each workstream is categorized using a classifier letter. The number after the letter indicates the sequence within that category (auto-generated).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WORKSTREAM_CLASSIFIERS.map(classifier => (
                <div key={classifier.key} className="flex items-start space-x-2 text-sm">
                  <span className={`px-2 py-1 font-bold rounded ${getKeyBadgeColor(classifier.key)}`}>
                    {classifier.key}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">{classifier.label}</div>
                    <div className="text-gray-600 text-xs">{classifier.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Workstreams</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setExpandedIds(new Set(workstreams.map(w => w.id)))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedIds(new Set())}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Collapse All
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Workstream
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {workstreams.map((workstream) => {
          const isExpanded = expandedIds.has(workstream.id);
          const hasSubtasks = workstream.subtasks && workstream.subtasks.length > 0;

          return (
            <div key={workstream.id} className="border border-gray-300 rounded-lg bg-white">
              {/* Parent Task */}
              <div className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  {/* Expand/Collapse Button */}
                  {hasSubtasks && (
                    <button
                      onClick={() => toggleExpanded(workstream.id)}
                      className="mt-1 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                  {!hasSubtasks && <div className="w-5"></div>}

                  {/* Completion Checkbox */}
                  <input
                    type="checkbox"
                    checked={workstream.completed}
                    onChange={() => handleToggleCompletion(workstream.id)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 text-sm font-bold rounded-md ${getKeyBadgeColor(workstream.key)}`}>
                        {getCategoryNumber(workstream)}
                      </span>
                      <h4 className={`font-semibold text-gray-900 ${workstream.completed ? 'line-through' : ''}`}>
                        {workstream.mission_goal}
                      </h4>
                      {workstream.description && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                          {workstream.description}
                        </span>
                      )}
                    </div>

                    {workstream.process && (
                      <div className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Process:</span> {workstream.process}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {workstream.deliverable && (
                        <div>
                          <span className="font-medium">Deliverable:</span> {workstream.deliverable}
                        </div>
                      )}
                      {workstream.category && workstream.category !== '-' && workstream.category !== '' && (
                        <div>
                          <span className="font-medium">Notes:</span> {workstream.category}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-1">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(workstream)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(workstream.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <button
                      onClick={() => handleOpenSubtaskModal(workstream.id)}
                      className="text-green-600 hover:text-green-900 text-sm whitespace-nowrap"
                    >
                      + Add Subtask
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              {hasSubtasks && isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  {workstream.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="px-4 py-3 ml-8 border-b border-gray-200 last:border-b-0 hover:bg-gray-100"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Subtask Checkbox */}
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => handleToggleCompletion(workstream.id, subtask.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />

                        {/* Subtask Content */}
                        <div className="flex-1 min-w-0">
                          {subtask.process && (
                            <div className={`text-sm text-gray-900 mb-1 ${subtask.completed ? 'line-through' : ''}`}>
                              {subtask.process}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            {subtask.category && subtask.category !== '' && (
                              <div>
                                <span className="font-medium">Category:</span> {subtask.category}
                              </div>
                            )}
                            {subtask.deliverable && subtask.deliverable !== '' && (
                              <div>
                                <span className="font-medium">Deliverable:</span> {subtask.deliverable}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {workstreams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No workstreams yet. Add your first workstream!
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingWorkstream ? 'Edit Workstream' : 'New Workstream'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mission Goal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mission_goal}
                    onChange={(e) => setFormData({ ...formData, mission_goal: e.target.value })}
                    placeholder="e.g., Onboarding, Global Infra Deep Dive Preparation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the task name without the classifier prefix (e.g., "Onboarding" not "O1 Onboarding")
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Process</label>
                  <textarea
                    rows={3}
                    value={formData.process}
                    onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                    placeholder="Describe the process or main task..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classifier *
                  </label>
                  <select
                    required
                    value={formData.key}
                    onChange={(e) => {
                      const selectedClassifier = WORKSTREAM_CLASSIFIERS.find(c => c.key === e.target.value);
                      setFormData({
                        ...formData,
                        key: e.target.value,
                        description: selectedClassifier?.label || ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select classifier...</option>
                    {WORKSTREAM_CLASSIFIERS.map(classifier => (
                      <option key={classifier.key} value={classifier.key}>
                        {classifier.key} - {classifier.label} ({classifier.description})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    The classifier determines the category of this workstream. The number will be auto-generated.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deliverable</label>
                  <textarea
                    rows={2}
                    value={formData.deliverable}
                    onChange={(e) => setFormData({ ...formData, deliverable: e.target.value })}
                    placeholder="Expected deliverable or outcome..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Any additional categorization or notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {statusMessage && (
                  <div
                    className={`p-3 rounded-md ${
                      formStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={formStatus === 'saving'}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formStatus === 'saving'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {formStatus === 'saving'
                      ? 'Saving...'
                      : editingWorkstream
                      ? 'Update'
                      : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Subtask Modal */}
      {showSubtaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Add Subtask</h2>
              <form onSubmit={handleSubmitSubtask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Process / Task Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={subtaskFormData.process}
                    onChange={(e) => setSubtaskFormData({ ...subtaskFormData, process: e.target.value })}
                    placeholder="Describe the subtask..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtaskFormData.category}
                    onChange={(e) => setSubtaskFormData({ ...subtaskFormData, category: e.target.value })}
                    placeholder="e.g., Research, Development, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deliverable (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtaskFormData.deliverable}
                    onChange={(e) => setSubtaskFormData({ ...subtaskFormData, deliverable: e.target.value })}
                    placeholder="Expected deliverable or outcome..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {statusMessage && (
                  <div
                    className={`p-3 rounded-md ${
                      formStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSubtaskModal(false)}
                    disabled={formStatus === 'saving'}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formStatus === 'saving'}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {formStatus === 'saving' ? 'Creating...' : 'Create Subtask'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookWorkstreamsTab;
