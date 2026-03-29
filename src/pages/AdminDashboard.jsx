import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard({ session }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, userId) => {
    try {
      // 1. Update request status
      const { error: requestError } = await supabase
        .from('premium_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (requestError) throw requestError;

      // 2. Refresh the list
      fetchRequests();
      alert('Request approved successfully! The user now has premium access.');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. ' + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from('premium_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  // Very basic security check - in production use RLS policies
  const isAdmin = session?.user?.email === 'admin@conceptbridge.ai' || session?.user?.email?.includes('admin');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <h2 className="text-2xl font-bold text-red-500">Access Denied. Admin only.</h2>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8">Loading requests...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Premium Access Requests</h1>
        <button onClick={fetchRequests} className="px-4 py-2 bg-[var(--color-surface-card)] rounded-lg text-sm hover:bg-[var(--color-surface-card-hover)]">
          Refresh
        </button>
      </div>

      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No premium requests found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-border)]/50">
                <th className="p-4 font-semibold text-sm">User Email</th>
                <th className="p-4 font-semibold text-sm">Date</th>
                <th className="p-4 font-semibold text-sm">Status</th>
                <th className="p-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-[var(--color-border)]/20 transition-colors">
                  <td className="p-4 text-sm font-medium">{req.user_email}</td>
                  <td className="p-4 text-sm text-text-muted">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                      req.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      req.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id, req.user_id)}
                          className="px-3 py-1 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
