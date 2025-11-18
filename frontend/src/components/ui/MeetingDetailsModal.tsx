import React, { useState } from 'react';

type MeetingModule = 'liquidity' | 'sponsor' | 'counsel' | 'agent';

export interface MeetingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: MeetingModule;
  meeting: {
    id?: string;
    date: string;
    notes: string;
    participants?: string | null;
    next_follow_up?: string | null;
  };
  contactName: string;
  contactRole?: string;
  contactId?: string;
  context?: Array<{ label: string; value: string }>;
  onUpdate?: (meetingId: string, data: { notes: string; participants?: string; next_follow_up?: string }) => Promise<void>;
  onDelete?: (meetingId: string) => Promise<void>;
};

const MODULE_CONFIG: Record<MeetingModule, { label: string; badgeClass: string }> = {
  liquidity: {
    label: 'Liquidity',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  sponsor: {
    label: 'Sponsor',
    badgeClass: 'bg-green-100 text-green-700',
  },
  counsel: {
    label: 'Counsel',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
  agent: {
    label: 'Agent',
    badgeClass: 'bg-cyan-100 text-cyan-700',
  },
};

const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
  isOpen,
  onClose,
  module,
  meeting,
  contactName,
  contactRole,
  context = [],
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    notes: meeting.notes || '',
    participants: meeting.participants || '',
    next_follow_up: meeting.next_follow_up || ''
  });

  if (!isOpen) {
    return null;
  }

  const config = MODULE_CONFIG[module];
  const meetingDate = meeting.date ? new Date(meeting.date) : null;
  const followUpDate = meeting.next_follow_up ? new Date(meeting.next_follow_up) : null;

  const handleEdit = () => {
    setFormData({
      notes: meeting.notes || '',
      participants: meeting.participants || '',
      next_follow_up: meeting.next_follow_up || ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      notes: meeting.notes || '',
      participants: meeting.participants || '',
      next_follow_up: meeting.next_follow_up || ''
    });
  };

  const handleSave = async () => {
    if (!meeting.id || !onUpdate) return;

    setIsSaving(true);
    try {
      await onUpdate(meeting.id, formData);
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Failed to update meeting note:', error);
      alert('Failed to update meeting note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!meeting.id || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(meeting.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete meeting note:', error);
      alert('Failed to delete meeting note');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl border border-gray-200 max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}>{config.label}</span>
              {meetingDate && (
                <span className="text-sm text-gray-600">
                  {meetingDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">{contactName}</h2>
            {contactRole && <p className="text-sm text-gray-600 mt-1">{contactRole}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close meeting details"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto space-y-6">
          {context.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {context.map((item) => (
                <div key={item.label} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {isEditing ? (
            <>
              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Meeting Notes</h3>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter meeting notes..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-lg p-4 bg-white">
                  <label className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                    Participants
                  </label>
                  <input
                    type="text"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter participants..."
                  />
                </div>

                <div className="border border-gray-100 rounded-lg p-4 bg-white">
                  <label className="block text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                    Next Follow-up
                  </label>
                  <input
                    type="date"
                    value={formData.next_follow_up}
                    onChange={(e) => setFormData({ ...formData, next_follow_up: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Meeting Notes</h3>
                <div className="max-h-72 overflow-y-auto rounded-md bg-white border border-dashed border-gray-200 p-4 whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
                  {meeting.notes || 'No notes recorded.'}
                </div>
              </div>

              {(meeting.participants || meeting.next_follow_up) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meeting.participants && (
                    <div className="border border-gray-100 rounded-lg p-4 bg-white">
                      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Participants</p>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{meeting.participants}</p>
                    </div>
                  )}
                  {meeting.next_follow_up && followUpDate && (
                    <div className="border border-gray-100 rounded-lg p-4 bg-white">
                      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Next Follow-up</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {followUpDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {meeting.next_follow_up && !followUpDate && (
                    <div className="border border-gray-100 rounded-lg p-4 bg-white">
                      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Next Follow-up</p>
                      <p className="mt-1 text-sm text-gray-900">{meeting.next_follow_up}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
          {isEditing ? (
            <>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                {onUpdate && meeting.id && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && meeting.id && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Delete Meeting Note?</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this meeting note? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingDetailsModal;
