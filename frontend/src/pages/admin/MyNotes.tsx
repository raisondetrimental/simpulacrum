/**
 * My Notes - Super Admin Personal Notes
 * Simple note-taking interface with rich text support
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

interface Note {
  id: string;
  title: string;
  content: string;
  starred: boolean;
  created_at: string;
  updated_at: string;
}

const MyNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/notes`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setNotes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotes();
        setFormData({ title: '', content: '' });
        setIsEditing(false);
        setSelectedNote(data.data);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotes();
        setIsEditing(false);
        setSelectedNote(data.data);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotes();
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const handleToggleStar = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent note selection when clicking star

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notes/${noteId}/star`, {
        method: 'PATCH',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotes();
        // Update selected note if it's the one we starred
        if (selectedNote?.id === noteId) {
          setSelectedNote(data.data);
        }
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      alert('Failed to toggle star');
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setFormData({ title: note.title, content: note.content });
    setIsEditing(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setFormData({ title: '', content: '' });
    setIsEditing(true);
  };

  const handleEditNote = () => {
    if (selectedNote) {
      setFormData({ title: selectedNote.title, content: selectedNote.content });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (selectedNote) {
      setFormData({ title: selectedNote.title, content: selectedNote.content });
    } else {
      setFormData({ title: '', content: '' });
    }
    setIsEditing(false);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
        <p className="mt-2 text-gray-600">Personal notes and ideas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={handleNewNote}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-3"
              >
                + New Note
              </button>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {filteredNotes.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}
                </div>
              )}

              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedNote?.id === note.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {note.content.replace(/<[^>]*>/g, '').substring(0, 60)}...
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleToggleStar(note.id, e)}
                      className="ml-2 text-xl flex-shrink-0 hover:scale-110 transition-transform"
                      title={note.starred ? 'Unstar note' : 'Star note'}
                    >
                      {note.starred ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Note Editor/Viewer */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            {!selectedNote && !isEditing ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                Select a note or create a new one
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Note title..."
                      className="text-2xl font-bold border-0 border-b-2 border-gray-300 focus:border-blue-500 outline-none flex-1"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{selectedNote?.title}</h2>
                  )}

                  <div className="flex gap-2 ml-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={selectedNote ? handleUpdateNote : handleCreateNote}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleEditNote}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        {selectedNote && (
                          <button
                            onClick={() => handleDeleteNote(selectedNote.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                {isEditing ? (
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your note here..."
                    className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md resize-none"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap">{selectedNote?.content}</div>
                  </div>
                )}

                {/* Metadata */}
                {selectedNote && !isEditing && (
                  <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
                    <p>Created: {new Date(selectedNote.created_at).toLocaleString()}</p>
                    <p>Updated: {new Date(selectedNote.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNotes;
