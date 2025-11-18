import React, { useState, useEffect } from 'react';
import { getAnnouncement, updateAnnouncement, type Announcement } from '../../services/adminService';

interface SharedNotesWidgetProps {
  isAdmin: boolean;
}

const SharedNotesWidget: React.FC<SharedNotesWidgetProps> = ({ isAdmin }) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const loadAnnouncement = async () => {
    try {
      const response = await getAnnouncement();
      if (response.success && response.data) {
        setAnnouncement(response.data);
        setEditContent(response.data.content);
      }
    } catch (error) {
      console.error('Failed to load announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateAnnouncement(editContent);
      if (response.success && response.data) {
        setAnnouncement(response.data);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to save announcement:', error);
      alert('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(announcement?.content || '');
    setEditMode(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="card bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200 h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Announcements
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-amber-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200 h-full flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/30 to-orange-200/30 rounded-full blur-2xl"></div>

      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Announcements
          </h3>
        </div>
        {isAdmin && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        )}
      </div>

      {editMode ? (
        <div className="flex-1 flex flex-col relative z-10">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 p-4 border-2 border-amber-300 bg-white/80 backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm shadow-inner"
            placeholder="Write important announcements here..."
            style={{ minHeight: '200px' }}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-sm font-medium shadow-md transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white border border-amber-300 disabled:bg-gray-100 text-sm font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative z-10">
          {announcement && announcement.content ? (
            <>
              <div className="flex-1 bg-white/60 backdrop-blur-sm border-2 border-amber-300 rounded-lg p-5 overflow-y-auto shadow-inner relative">
                <div className="absolute top-2 right-2 text-amber-600/20">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <pre className="whitespace-pre-wrap text-base text-gray-800 font-sans leading-relaxed">
                    {announcement.content}
                  </pre>
                </div>
              </div>
              {announcement.last_updated_by && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700/70 bg-white/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-amber-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Last updated by <span className="font-semibold">{announcement.last_updated_by}</span> on {formatDate(announcement.last_updated)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white/40 backdrop-blur-sm border-2 border-dashed border-amber-300 rounded-lg">
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-full inline-block mb-3">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-amber-700">
                  {isAdmin ? 'Click Edit to add announcements' : 'No announcements yet'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SharedNotesWidget;
