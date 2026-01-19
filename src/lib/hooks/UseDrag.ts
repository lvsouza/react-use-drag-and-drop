import React, { useCallback, useEffect, useRef, useState } from "react";

import { useDragAndDropContext } from "./../contexts/DragAndDropProvider";


/**
 * Configuration stored in a ref to manage the drag preview layer
 * without triggering unnecessary re-renders.
 */
type TPreviewRefConfig = {
  /** Function to retrieve the DOM element to be used as a drag ghost image */
  getLayer: TDragLayerGet | null;
  /** Cleanup function to remove the custom drag layer from the DOM after drag starts */
  removeLayer: TDragLayerRemove | null;
  /** Positioning offsets for the drag preview relative to the mouse cursor */
  options: TDragLayerOptions;
};

/**
 * A function that returns a DOM element (Element or HTMLElement) 
 * to be rendered as the drag preview.
 */
type TDragLayerGet = () => Element | HTMLElement;

/**
 * Represents the X and Y offsets for the drag preview image.
 */
type TDragLayerOptions = {
  /** Horizontal offset in pixels */
  x: number;
  /** Vertical offset in pixels */
  y: number;
};

/**
 * A callback function to clean up or remove the custom drag layer 
 * once the browser has captured the drag image.
 */
type TDragLayerRemove = (customDragLayer: Element | HTMLElement) => void;

/**
 * The object returned by the useDrag hook.
 */
type DragResult = {
  /** Reactive state indicating if the element is currently being dragged */
  isDragging: boolean;
  /**
   * Configures a custom drag preview.
   * @param getDragLayer - Function to get the element for the preview.
   * @param removeDragLayer - (Optional) Function to remove the element after capture.
   * @param options - (Optional) X and Y coordinates for the preview offset.
   */
  preview: (
    getDragLayer: TDragLayerGet,
    removeDragLayer?: TDragLayerRemove,
    options?: TDragLayerOptions
  ) => void;
}

/**
 * Configuration properties for the useDrag hook.
 */
type DragProps<T> = {
  /** The data payload associated with the dragged item */
  data: T,
  /** A unique identifier for the draggable element */
  id: string;
  /** Flag to enable or disable the drag capability. Defaults to true. */
  canDrag?: boolean;
  /** Callback function executed when the drag operation ends */
  end?: (data: T) => void;
  /** Callback function executed when the drag operation starts */
  start?: (data: T) => void;
  /** React RefObject pointing to the DOM element that should be draggable */
  element: React.RefObject<HTMLElement | null>;
}

/**
 * Functional type definition for the useDrag hook.
 * @template T - The type of the data being dragged.
 * @param props - Drag configuration and event handlers.
 * @param deps - Dependency array to refresh listeners if external values change.
 */
type TUseDragProps = <T = any>(props: DragProps<T>, deps?: ReadonlyArray<any>) => DragResult;

/**
 * Hook to transform a DOM element into a draggable source.
 * 
 * It automatically handles the native HTML5 Drag and Drop events, synchronizes the dragged data with the global context, and provides a reactive state to track the dragging status of the element.
 * 
 * @template T - The type of the data object associated with the draggable item.
 * @param {DragProps<T>} props - Configuration for the drag behavior.
 * @param {ReadonlyArray<any>} [deps=[]] - Dependency array to refresh listeners and callbacks when external state changes.
 * @returns {DragResult} An object containing:
 * - `isDragging`: A boolean indicating if this specific element is being dragged.
 * - `preview`: A function to configure custom drag images or layers.
 * 
 * @example
 * const { isDragging, preview } = useDrag({
 *   id: 'item-1',
 *   element: myRef,
 *   data: { name: 'Draggable Item' },
 *   start: (data) => console.log('Started:', data),
 *   end: (data) => console.log('Ended:', data),
 * }, []);
 */
export const useDrag: TUseDragProps = ({ element, data, id, canDrag = true, start, end }, deps = []) => {
  const { setData, clearData, draggingIdSubscriber, updateDataOnly } = useDragAndDropContext();
  const [isDragging, setIsDragging] = useState(false);

  const latestData = useRef(data);
  const callbacks = useRef({ start, end });

  const previewConfig = useRef<TPreviewRefConfig>({
    getLayer: null,
    removeLayer: null,
    options: { x: -10, y: 10 }
  });

  useEffect(() => {
    latestData.current = data;
    callbacks.current = { start, end };
  }, [data, start, end, ...deps]);


  useEffect(() => {
    const draggingIdSubscription = draggingIdSubscriber(newId => {
      setIsDragging(currentIsDragging => {
        const shouldBeDragging = newId === id;
        return currentIsDragging === shouldBeDragging ? currentIsDragging : shouldBeDragging;
      });
    });

    return draggingIdSubscription;
  }, [draggingIdSubscriber, id]);


  useEffect(() => {
    const node = element.current; // Captura a referência atual
    if (!node || !canDrag) return;

    node.draggable = true;
    node.dataset.draggableId = id;

    const handleDragStart = (e: DragEvent) => {
      e.stopPropagation();

      const { getLayer, removeLayer, options } = previewConfig.current;

      if (e.dataTransfer && getLayer) {
        const currentDragLayer = getLayer();
        e.dataTransfer.setDragImage(currentDragLayer, options.x, options.y);
        setTimeout(() => removeLayer && removeLayer(currentDragLayer), 0);
      }

      setTimeout(() => {
        const currentData = latestData.current;
        setData({ data: currentData, draggingId: id });
        callbacks.current.start && callbacks.current.start(currentData);
      }, 0);
    };

    const handleDragEnd = () => {
      setTimeout(() => {
        callbacks.current.end && callbacks.current.end(latestData.current)
      }, 0);
      clearData();
    };

    node.addEventListener('dragstart', handleDragStart);
    node.addEventListener('dragend', handleDragEnd);

    return () => {
      node.removeEventListener('dragstart', handleDragStart);
      node.removeEventListener('dragend', handleDragEnd);
    };
  }, [element, id, canDrag, setData, clearData]);


  useEffect(() => {
    if (isDragging) updateDataOnly(data);
  }, [isDragging, data, updateDataOnly, ...deps]);


  const handlePreview: DragResult['preview'] = useCallback((getDragLayer, removeDragLayer, options) => {
    previewConfig.current.getLayer = getDragLayer;
    previewConfig.current.removeLayer = removeDragLayer || null;
    if (options) previewConfig.current.options = options;
  }, []);

  return {
    isDragging,
    preview: handlePreview
  };
}