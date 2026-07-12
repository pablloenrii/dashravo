import { useState, useRef, useCallback } from 'react';

export interface DragItem {
  id: string;
  data: any;
}

export interface UseDragDropProps {
  onDrop?: (item: DragItem, targetId?: string) => void;
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: () => void;
}

export function useDragDrop({ onDrop, onDragStart, onDragEnd }: UseDragDropProps = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = useCallback(
    (item: DragItem) => {
      setIsDragging(true);
      setDraggedItem(item);
      onDragStart?.(item);
    },
    [onDragStart]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((targetId: string) => {
    dragCounter.current++;
    setDragOverId(targetId);
  }, []);

  const handleDragLeave = useCallback((_targetId: string) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverId(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId?: string) => {
      e.preventDefault();
      dragCounter.current = 0;

      if (draggedItem) {
        onDrop?.(draggedItem, targetId);
      }

      setIsDragging(false);
      setDraggedItem(null);
      setDragOverId(null);
      onDragEnd?.();
    },
    [draggedItem, onDrop, onDragEnd]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    setDragOverId(null);
    onDragEnd?.();
  }, [onDragEnd]);

  return {
    isDragging,
    draggedItem,
    dragOverId,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
