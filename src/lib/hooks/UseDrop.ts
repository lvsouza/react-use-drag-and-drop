import React, { useEffect, useRef, useState } from "react";

import { useDragAndDropContext, TDragAndDropMonitor } from "./../contexts/DragAndDropProvider";


/**
 * The state returned by the useDrop hook.
 * Represented as a tuple where the first element contains the status flags.
 */
type DropResult = [{
  /** 
   * Indicates if a draggable item is currently over this element or any of its children.
   */
  isDraggingOver: boolean;
  /** 
   * Indicates if a draggable item is hovering strictly over this specific droppable element, excluding its children. Useful for nested drop zones.
   */
  isDraggingOverCurrent: boolean;
}];

/**
 * Configuration properties for the useDrop hook.
 * @template T - The expected type of the data being dropped.
 */
type DropProps<T> = {
  /** 
   * A unique identifier for this droppable area. Helps distinguish between different drop targets in the monitor.
   */
  id: string;
  /** 
   * React RefObject pointing to the DOM element (HTML, SVG, or Document) that will act as the drop target.
   */
  element: React.RefObject<HTMLElement | SVGElement | Document | null>;
  /** 
   * Callback fired when a draggable item is released over this target.
   * 
   * @param data - The data payload from the dragged item.
   * @param monitor - The current state of the drag operation (coordinates, IDs).
   */
  drop?: (data: T | undefined, monitor: TDragAndDropMonitor) => void;
  /** 
   * Callback fired when a draggable item leaves the bounds of this target.
   * 
   * @param data - The data payload from the dragged item.
   * @param monitor - The state of the drag operation at the moment of leaving.
   */
  leave?: (data: T | undefined, monitor: TDragAndDropMonitor) => void;
  /** 
   * Callback fired continuously while a draggable item is moved over this target.
   * 
   * Note: This runs at a high frequency but is optimized for performance.
   * 
   * @param data - The data payload from the dragged item.
   * @param monitor - Real-time spatial data (X/Y coordinates).
   */
  hover?: (data: T | undefined, monitor: TDragAndDropMonitor) => void;
};

/**
 * Functional type definition for the useDrop hook.
 * 
 * @template T - The type of data this drop zone is expected to receive.
 * @param props - Drop configuration and event handlers.
 * @param deps - Dependency array to refresh listeners or callbacks.
 */
type TUseDropProps = <T = any>(props: DropProps<T>, deps?: ReadonlyArray<any>) => DropResult;

/**
 * Hook to transform an element into a droppable target. It manages event listeners and provides reactive state for drag-over visual cues.
 */
export const useDrop: TUseDropProps = ({ id, element, hover, leave, drop }, deps = []) => {
  const { getData, setMonitor } = useDragAndDropContext();

  const [isDraggingOverCurrent, setIsDraggingOverCurrent] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);


  const callbacks = useRef({ hover, leave, drop });
  useEffect(() => {
    callbacks.current = { hover, leave, drop };
  }, [hover, leave, drop, ...deps]);

  useEffect(() => {
    const targetNode = element.current && element.current.nodeType === Node.DOCUMENT_NODE
      ? (element.current as Document).body
      : (element.current as HTMLElement);

    if (!targetNode) return;

    targetNode.dataset.droppableId = id;

    const createMonitor = (e: DragEvent): TDragAndDropMonitor => {
      const draggedData = getData<any>();
      return {
        x: e.clientX,
        y: e.clientY,
        draggingId: draggedData?.draggingId,
        droppableId: (e.target as HTMLElement)?.dataset?.droppableId,
      };
    };


    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDraggingOver(prev => !prev ? true : prev);

      const isCurrent = (e.target as HTMLElement)?.dataset?.droppableId === id;
      setIsDraggingOverCurrent(prev => prev === isCurrent ? prev : isCurrent);

      const monitor = createMonitor(e);
      setMonitor(monitor);

      if (callbacks.current.hover) {
        callbacks.current.hover(getData()?.data, monitor);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDraggingOver(false);
      setIsDraggingOverCurrent(false);

      const monitor = createMonitor(e);
      setMonitor(monitor);

      if (callbacks.current.drop) {
        callbacks.current.drop(getData()?.data, monitor);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      setIsDraggingOver(false);
      setIsDraggingOverCurrent(false);

      const monitor = createMonitor(e);
      setMonitor(monitor);

      if (callbacks.current.leave) {
        setTimeout(() => {
          callbacks.current.leave?.(getData()?.data, monitor);
        }, 0);
      }
    };

    targetNode.addEventListener('dragleave', handleDragLeave);
    targetNode.addEventListener('dragover', handleDragOver);
    targetNode.addEventListener('drop', handleDrop);

    return () => {
      targetNode.removeEventListener('dragleave', handleDragLeave);
      targetNode.removeEventListener('dragover', handleDragOver);
      targetNode.removeEventListener('drop', handleDrop);
    };
  }, [element, id, getData, setMonitor]);


  return [{
    isDraggingOver,
    isDraggingOverCurrent,
  }];
};
