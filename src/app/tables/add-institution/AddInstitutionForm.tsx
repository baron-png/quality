"use client";
import React, { useState } from "react";
import { createInstitution } from "@/api/tenantService";
import InputGroup from "@/components/FormElements/InputGroup";
import { useAuth } from "@/context/auth-context";
import timezones from "@/utils/timezones.json";

import { Select } from "@/components/FormElements/select";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";

const initialState = {
  name: "",
  domain: "",
  logoUrl: "",
  address: "",
  city: "",
  state: "",
  country: "",
  phone: "",
  email: "",
  type: "UNIVERSITY",
  accreditationNumber: "",
  establishedYear: "",
  timezone: "",
  currency: "",
  status: "PENDING",
  adminUser: {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  },
};

export default function AddInstitutionForm() {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("adminUser.")) {
      setData((prev) => ({
        ...prev,
        adminUser: { ...prev.adminUser, [name.replace("adminUser.", "")]: value },
      }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await createInstitution(data, token);
      setSuccess("Institution created successfully!");
      setData(initialState);
    } catch (err: any) {
      setError(err.message);
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
          handleChange={handleChange}
          required
          placeholder="Enter institution name"
        />
        <InputGroup
          label="Domain"
          name="domain"
          value={data.domain}
          handleChange={handleChange}
          required
            placeholder="Enter institution domain (e.g., example.edu)"
            
        />
        <InputGroup
          label="Logo URL"
          name="logoUrl"
          value={data.logoUrl}
          handleChange={handleChange}
            placeholder="Enter logo URL (optional)"
        />
        <InputGroup
          label="Contact Email"
          name="email"
          value={data.email}
          handleChange={handleChange}
          required
            type="email"
        />
        <InputGroup
          label="Phone"
          name="phone"
          value={data.phone}
          handleChange={handleChange}
            required
          
        />
        <InputGroup
          label="Accreditation Number"
          name="accreditationNumber"
          value={data.accreditationNumber}
          handleChange={handleChange}
            placeholder="Enter accreditation number (optional)"
        />
        <InputGroup
          label="Established Year"
          name="establishedYear"
          value={data.establishedYear}
          handleChange={handleChange}
            placeholder="Enter established year (optional)"
        />
        <Select
            label="Timezone"
            name="timezone"
            value={data.timezone}
            onChange={handleChange}
            items={timezones.map((tz) => ({
                label: tz.text,
                value: tz.utc[0], // or tz.value if you prefer
            }))}
            placeholder="Select timezone"
            />
        <InputGroup
          label="Currency"
          name="currency"
          value={data.currency}
          handleChange={handleChange}
        />
        <Select
          label="Type"
          name="type"
          value={data.type}
          onChange={handleChange}
          items={[
            { label: "University", value: "UNIVERSITY" },
            { label: "College", value: "COLLEGE" },
            { label: "School", value: "SCHOOL" },
            { label: "Institute", value: "INSTITUTE" },
            { label: "Other", value: "OTHER" },
          ]}
        />
      </div>
      <TextAreaGroup
        label="Address"
        name="address"
        value={data.address}
        handleChange={handleChange}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputGroup
          label="City"
          name="city"
          value={data.city}
          handleChange={handleChange}
        />
        <InputGroup
          label="State"
          name="state"
          value={data.state}
          handleChange={handleChange}
        />
        <InputGroup
          label="Country"
          name="country"
          value={data.country}
          handleChange={handleChange}
        />
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-2">Admin User</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputGroup
          label="Admin Email"
          name="adminUser.email"
          value={data.adminUser.email}
          handleChange={handleChange}
          required
        />
        <InputGroup
          label="First Name"
          name="adminUser.firstName"
          value={data.adminUser.firstName}
          handleChange={handleChange}
          required
        />
        <InputGroup
          label="Last Name"
          name="adminUser.lastName"
          value={data.adminUser.lastName}
          handleChange={handleChange}
          required
        />
        <InputGroup
          label="Password"
          name="adminUser.password"
          value={data.adminUser.password}
          handleChange={handleChange}
          type="password"
          required
        />
      </div>

      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}

      <button
        type="submit"
        className="btn btn-primary w-full mt-4"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Institution"}
      </button>
    </form>
  );
}