"use client";
import React, { useState } from 'react';
import toast from "react-hot-toast";
import InputGroup from '@/components/FormElements/InputGroup';
import Select from '@/components/FormElements/select';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';
import { useAuth } from '@/context/auth-context';
import timezones from '@/utils/timezones.json';
import { validateEmail, validatePassword } from '@/utils/validate';
import { cn } from "@/lib/utils";
import { createInstitution } from '@/api/tenantService';
import { useRouter } from "next/navigation";
interface FormData {
  name: string;
  domain: string;
  email: string;
  type: string;
  logoUrl: string;
  address: string;
  city: string;
  county: string;
  country: string;
  phone: string;
  accreditationNumber: string;
  establishedYear: string;
  timezone: string;
  currency: string;
  adminUser: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  };
}

const initialState: FormData = {
  name: '',
  domain: '',
  email: '',
  type: 'UNIVERSITY',
  logoUrl: '',
  address: '',
  city: '',
  county: '',
  country: 'Kenya',
  phone: '',
  accreditationNumber: '',
  establishedYear: '',
  timezone: 'Africa/Nairobi',
  currency: 'KES',
  adminUser: {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  },
};

const AddInstitutionForm: React.FC = () => {
  const [data, setData] = useState<FormData>(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData & { adminUser: Partial<FormData['adminUser']> & { form?: string } }>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const { token } = useAuth();
    const router = useRouter();

  console.log('Auth token:', token); // Debug token

    const validateForm = (): boolean => {
    const newErrors: Partial<FormData & { adminUser: Partial<FormData['adminUser']> & { form?: string } }> = {};
  
    if (!data.name) newErrors.name = 'Institution name is required';
    if (!data.domain) newErrors.domain = 'Domain is required';
    if (!data.email) newErrors.email = 'Institution email is required';
    else if (!validateEmail(data.email)) newErrors.email = 'Valid institution email is required';
    if (!data.type) newErrors.type = 'Institution type is required';
    if (!data.adminUser.email) newErrors.adminUser = { ...newErrors.adminUser, email: 'Admin email is required' };
    else if (!validateEmail(data.adminUser.email)) newErrors.adminUser = { ...newErrors.adminUser, email: 'Valid admin email is required' };
    if (!data.adminUser.firstName) newErrors.adminUser = { ...newErrors.adminUser, firstName: 'First name is required' };
    if (!data.adminUser.lastName) newErrors.adminUser = { ...newErrors.adminUser, lastName: 'Last name is required' };
    if (!data.adminUser.password) newErrors.adminUser = { ...newErrors.adminUser, password: 'Password is required' };
    // Password format validation removed
    if (data.email && data.adminUser.email && data.email === data.adminUser.email) {
      newErrors.email = 'Institution and admin emails must be different';
      newErrors.adminUser = { ...newErrors.adminUser, email: 'Institution and admin emails must be different' };
    }
  
    setErrors(newErrors);
    console.log('Validation errors:', newErrors); // Debug validation
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`); // Debug input changes
    if (name.startsWith('adminUser.')) {
      setData((prev) => ({
        ...prev,
        adminUser: { ...prev.adminUser, [name.replace('adminUser.', '')]: value },
      }));
      setErrors((prev) => ({ ...prev, adminUser: { ...prev.adminUser, [name.replace('adminUser.', '')]: undefined } }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;
      if (!token) {
        setErrors({ form: 'Authentication token is missing. Please log in.' });
        return;
      }
      setLoading(true);
      setSuccess(null);
      setErrors((prev) => ({ ...prev, form: undefined }));
      try {
        const { county, ...rest } = data;
        const payload = { ...rest, state: county };
        const response = await createInstitution(payload, token);
    
        // Check for a property that indicates success
        if (response && (response.isSystemAdminCreated || response.tenant)) {
          setSuccess('Institution created successfully!');
          toast.success('Institution created successfully!');
          setData(initialState);
          setTimeout(() => {
    router.push("/tables");
  }, 1200);
        } else {
          throw new Error('Institution creation failed. Please try again.');
        }
      } catch (err: any) {
        setErrors((prev) => ({ ...prev, form: err.message || 'Failed to create institution' }));
        toast.error(err.message || 'Failed to create institution');
      } finally {
        setLoading(false);
      }
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Institution Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputGroup
          label="Name"
          name="name"
          value={data.name}
          onChange={handleChange}
          required
          placeholder="Enter institution name"
          error={errors.name}
        />
        <InputGroup
          label="Domain"
          name="domain"
          value={data.domain}
          onChange={handleChange}
          required
          placeholder="e.g., www.example.ac.ke"
          error={errors.domain}
        />
        <InputGroup
          label="Contact Email"
          name="email"
          value={data.email}
          onChange={handleChange}
          required
          type="email"
          placeholder="e.g., info@example.ac.ke"
          error={errors.email}
        />
        <InputGroup
          label="Logo URL"
          name="logoUrl"
          value={data.logoUrl}
          onChange={handleChange}
          placeholder="Enter logo URL (optional)"
          error={errors.logoUrl}
        />
        <InputGroup
          label="Phone"
          name="phone"
          value={data.phone}
          onChange={handleChange}
          placeholder="e.g., +254721981084"
          error={errors.phone}
        />
        <InputGroup
          label="Accreditation Number"
          name="accreditationNumber"
          value={data.accreditationNumber}
          onChange={handleChange}
          placeholder="e.g., CUE-123456"
          error={errors.accreditationNumber}
        />
        <InputGroup
          label="Established Year"
          name="establishedYear"
          value={data.establishedYear}
          onChange={handleChange}
          placeholder="e.g., 2013"
          error={errors.establishedYear}
        />
        <Select
          label="Timezone"
          name="timezone"
          value={data.timezone}
          onChange={handleChange}
          items={timezones.map((tz, idx) => ({
            label: tz.text,
            value: tz.utc?.[0] || tz.value || '',
            key: `${tz.utc?.[0] || tz.value || 'tz'}-${idx}`,
          }))}
          placeholder="Select timezone"
          error={errors.timezone}
        />
        <InputGroup
          label="Currency"
          name="currency"
          value={data.currency}
          onChange={handleChange}
          placeholder="e.g., KES"
          error={errors.currency}
        />
        <Select
          label="Type"
          name="type"
          value={data.type}
          onChange={handleChange}
          items={[
            { label: 'University', value: 'UNIVERSITY', key: 'UNIVERSITY' },
            { label: 'College', value: 'COLLEGE', key: 'COLLEGE' },
            { label: 'School', value: 'SCHOOL', key: 'SCHOOL' },
            { label: 'Institute', value: 'INSTITUTE', key: 'INSTITUTE' },
            { label: 'Other', value: 'OTHER', key: 'OTHER' },
          ]}
          required
          placeholder="Select institution type"
          error={errors.type}
        />
      </div>
         <TextAreaGroup
        label="Address"
        name="address"
        value={data.address}
        handleChange={handleChange} // ✅ Correct prop name
        placeholder="Enter address (optional)"
        error={errors.address}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputGroup
          label="City"
          name="city"
          value={data.city}
          onChange={handleChange}
          placeholder="e.g., Nairobi"
          error={errors.city}
        />
        <InputGroup
          label="County"
          name="county"
          value={data.county}
          onChange={handleChange}
          placeholder="e.g., Nairobi"
          error={errors.county}
        />
        <InputGroup
          label="Country"
          name="country"
          value={data.country}
          onChange={handleChange}
          placeholder="e.g., Kenya"
          error={errors.country}
        />
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-2">System Admin</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputGroup
          label="Admin Email"
          name="adminUser.email"
          value={data.adminUser.email}
          onChange={handleChange}
          required
          type="email"
          placeholder="e.g., admin@example.ac.ke"
          error={errors.adminUser?.email}
        />
        <InputGroup
          label="First Name"
          name="adminUser.firstName"
          value={data.adminUser.firstName}
          onChange={handleChange}
          required
          placeholder="e.g., John"
          error={errors.adminUser?.firstName}
        />
        <InputGroup
          label="Last Name"
          name="adminUser.lastName"
          value={data.adminUser.lastName}
          onChange={handleChange}
          required
          placeholder="e.g., Doe"
          error={errors.adminUser?.lastName}
        />
        <InputGroup
          label="Password"
          name="adminUser.password"
          value={data.adminUser.password}
          onChange={handleChange}
          required
          type="password"
          placeholder="Enter password"
          error={errors.adminUser?.password}
        />
      </div>

      {errors.form && <div className="text-error text-center">{errors.form}</div>}
      {success && <div className="text-green-600 text-center">{success}</div>}

      <button
        type="submit"
        className="btn btn-primary w-full mt-4"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Institution'}
      </button>
    </form>
  );
};

export default AddInstitutionForm;