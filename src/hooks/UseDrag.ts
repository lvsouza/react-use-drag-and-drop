import React, { useCallback, useEffect, useState } from "react"

import { useDragAndDropContext } from "./../contexts"


type TDragLayerGet = () => Element | HTMLElement;
type TDragLayerOptions = { x: number, y: number };
type TDragLayerRemove = (customDragLayer: Element | HTMLElement) => void;

type DragResult = {
  isDragging: boolean;
  preview: (getDragLayer: TDragLayerGet, removeDragLayer?: TDragLayerRemove, options?: TDragLayerOptions) => void;
}
type DragProps<T> = {
  data: T,
  id: string;
  canDrag?: boolean;
  end?: (data: T) => void;
  start?: (data: T) => void;
  element: React.RefObject<HTMLElement | null>;
}
type TUseDragProps = <T = any>(props: DragProps<T>, deps?: ReadonlyArray<any>) => DragResult

export const useDrag: TUseDragProps = ({ element, data, id, canDrag = true, start, end }, deps = []) => {
  const [removeDragLayer, setRemoveDragLayer] = useState<TDragLayerRemove | null>(null);
  const [dragLayerOption, setDragLayerOptions] = useState<TDragLayerOptions>({ x: -10, y: 10 });
  const [getDragLayer, setGetDragLayer] = useState<TDragLayerGet | null>(null);

  const { setData, clearData, draggingIdSubscriber, updateDataOnly } = useDragAndDropContext();
  const [isDragging, setIsDragging] = useState(false);


  useEffect(() => {
    const draggingIdSubscription = draggingIdSubscriber(newId => {
      if (newId === id) {
        setIsDragging(old => old === true ? old : true);
      } else if (isDragging) {
        setIsDragging(old => old === false ? old : false);
      }
    });

    return draggingIdSubscription.unsubscribe;
  }, [draggingIdSubscriber, id, isDragging]);

  // Registre drag handle
  useEffect(() => {
    if (element.current && canDrag) {
      element.current.draggable = true;
      element.current.dataset.draggableId = id;

      const handleDragStart = (e: DragEvent) => {
        e.stopPropagation();

        if (e.dataTransfer && getDragLayer) {
          const currentDragLayer = getDragLayer();
          e.dataTransfer.setDragImage(currentDragLayer, dragLayerOption.x, dragLayerOption.y);
          setTimeout(() => removeDragLayer && removeDragLayer(currentDragLayer), 0);
        }

        setTimeout(() => {
          setData({ data, draggingId: id });
          start && start(data);
        }, 0);
      };

      const handleDragEnd = () => {
        setTimeout(() => end && end(data), 0);
        clearData();
      };

      element.current.addEventListener('dragstart', handleDragStart);
      element.current.addEventListener('dragend', handleDragEnd);
      return () => {
        element.current?.removeEventListener('dragstart', handleDragStart);
        element.current?.removeEventListener('dragend', handleDragEnd);
      };
    }
    return;
  }, [canDrag, id, ...deps, dragLayerOption, getDragLayer, end, start, setData, clearData, removeDragLayer]);

  /* update data during the drag */
  useEffect(() => {
    if (isDragging) updateDataOnly(data);
  }, [isDragging, data, ...deps, updateDataOnly]);


  const handlePreview: DragResult['preview'] = useCallback((getDragLayer, removeDragLayer, options) => {
    setGetDragLayer(() => getDragLayer);
    setRemoveDragLayer(() => removeDragLayer);
    if (options) setDragLayerOptions(options);
  }, []);


  return {
    isDragging,
    preview: handlePreview
  };
}
