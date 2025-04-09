'use client';

import { useState } from 'react';
import axios from 'axios';

export default function InviteUserPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setResponseMsg('');
    
      try {
        const response = await axios.post('/api/cognito/signup', formData);
    
        // Safe check if response has expected structure
        if (response?.data?.message) {
          setResponseMsg(`✅ Success: ${response.data.message}`);
        } else {
          setResponseMsg(`✅ Success`);
        }
      } catch (error: unknown) {
        let errMsg = 'Unknown error occurred';
    
        // Handle AxiosError
        if (axios.isAxiosError(error)) {
          errMsg =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message;
        } else if (error instanceof Error) {
          errMsg = error.message;
        }
    
        setResponseMsg(`❌ Error: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };
    

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Invite a New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {loading ? 'Sending...' : 'Invite User'}
        </button>
      </form>

      {responseMsg && (
        <div className="mt-4 p-2 text-sm bg-gray-100 border rounded">
          {responseMsg}
        </div>
      )}
    </div>
  );
}
