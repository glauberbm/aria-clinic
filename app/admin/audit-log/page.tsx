'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';

interface AuditLogEntry {
  id: string;
  actor: {
    id: string;
    email: string;
    name: string;
  };
  action: 'role_assigned' | 'role_removed';
  targetUser: {
    id: string;
    email: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export default function AuditLogPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: limit.toString(),
        });

        if (startDate) {
          params.append('startDate', startDate);
        }
        if (endDate) {
          params.append('endDate', endDate);
        }

        const response = await fetch(`/api/admin/audit-log?${params}`, {
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
          throw new Error('Failed to fetch audit log');
        }

        const data: AuditLogResponse = await response.json();
        setLogs(data.data);
        setTotal(data.total);
        setPage(data.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [user?.session?.access_token, limit, startDate, endDate, router]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchLogs(1);
  }, [user]);

  const handleFilterChange = () => {
    setPage(1);
    fetchLogs(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadge = (action: string) => {
    return action === 'role_assigned'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <Link href="/app/admin/users" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Back to Users
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 bg-gray-50 p-4 rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <button
          onClick={handleFilterChange}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Apply Filters
        </button>
      </div>

      {loading ? (
        <div>Loading audit log...</div>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Timestamp</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actor</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Target User</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div>
                        <div className="font-medium">{log.actor.name}</div>
                        <div className="text-sm text-gray-500">{log.actor.email}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getActionBadge(log.action)}`}>
                        {log.action === 'role_assigned' ? 'Assigned' : 'Removed'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div>
                        <div className="font-medium">{log.targetUser.name}</div>
                        <div className="text-sm text-gray-500">{log.targetUser.email}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {log.role.name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No audit log entries found
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
