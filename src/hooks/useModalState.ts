import { useState } from 'react';

interface ModalState<T> {
  isOpen: boolean;
  editingItem?: T;
  deleteInfo?: { id: string; type: string; action: () => void };
}

export function useModalState<T>() {
  const [modalState, setModalState] = useState<ModalState<T>>({
    isOpen: false,
  });

  const openModal = (item?: T) => {
    setModalState({
      isOpen: true,
      editingItem: item,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      editingItem: undefined,
      deleteInfo: undefined,
    });
  };

  const openDeleteModal = (id: string, type: string, action: () => void) => {
    setModalState({
      isOpen: false,
      deleteInfo: { id, type, action },
    });
  };

  const closeDeleteModal = () => {
    setModalState((prev) => ({
      ...prev,
      deleteInfo: undefined,
    }));
  };

  return {
    modalState,
    openModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
  };
}