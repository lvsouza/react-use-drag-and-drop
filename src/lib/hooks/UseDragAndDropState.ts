import { useCallback, useMemo } from "react"

import { TMonitorState, useDragAndDropContext } from "../contexts/DragAndDropProvider"


/**
 * A cleanup function returned by a subscription.
 * When called, it removes the listener and stops further notifications.
 */
type TUnsubscribe = () => void;

/**
 * Interface for consuming the global Drag and Drop state.
 * * Provides methods to access real-time data (like mouse coordinates) 
 * or the dragging status, either by direct reading or by subscription.
 */
export type TDragAndDropState = {
  /**
   * Accesses the Drag Monitor, which tracks the visual and spatial state 
   * of the current drag operation (coordinates, IDs involved).
   * * @returns An object with methods to read or watch the monitor state.
   */
  getMonitor(): {
    /**
     * Synchronously retrieves the current state of the monitor.
     * Useful for initializing UI or checking values outside of an event loop.
     */
    getCurrentValue(): TMonitorState;
    /**
     * Subscribes a listener to receive updates whenever the monitor state changes 
     * (e.g., when the mouse moves or enters a new drop zone).
     * * @param callback Function that receives the updated monitor state.
     * @returns An unsubscribe function to clean up the listener.
     */
    subscribeToStateChange(callback: (val: TMonitorState) => void): TUnsubscribe;
  };

  /**
   * Accesses the dragging status, indicating if any item is currently 
   * being dragged in the context.
   * * @returns An object with methods to read or watch the dragging status.
   */
  getDragging(): {
    /**
     * Synchronously retrieves the current dragging status.
     * @returns True if an item is being dragged, false otherwise.
     */
    getCurrentValue(): boolean;
    /**
     * Subscribes to changes in the dragging status (e.g., when a drag starts or ends).
     * * @param callback Function that receives the new dragging boolean.
     * @returns An unsubscribe function to clean up the listener.
     */
    subscribeToStateChange(callback: (val: boolean) => void): TUnsubscribe;
  };
}

/**
 * A hook that provides access to the global Drag and Drop state and monitor.
 * 
 * @returns {TDragAndDropState} An object containing:
 * - `getMonitor()`: Methods to track spatial data (coordinates, current drop zone).
 * - `getDragging()`: Methods to track if a drag operation is active.
 * 
 * @example
 * const { getDragging } = useDragAndDropState();
 * 
 * useEffect(() => {
 *     const unsubscribe = getDragging().subscribeToStateChange((isDragging) => {
 *       console.log("Global dragging state:", isDragging);
 *     });
 * 
 *     return unsubscribe;
 * }, [getDragging]);
 */
export function useDragAndDropState(): TDragAndDropState {
  const { getMonitor, draggingIdSubscriber, getData } = useDragAndDropContext();


  const handleGetMonitor = useCallback(() => {
    const observable = getMonitor();

    return {
      getCurrentValue: () => observable.value,
      subscribeToStateChange: (callback: (val: TMonitorState) => void) => {
        return observable.subscribe(callback);
      },
    };
  }, [getMonitor]);

  const handleGetDragging = useCallback(() => {
    return {
      getCurrentValue: () => !!getData().draggingId,
      subscribeToStateChange: (callback: (val: boolean) => void) => {
        return draggingIdSubscriber(val => callback(!!val));
      },
    };
  }, [draggingIdSubscriber, getData]);


  return useMemo(() => ({
    getMonitor: handleGetMonitor,
    getDragging: handleGetDragging,
  }), [handleGetMonitor, handleGetDragging]);
}
