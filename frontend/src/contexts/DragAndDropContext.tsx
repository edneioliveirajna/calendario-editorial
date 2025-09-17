import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DragState {
  isDragging: boolean;
  draggedTask: any | null;
  draggedFromDate: string | null;
}

interface DragAndDropContextType {
  dragState: DragState;
  startDrag: (task: any, fromDate: string) => void;
  endDrag: () => void;
  canDrop: (targetDate: string) => boolean;
}

const DragAndDropContext = createContext<DragAndDropContextType | undefined>(undefined);

export const useDragAndDrop = () => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error('useDragAndDrop deve ser usado dentro de DragAndDropProvider');
  }
  return context;
};

interface DragAndDropProviderProps {
  children: ReactNode;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ children }) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTask: null,
    draggedFromDate: null,
  });

  const startDrag = useCallback((task: any, fromDate: string) => {
    const newState = {
      isDragging: true,
      draggedTask: task,
      draggedFromDate: fromDate,
    };
    
    setDragState(newState);
  }, [dragState]);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedTask: null,
      draggedFromDate: null,
    });
  }, []);

  const canDrop = useCallback((targetDate: string) => {
    if (!dragState.isDragging || !dragState.draggedTask) return false;
    
    // Não permitir drop no mesmo dia
    if (dragState.draggedFromDate === targetDate) return false;
    
    return true;
  }, [dragState]);

  const value = {
    dragState,
    startDrag,
    endDrag,
    canDrop,
  };

  return (
    <DragAndDropContext.Provider value={value}>
      {children}
    </DragAndDropContext.Provider>
  );
};
