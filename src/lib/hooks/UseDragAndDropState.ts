import { useCallback } from "react"

import { useDragAndDropContext } from "../contexts"
import { TMonitor } from './UseDrop';


type TUnsubscribe = () => void;

export type TDragAndDropState = {
  getMonitor(): {
    subscribeToStateChange(callback: (val: TMonitor | null) => void): TUnsubscribe
  };
}

export function useDragAndDropState(): TDragAndDropState {
  const { getMonitor } = useDragAndDropContext();


  const handleGetMonitor = useCallback(() => {
    const monitor = getMonitor();

    const subscribe = (callback: (val: TMonitor | null) => void) => {
      return monitor.subscribe(callback).unsubscribe
    }

    return {
      subscribeToStateChange: subscribe,
    };
  }, [getMonitor]);


  return {
    getMonitor: handleGetMonitor
  };
}
