'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';

interface User {
  id: string;
  email: string;
  name: string;
  clinic_id: string;
  active: boolean;
  created_at: string;
  roles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [assigningRole, setAssigningRole] = useState(false);
  const [availableRoles] = useState(['admin', 'doctor', 'receptionist', 'patient']);

  const fetchUsers = useCallback(
    async (pageNum: number, searchQuery: string) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: limit.toString(),
        });

        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const response = await fetch(`/api/admin/users?${params}`, {
          headers: {
            'Authorization': `Bearer ${user?.session?.access_token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            setError('You do not have permission to access this page');
            router.push('/app/dashboard');
            return;
          }
          throw new Error('Failed to fetch users');
        }

        const data: UsersResponse = await response.json();
        setUsers(data.data);
        setTotal(data.total);
        setPage(data.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [user, limit, router]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUsers(1, '');
  }, [user, limit, router, fetchUsers]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
    fetchUsers(1, query);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole('');
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      setAssigningRole(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}/roles`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleName: selectedRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign role');
      }

      // Refresh users list
      fetchUsers(page, search);
      closeRoleModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role');
    } finally {
      setAssigningRole(false);
    }
  };

  const removeRole = async (userId: string, roleId: string) => {
    if (!confirm('Are you sure you want to remove this role?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/roles?roleId=${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.session?.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove role');
      }

      // Refresh users list
      fetchUsers(page, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove role');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Link href="/app/admin/audit-log" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          View Audit Log
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Roles</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{u.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{u.email}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        {u.roles.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                          >
                            {role.name}
                            <button
                              onClick={() => removeRole(u.id, role.id)}
                              className="text-blue-600 hover:text-red-600 font-bold"
                              title="Remove role"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => openRoleModal(u)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Assign Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => fetchUsers(page - 1, search)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => fetchUsers(page + 1, search)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Assign Role to {selectedUser.name}</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">-- Choose a role --</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={assignRole}
                disabled={!selectedRole || assigningRole}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {assigningRole ? 'Assigning...' : 'Assign'}
              </button>
              <button
                onClick={closeRoleModal}
                className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
