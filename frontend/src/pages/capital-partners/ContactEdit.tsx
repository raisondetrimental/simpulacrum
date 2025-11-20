/**
 * Contact Edit/Create Page
 * Create new contacts or edit existing ones
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Contact, ContactFormData, ApiResponse } from '../../types/liquidity';
import ContactForm from '../../components/features/capital-partners/ContactForm';
import { apiGet, apiPost, apiPut } from '../../services/api';

const ContactEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const preselectedPartnerId = searchParams.get('capital_partner_id');
  // If id is undefined, we're on the /new route (not /:id/edit)
  const isNew = !id || id === 'new';

  useEffect(() => {
    if (!isNew) {
      fetchContact();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const result = await apiGet<Contact>(`/api/contacts-new/${id}`);

      if (result.success && result.data) {
        setContact(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load contact');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: ContactFormData) => {
    try {
      const result = isNew
        ? await apiPost<Contact>('/api/contacts-new', formData)
        : await apiPut<Contact>(`/api/contacts-new/${id}`, formData);

      if (result.success && result.data) {
        navigate(`/liquidity/contacts/${result.data.id}`);
      } else {
        setError(result.message || 'Failed to save contact');
      }
    } catch (err) {
      setError('Failed to connect to API');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => navigate('/liquidity/contacts')}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isNew ? 'Add Contact' : 'Edit Contact'}
        </h1>
      </div>

      <ContactForm
        initialData={contact}
        capitalPartnerId={preselectedPartnerId || contact?.capital_partner_id || ''}
        onSave={handleSave}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default ContactEdit;
