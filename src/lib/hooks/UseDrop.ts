import React, { useCallback, useEffect, useState } from "react"

import { useDragAndDropContext } from "./../contexts"


export type TMonitor = {
  x: number;
  y: number;
  droppableId: string;
  draggingId: string | undefined;
}
type DropResult = [{
  isDraggingOver: boolean;
  isDraggingOverCurrent: boolean;
}]
type DropProps<T> = {
  /**
   * Use to unique identify this droppable element
   *
   * Helps to verify if the current drop belongs to this droppable area
   */
  id: string;
  element: React.RefObject<HTMLElement | SVGElement | Document | null>;
  drop?: (data: T | undefined, monitor: TMonitor) => void;
  leave?: (data: T | undefined, monitor: TMonitor) => void;
  hover?: (data: T | undefined, monitor: TMonitor) => void;
}
type TUseDropProps = <T = any>(props: DropProps<T>, deps?: ReadonlyArray<any>) => DropResult

export const useDrop: TUseDropProps = ({ id, element, hover, leave, drop }, deps = []) => {
  const { getData } = useDragAndDropContext();

  const [isDraggingOverCurrent, setIsDraggingOverCurrent] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);


  const handleDragOver = useCallback((e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDraggingOver(true);
    setIsDraggingOverCurrent((e.target as any)?.dataset.droppableId === id);

    const draggedData = getData<any>();
    if (draggedData) {
      hover && hover(draggedData.data, {
        x: e.clientX,
        y: e.clientY,
        draggingId: draggedData.draggingId,
        droppableId: (e.target as any)?.dataset.droppableId,
      });
    } else {
      hover && hover(undefined, {
        x: e.clientX,
        y: e.clientY,
        draggingId: undefined,
        droppableId: (e.target as any)?.dataset.droppableId,
      });
    }
  }, [getData, hover, id, ...deps]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDraggingOver(false);
    setIsDraggingOverCurrent(false);

    const draggedData = getData<any>();
    if (draggedData) {
      drop && drop(draggedData.data, {
        x: e.clientX,
        y: e.clientY,
        draggingId: draggedData.draggingId,
        droppableId: (e.target as any)?.dataset.droppableId,
      });
    } else {
      drop && drop(undefined, {
        x: e.clientX,
        y: e.clientY,
        draggingId: undefined,
        droppableId: (e.target as any)?.dataset.droppableId,
      });
    }
  }, [getData, drop]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    setIsDraggingOver(false);
    setIsDraggingOverCurrent(false);

    const draggedData = getData();
    if (draggedData) {
      setTimeout(() => leave && leave(draggedData.data, {
        x: e.clientX,
        y: e.clientY,
        draggingId: draggedData.draggingId,
        droppableId: (e.target as any)?.dataset.droppableId,
      }), 0);
    } else {
      leave && leave(undefined, {
        x: e.clientX,
        y: e.clientY,
        draggingId: undefined,
        droppableId: (e.target as any)?.dataset.droppableId,
      });
    }
  }, [getData, leave]);


  useEffect(() => {
    if (element.current) {
      const targetResolved = {
        current: (
          element.current.nodeType === Node.DOCUMENT_NODE
            ? (element.current as Document).body
            : element.current
        ) as HTMLElement,
      };

      if (!targetResolved.current) return;


      Object.assign(targetResolved.current.dataset, { droppableId: id });

      targetResolved.current.addEventListener('dragleave', handleDragLeave);
      targetResolved.current.addEventListener('dragover', handleDragOver);
      targetResolved.current.addEventListener('drop', handleDrop);

      return () => {
        targetResolved.current.removeEventListener('dragleave', handleDragLeave);
        targetResolved.current.removeEventListener('dragover', handleDragOver);
        targetResolved.current.removeEventListener('drop', handleDrop);
      };
    }

    return;
  }, [handleDragLeave, handleDragOver, handleDrop, id, ...deps]);


  return [{
    isDraggingOver,
    isDraggingOverCurrent,
  }];
}
