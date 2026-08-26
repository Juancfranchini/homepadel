import { useState } from 'react';
import { DeleteConfirmationData, DeleteResponse } from '../types/delete.types';
import { DELETE_CONFIG, EntityType } from '../lib/delete-config';

interface UseDeleteEntityProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeleteEntity({ onSuccess, onError }: UseDeleteEntityProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState<DeleteConfirmationData | null>(null);

  const checkEntity = async (entityType: EntityType, entityId: string, entityName: string) => {
    try {
      const response = await fetch(`/api/admin/${entityType}/${entityId}/check`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Error al verificar dependencias');
      }

      const data: DeleteResponse = await response.json();

      const config = DELETE_CONFIG[entityType];
      const dependencies = config.getDependencies(data.relatedData || {});

      const confirmData: DeleteConfirmationData = {
        title: config.title,
        type: entityType,
        entityName,
        entityId,
        dependencies,
        hasOrders: config.hasOrders(data.relatedData || {}),
        action: config.action,
      };

      setConfirmationData(confirmData);
      setIsOpen(true);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const confirmDelete = async () => {
    if (!confirmationData) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/${confirmationData.type}/${confirmationData.entityId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: confirmationData.action === 'delete' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar');
      }

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setConfirmationData(null);
  };

  return {
    isOpen,
    isLoading,
    confirmationData,
    checkEntity,
    confirmDelete,
    closeModal,
  };
}
