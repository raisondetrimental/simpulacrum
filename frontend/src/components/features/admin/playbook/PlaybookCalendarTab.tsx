/**
 * Playbook Calendar Tab
 * Sortable table view with date highlighting and weekend graying
 */

import React, { useState, useEffect } from 'react';
import {
  getPlaybookCalendar,
  createPlaybookCalendarEntry,
  updatePlaybookCalendarEntry,
  deletePlaybookCalendarEntry,
  getPlaybookWorkstreams
} from '../../../../services/playbookService';
import { PlaybookCalendarEntry, PlaybookWorkstream, FormStatus } from '../../../../types/playbook';
import WorkstreamMultiSelect from '../../../ui/WorkstreamMultiSelect';

type SortKey = 'date' | 'tasks' | 'where' | 'internal_ents' | 'external_ents' | 'other_external' | 'other_notes';

const PlaybookCalendarTab: React.FC = () => {
  const [entries, setEntries] = useState<PlaybookCalendarEntry[]>([]);
  const [workstreams, setWorkstreams] = useState<PlaybookWorkstream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PlaybookCalendarEntry | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedWorkstreamCodes, setSelectedWorkstreamCodes] = useState<string[]>([]);

  const [formData, setFormData] = useState<Omit<PlaybookCalendarEntry, 'id'>>({
    date: null,
    tasks: '',
    internal_ents: '',
    external_ents: '',
    where: '',
    other_notes: '',
    other_external: ''
  });

  useEffect(() => {
    fetchEntries();
    fetchWorkstreams();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await getPlaybookCalendar();
      if (response.success && response.data) {
        setEntries(response.data);
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkstreams = async () => {
    try {
      const response = await getPlaybookWorkstreams();
      if (response.success && response.data) {
        setWorkstreams(response.data);
      }
    } catch (error) {
      console.error('Error fetching workstreams:', error);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getSortedEntries = () => {
    return [...entries].sort((a, b) => {
      let aVal = a[sortKey] || '';
      let bVal = b[sortKey] || '';

      if (sortKey === 'date') {
        if (!aVal) return 1;
        if (!bVal) return -1;
        aVal = new Date(aVal as string).getTime().toString();
        bVal = new Date(bVal as string).getTime().toString();
      }

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  };

  const isToday = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  const isFutureOrToday = (dateStr: string | null): boolean => {
    if (!dateStr) return true; // If no date, default to using dropdown
    const date = new Date(dateStr);
    const today = new Date();
    // Set time to start of day for comparison
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const parseTasksToArray = (tasksStr: string): string[] => {
    if (!tasksStr || tasksStr.trim() === '') return [];
    return tasksStr.split(',').map(t => t.trim()).filter(t => t !== '');
  };

  const arrayToTasksString = (codes: string[]): string => {
    return codes.join(', ');
  };

  const getRowClassName = (entry: PlaybookCalendarEntry): string => {
    const classes = ['border-b border-gray-200 hover:bg-gray-50'];

    if (isToday(entry.date)) {
      classes.push('bg-yellow-50');
    } else if (isWeekend(entry.date)) {
      classes.push('bg-gray-100 text-gray-600');
    }

    return classes.join(' ');
  };


  const handleOpenModal = (entry?: PlaybookCalendarEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        date: entry.date,
        tasks: entry.tasks,
        internal_ents: entry.internal_ents,
        external_ents: entry.external_ents,
        where: entry.where,
        other_notes: entry.other_notes,
        other_external: entry.other_external
      });
      // Parse tasks for workstream selection
      setSelectedWorkstreamCodes(parseTasksToArray(entry.tasks));
    } else {
      setEditingEntry(null);
      // Pre-populate with today's date
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        date: today,
        tasks: '',
        internal_ents: '',
        external_ents: '',
        where: '',
        other_notes: '',
        other_external: ''
      });
      setSelectedWorkstreamCodes([]);
    }
    setShowModal(true);
    setFormStatus('idle');
    setStatusMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('saving');

    try {
      // If date is future/today, use workstream codes; otherwise keep as text
      const dataToSave = {
        ...formData,
        tasks: isFutureOrToday(formData.date)
          ? arrayToTasksString(selectedWorkstreamCodes)
          : formData.tasks
      };

      if (editingEntry) {
        const response = await updatePlaybookCalendarEntry(editingEntry.id, dataToSave);
        if (response.success) {
          setFormStatus('success');
          setStatusMessage('Entry updated successfully!');
          fetchEntries();
          setTimeout(() => setShowModal(false), 1500);
        }
      } else {
        const response = await createPlaybookCalendarEntry(dataToSave);
        if (response.success) {
          setFormStatus('success');
          setStatusMessage('Entry created successfully!');
          fetchEntries();
          setTimeout(() => setShowModal(false), 1500);
        }
      }
    } catch (error: any) {
      setFormStatus('error');
      setStatusMessage(error.message || 'Failed to save entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this calendar entry?')) return;

    try {
      const response = await deletePlaybookCalendarEntry(id);
      if (response.success) fetchEntries();
    } catch (error) {
      alert('Failed to delete entry');
    }
  };

  if (loading) return <div className="text-center py-8">Loading calendar...</div>;

  const sortedEntries = getSortedEntries();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Calendar</h3>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Entry
        </button>
      </div>

      <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Date {sortKey === 'date' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('where')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Location {sortKey === 'where' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('tasks')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Tasks {sortKey === 'tasks' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('internal_ents')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Internal {sortKey === 'internal_ents' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('external_ents')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                External {sortKey === 'external_ents' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('other_external')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Other External {sortKey === 'other_external' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('other_notes')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Notes {sortKey === 'other_notes' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr
                key={entry.id}
                onClick={() => handleOpenModal(entry)}
                className={`${getRowClassName(entry)} cursor-pointer`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {entry.where || '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {entry.tasks || '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {entry.internal_ents || '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {entry.external_ents || '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {entry.other_external || '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {entry.other_notes || '-'}
                </td>
                <td
                  className="px-4 py-3 text-right text-sm whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleOpenModal(entry)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {sortedEntries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No calendar entries yet. Add your first entry!
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingEntry ? 'Edit Calendar Entry' : 'New Calendar Entry'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={
                      formData.date
                        ? new Date(formData.date).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value ? new Date(e.target.value).toISOString() : null
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasks
                    {formData.date && !isFutureOrToday(formData.date) && (
                      <span className="ml-2 text-xs text-gray-500">(Past date - text only)</span>
                    )}
                    {formData.date && isFutureOrToday(formData.date) && (
                      <span className="ml-2 text-xs text-gray-500">(Select from workstreams)</span>
                    )}
                  </label>
                  {formData.date && !isFutureOrToday(formData.date) ? (
                    // Past dates: Show text input
                    <textarea
                      rows={2}
                      value={formData.tasks}
                      onChange={(e) => setFormData({ ...formData, tasks: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter tasks as text (e.g., O1, C3, D1)"
                    />
                  ) : (
                    // Future/Today dates: Show workstream dropdown
                    <WorkstreamMultiSelect
                      workstreams={workstreams}
                      selectedCodes={selectedWorkstreamCodes}
                      onChange={setSelectedWorkstreamCodes}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Participants
                    </label>
                    <input
                      type="text"
                      value={formData.internal_ents}
                      onChange={(e) =>
                        setFormData({ ...formData, internal_ents: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      External Participants
                    </label>
                    <input
                      type="text"
                      value={formData.external_ents}
                      onChange={(e) =>
                        setFormData({ ...formData, external_ents: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other External
                  </label>
                  <input
                    type="text"
                    value={formData.other_external}
                    onChange={(e) =>
                      setFormData({ ...formData, other_external: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.where}
                    onChange={(e) => setFormData({ ...formData, where: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={formData.other_notes}
                    onChange={(e) => setFormData({ ...formData, other_notes: e.target.value })}
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
                      : editingEntry
                      ? 'Update'
                      : 'Create'}
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

export default PlaybookCalendarTab;