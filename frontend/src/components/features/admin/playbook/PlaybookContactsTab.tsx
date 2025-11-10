/**
 * Playbook External Contacts Tab
 * Manage external stakeholder contacts with priority levels and follow-up tracking
 */

import React, { useState, useEffect } from 'react';
import {
  getPlaybookContacts,
  createPlaybookContact,
  updatePlaybookContact,
  deletePlaybookContact,
  exportPlaybookContactsCSV
} from '../../../../services/playbookService';
import { PlaybookContact, CONTACT_LEVELS, FormStatus } from '../../../../types/playbook';

const PlaybookContactsTab: React.FC = () => {
  const [contacts, setContacts] = useState<PlaybookContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingContact, setViewingContact] = useState<PlaybookContact | null>(null);
  const [editingContact, setEditingContact] = useState<PlaybookContact | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState<Omit<PlaybookContact, 'id'>>({
    name: '',
    email: '',
    role: '',
    contact_level: 3,
    region: '',
    last_contact: null,
    should_contact: null,
    notes: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getPlaybookContacts();
      if (response.success && response.data) {
        setContacts(response.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = (contact: PlaybookContact) => {
    setViewingContact(contact);
    setShowDetailModal(true);
  };

  const handleOpenModal = (contact?: PlaybookContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        email: contact.email,
        role: contact.role,
        contact_level: contact.contact_level,
        region: contact.region,
        last_contact: contact.last_contact,
        should_contact: contact.should_contact,
        notes: contact.notes
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        email: '',
        role: '',
        contact_level: 3,
        region: '',
        last_contact: null,
        should_contact: null,
        notes: ''
      });
    }
    setShowModal(true);
    setFormStatus('idle');
    setStatusMessage('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
    setFormStatus('idle');
    setStatusMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('saving');

    try {
      if (editingContact) {
        const response = await updatePlaybookContact(editingContact.id, formData);
        if (response.success) {
          setFormStatus('success');
          setStatusMessage('Contact updated successfully!');
          fetchContacts();
          setTimeout(handleCloseModal, 1500);
        }
      } else {
        const response = await createPlaybookContact(formData);
        if (response.success) {
          setFormStatus('success');
          setStatusMessage('Contact created successfully!');
          fetchContacts();
          setTimeout(handleCloseModal, 1500);
        }
      }
    } catch (error: any) {
      setFormStatus('error');
      setStatusMessage(error.message || 'Failed to save contact');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const response = await deletePlaybookContact(id);
      if (response.success) {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportPlaybookContactsCSV();
    } catch (error) {
      console.error('Error exporting contacts:', error);
      alert('Failed to export contacts');
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.role.toLowerCase().includes(query) ||
      contact.region.toLowerCase().includes(query)
    );
  });

  const getContactLevelColor = (level: number): string => {
    const colors: Record<number, string> = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-blue-100 text-blue-800',
      5: 'bg-gray-100 text-gray-800'
    };
    return colors[level] || colors[3];
  };

  if (loading) {
    return <div className="text-center py-8">Loading contacts...</div>;
  }

  return (
    <div>
      {/* Title and Actions Bar */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">External Contacts</h3>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Contact
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Should Contact
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery ? 'No contacts match your search' : 'No contacts yet. Add your first contact!'}
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => handleViewContact(contact)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{contact.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getContactLevelColor(
                        contact.contact_level
                      )}`}
                    >
                      Level {contact.contact_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.last_contact
                      ? new Date(contact.last_contact).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.should_contact || '-'}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleOpenModal(contact)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingContact ? 'Edit Contact' : 'New Contact'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Level (Priority)
                    </label>
                    <select
                      value={formData.contact_level}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_level: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {CONTACT_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Contact Date
                    </label>
                    <input
                      type="date"
                      value={
                        formData.last_contact
                          ? new Date(formData.last_contact).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          last_contact: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Should Contact (Text or Date)
                    </label>
                    <input
                      type="text"
                      value={formData.should_contact || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, should_contact: e.target.value || null })
                      }
                      placeholder="e.g., Soon, Medium, N/A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
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
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={formStatus === 'saving'}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formStatus === 'saving'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formStatus === 'saving'
                      ? 'Saving...'
                      : editingContact
                      ? 'Update Contact'
                      : 'Create Contact'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {showDetailModal && viewingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Contact Details</h2>
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
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  <p className="text-lg font-semibold text-gray-900">{viewingContact.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{viewingContact.email || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                  <p className="text-gray-900">{viewingContact.role || '-'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Contact Level</label>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getContactLevelColor(
                        viewingContact.contact_level
                      )}`}
                    >
                      Level {viewingContact.contact_level} (
                      {CONTACT_LEVELS.find((l) => l.value === viewingContact.contact_level)?.label || ''})
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Region</label>
                    <p className="text-gray-900">{viewingContact.region || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Contact</label>
                    <p className="text-gray-900">
                      {viewingContact.last_contact
                        ? new Date(viewingContact.last_contact).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Should Contact</label>
                    <p className="text-gray-900">{viewingContact.should_contact || '-'}</p>
                  </div>
                </div>

                {viewingContact.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingContact.notes}</p>
                  </div>
                )}
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
                    handleOpenModal(viewingContact);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookContactsTab;
