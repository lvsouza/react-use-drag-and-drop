import { useCallback } from "react"

import { TDragMonitor, TDropMonitor, useDragAndDropContext } from "../contexts"


type TUnsubscribe = () => void;

export type TDragAndDropState = {
  getMonitor(): {
    subscribeToStateChange(callback: (val: TDropMonitor | TDragMonitor | null) => void): TUnsubscribe;
  };
  getDragging(): {
    subscribeToStateChange(callback: (val: boolean) => void): TUnsubscribe;
  };
}

export function useDragAndDropState(): TDragAndDropState {
  const { getMonitor, draggingIdSubscriber } = useDragAndDropContext();


  const handleGetMonitor = useCallback(() => {
    const monitor = getMonitor();

    const subscribe = (callback: (val: TDropMonitor | TDragMonitor | null) => void) => {
      return monitor.subscribe(callback).unsubscribe
    }

    return {
      subscribeToStateChange: subscribe,
    };
  }, [getMonitor]);

  const handleGetDragging = useCallback(() => {

    const subscribe = (callback: (val: boolean) => void) => {
      return draggingIdSubscriber(val => callback(!!val)).unsubscribe
    }

    return {
      subscribeToStateChange: subscribe,
    };
  }, [getMonitor]);


  return {
    getMonitor: handleGetMonitor,
    getDragging: handleGetDragging,
  };
}
