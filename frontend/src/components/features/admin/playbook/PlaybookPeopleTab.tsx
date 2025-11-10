/**
 * Playbook People/Team Tab
 * Team directory with roles and DISC profiles
 */

import React, { useState, useEffect } from 'react';
import {
  getPlaybookPeople,
  createPlaybookPerson,
  updatePlaybookPerson,
  deletePlaybookPerson
} from '../../../../services/playbookService';
import { PlaybookPerson, DISC_PROFILES, FormStatus } from '../../../../types/playbook';

const PlaybookPeopleTab: React.FC = () => {
  const [people, setPeople] = useState<PlaybookPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PlaybookPerson | null>(null);
  const [viewingPerson, setViewingPerson] = useState<PlaybookPerson | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');

  const [formData, setFormData] = useState<Omit<PlaybookPerson, 'id'>>({
    team_member: '',
    location: '',
    role: '',
    tasks: '',
    disc_profile: '',
    facts_interests: ''
  });

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await getPlaybookPeople();
      if (response.success && response.data) {
        setPeople(response.data);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPerson = (person: PlaybookPerson) => {
    setViewingPerson(person);
    setShowDetailModal(true);
  };

  const handleOpenModal = (person?: PlaybookPerson) => {
    if (person) {
      setEditingPerson(person);
      setFormData({
        team_member: person.team_member,
        location: person.location,
        role: person.role,
        tasks: person.tasks,
        disc_profile: person.disc_profile,
        facts_interests: person.facts_interests
      });
    } else {
      setEditingPerson(null);
      setFormData({
        team_member: '',
        location: '',
        role: '',
        tasks: '',
        disc_profile: '',
        facts_interests: ''
      });
    }
    setShowModal(true);
    setFormStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('saving');

    try {
      if (editingPerson) {
        await updatePlaybookPerson(editingPerson.id, formData);
      } else {
        await createPlaybookPerson(formData);
      }
      setFormStatus('success');
      fetchPeople();
      setTimeout(() => setShowModal(false), 1000);
    } catch (error) {
      setFormStatus('error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team member?')) return;
    try {
      await deletePlaybookPerson(id);
      fetchPeople();
    } catch (error) {
      alert('Failed to delete team member');
    }
  };

  if (loading) return <div className="text-center py-8">Loading team...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">People / Team</h3>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people.map((person) => (
          <div
            key={person.id}
            onClick={() => handleViewPerson(person)}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-lg">{person.team_member}</h4>
                <p className="text-sm text-gray-600">{person.role}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(person);
                  }}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(person.id);
                  }}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            {person.location && (
              <p className="text-sm mb-2">
                <span className="font-medium">Location:</span> {person.location}
              </p>
            )}
            {person.disc_profile && (
              <p className="text-sm mb-2">
                <span className="font-medium">DISC:</span> {person.disc_profile}
              </p>
            )}
            {person.tasks && (
              <p className="text-sm mb-2">
                <span className="font-medium">Tasks:</span> {person.tasks}
              </p>
            )}
            {person.facts_interests && (
              <p className="text-sm text-gray-600 mt-2 italic">
                {person.facts_interests}
              </p>
            )}
          </div>
        ))}
      </div>

      {people.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No team members yet. Add your first team member!
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && viewingPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Team Member Details</h2>
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
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Team Member</h3>
                  <p className="text-lg font-semibold">{viewingPerson.team_member}</p>
                </div>

                {viewingPerson.role && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                    <p>{viewingPerson.role}</p>
                  </div>
                )}

                {viewingPerson.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    <p>{viewingPerson.location}</p>
                  </div>
                )}

                {viewingPerson.disc_profile && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">DISC Profile</h3>
                    <p>{viewingPerson.disc_profile}</p>
                  </div>
                )}

                {viewingPerson.tasks && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tasks/Responsibilities</h3>
                    <p className="whitespace-pre-wrap">{viewingPerson.tasks}</p>
                  </div>
                )}

                {viewingPerson.facts_interests && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Facts/Interests</h3>
                    <p className="whitespace-pre-wrap italic text-gray-700">{viewingPerson.facts_interests}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenModal(viewingPerson);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Team Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingPerson ? 'Edit Team Member' : 'New Team Member'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.team_member}
                    onChange={(e) => setFormData({ ...formData, team_member: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">DISC Profile</label>
                  <select
                    value={formData.disc_profile}
                    onChange={(e) => setFormData({ ...formData, disc_profile: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select DISC Profile...</option>
                    {DISC_PROFILES.map((profile) => (
                      <option key={profile} value={profile}>{profile}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tasks/Responsibilities</label>
                  <textarea
                    rows={3}
                    value={formData.tasks}
                    onChange={(e) => setFormData({ ...formData, tasks: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Facts/Interests</label>
                  <textarea
                    rows={2}
                    value={formData.facts_interests}
                    onChange={(e) => setFormData({ ...formData, facts_interests: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
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
                    {formStatus === 'saving' ? 'Saving...' : editingPerson ? 'Update' : 'Create'}
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

export default PlaybookPeopleTab;
