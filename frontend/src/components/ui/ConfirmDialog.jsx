import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-bg-card border border-border-active rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${danger ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-accent-red' : 'text-accent-amber'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-semibold mb-2">{title}</h3>
            <p className="text-text-secondary text-sm">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-border-subtle text-text-secondary hover:bg-bg-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              danger
                ? 'bg-accent-red hover:bg-red-600 text-white'
                : 'bg-accent-amber hover:bg-amber-600 text-black'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
