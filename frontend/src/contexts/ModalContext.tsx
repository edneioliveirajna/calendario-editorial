import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ModalState {
  isModalOpenViaTooltip: boolean;
  modalTaskId: number | null;
}

interface ModalContextType {
  modalState: ModalState;
  openModalViaTooltip: (taskId: number) => void;
  closeModalViaTooltip: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal deve ser usado dentro de ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isModalOpenViaTooltip: false,
    modalTaskId: null,
  });

  const openModalViaTooltip = useCallback((taskId: number) => {
    setModalState({
      isModalOpenViaTooltip: true,
      modalTaskId: taskId,
    });
  }, []);

  const closeModalViaTooltip = useCallback(() => {
    setModalState({
      isModalOpenViaTooltip: false,
      modalTaskId: null,
    });
  }, []);

  const value = {
    modalState,
    openModalViaTooltip,
    closeModalViaTooltip,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
