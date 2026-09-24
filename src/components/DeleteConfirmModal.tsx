'use client';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 border text-center">
        <div className="text-red-500 text-3xl mb-2">⚠️</div>
        <h3 className="text-lg font-bold text-gray-800">Confirm Delete</h3>
        <p className="text-sm text-gray-600 mt-2">
          Are you sure you want to delete <span className="font-semibold text-gray-900">"{title}"</span>?
        </p>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}