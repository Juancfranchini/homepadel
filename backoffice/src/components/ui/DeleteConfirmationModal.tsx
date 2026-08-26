'use client';

import React from 'react';
import { Modal } from './Modal';

interface DependantEntity {
  table: string;
  count: number;
  message: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  entityName: string;
  entityType: string;
  dependencies: DependantEntity[];
  hasOrders: boolean;
  action: 'delete' | 'soft_delete' | 'cascade';
  warningMessage?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  entityName,
  entityType,
  dependencies,
  hasOrders,
  action,
  warningMessage,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const canDelete = action === 'delete' || action === 'cascade' || !hasOrders;
  const confirmLabel = isLoading ? 'Eliminando...' : (canDelete ? 'Confirmar eliminacion' : 'Desactivar');
  const confirmClass = canDelete
    ? 'bg-red-600 text-white hover:bg-red-700'
    : 'bg-yellow-600 text-white hover:bg-yellow-700';

  const description = (
    <div className="space-y-4">
      <p className="text-gray-700">
        Estas por eliminar <strong>"{entityName}"</strong>
      </p>

      {dependencies.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Esta accion tambien afectara a:</p>
          <ul className="space-y-1 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            {dependencies.map((dep, index) => (
              <li key={index}> {dep.message}</li>
            ))}
          </ul>
        </div>
      )}

      {hasOrders && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700 text-sm">
            Este elemento tiene pedidos historicos asociados. No se puede eliminar, solo desactivar.
          </p>
        </div>
      )}

      {warningMessage && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-blue-700 text-sm">{warningMessage}</p>
        </div>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {description}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading || (!canDelete && action !== 'soft_delete')}
          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${confirmClass}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
