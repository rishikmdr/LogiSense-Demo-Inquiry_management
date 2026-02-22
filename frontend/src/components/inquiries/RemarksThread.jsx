import { useState } from 'react';
import { format } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import { useAddRemark } from '../../hooks/useInquiries';
import useAuthStore from '../../store/authStore';
import client from '../../api/client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function RemarksThread({ inquiryId, remarks = [] }) {
  const [text, setText] = useState('');
  const { mutate: addRemark, isPending } = useAddRemark(inquiryId);
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addRemark(text.trim(), {
      onSuccess: () => setText(''),
    });
  };

  const deleteRemark = async (remarkId) => {
    try {
      await client.delete(`/remarks/${remarkId}`);
      qc.invalidateQueries({ queryKey: ['inquiry', inquiryId] });
      toast.success('Remark deleted');
    } catch (err) {
      toast.error('Failed to delete remark');
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {remarks.length === 0 && (
          <p className="text-text-muted text-sm text-center py-4">No remarks yet. Add the first one.</p>
        )}
        {remarks.map((r) => (
          <div key={r.id} className="bg-bg-elevated border border-border-subtle rounded-lg p-3 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-text-primary text-xs font-semibold">{r.created_by_name || 'User'}</span>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-xs">
                  {format(new Date(r.created_at), 'dd MMM yyyy, HH:mm')}
                </span>
                {(user?.role === 'admin' || user?.id === r.created_by) && (
                  <button
                    onClick={() => deleteRemark(r.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-text-secondary text-sm whitespace-pre-wrap">{r.remark}</p>
          </div>
        ))}
      </div>

      {user?.role !== 'viewer' && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a remark or instruction..."
            rows={2}
            className="flex-1 bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active resize-none transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSubmit(e);
            }}
          />
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="px-3 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 transition-colors self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
