import React, { useCallback, useEffect, useState } from "react"

import { TDropMonitor, useDragAndDropContext } from "./../contexts"


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
  drop?: (data: T | undefined, monitor: TDropMonitor) => void;
  leave?: (data: T | undefined, monitor: TDropMonitor) => void;
  hover?: (data: T | undefined, monitor: TDropMonitor) => void;
}
type TUseDropProps = <T = any>(props: DropProps<T>, deps?: ReadonlyArray<any>) => DropResult

export const useDrop: TUseDropProps = ({ id, element, hover, leave, drop }, deps = []) => {
  const { getData, setMonitor } = useDragAndDropContext();

  const [isDraggingOverCurrent, setIsDraggingOverCurrent] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);


  const handleDragOver = useCallback((e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDraggingOver(true);
    setIsDraggingOverCurrent((e.target as any)?.dataset.droppableId === id);

    const draggedData = getData<any>();
    if (draggedData) {
      const monitor = {
        x: e.clientX,
        y: e.clientY,
        draggingId: draggedData.draggingId,
        droppableId: (e.target as any)?.dataset.droppableId,
      };

      setMonitor(monitor)
      hover && hover(draggedData.data, monitor);
    } else {
      const monitor = {
        x: e.clientX,
        y: e.clientY,
        draggingId: undefined,
        droppableId: (e.target as any)?.dataset.droppableId,
      };

      setMonitor(monitor)
      hover && hover(undefined, monitor);
    }
  }, [getData, setMonitor, hover, id, ...deps]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDraggingOver(false);
    setIsDraggingOverCurrent(false);

    const draggedData = getData<any>();
    if (draggedData) {
      const monitor = {
        x: e.clientX,
        y: e.clientY,
        draggingId: draggedData.draggingId,
        droppableId: (e.target as any)?.dataset.droppableId,
      };
      setMonitor(monitor);
      drop && drop(draggedData.data, monitor);
    } else {
      const monitor = {
        x: e.clientX,
        y: e.clientY,
        draggingId: undefined,
        droppableId: (e.target as any)?.dataset.droppableId,
      };
      setMonitor(monitor);
      drop && drop(undefined, monitor);
    }
  }, [getData, setMonitor, drop]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    setIsDraggingOver(false);
    setIsDraggingOverCurrent(false);

    const draggedData = getData();
    if (draggedData) {
      setTimeout(() => {
        const monitor = {
          x: e.clientX,
          y: e.clientY,
          draggingId: draggedData.draggingId,
          droppableId: (e.target as any)?.dataset.droppableId,
        };
        setMonitor(monitor);
        leave && leave(draggedData.data, monitor);
      }, 0);
    } else {
      const monitor = {
        x: e.clientX,
        y: e.clientY,
        draggingId: undefined,
        droppableId: (e.target as any)?.dataset.droppableId,
      };
      setMonitor(monitor);
      leave && leave(undefined, monitor);
    }
  }, [getData, setMonitor, leave]);


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
