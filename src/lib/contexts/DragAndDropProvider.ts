import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { IObservable, ISubscription, observe } from "react-observing";


const emptyContext = {} as IDragAndDropContextData;

export type TDropMonitor = {
  x: number;
  y: number;
  droppableId: string;
  draggingId: string | undefined;
}

export type TDragMonitor = {
  x: number;
  y: number;
  draggingId: string;
  droppableId: string | undefined;
}

interface IDragAndDropContextData {
  clearData: () => void;
  updateDataOnly: <T = any>(newData: T) => void;
  getMonitor: () => IObservable<TDropMonitor | TDragMonitor | null>;
  setMonitor: (monitor: TDropMonitor | TDragMonitor | null) => void;
  getData: <T = any>() => TStoredData<T> | undefined;
  setData: <T = any>(newData: TStoredData<T>) => void;
  draggingIdSubscriber: (callback: (val: string | undefined) => void) => ISubscription;
}
const DragAndDropContext = createContext(emptyContext);

export const useDragAndDropContext = () => useContext(DragAndDropContext);

export type TStoredData<T> = {
  data: T;
  draggingId: string | undefined;
}
interface IDragAndDropProviderProps {
  children: React.ReactNode;
}
export const DragAndDropProvider = ({ children }: IDragAndDropProviderProps) => {
  const nestedContext = useContext(DragAndDropContext);


  const monitorRef = useRef<IObservable<TDropMonitor | TDragMonitor | null>>(observe(null));
  const dragStore = useRef<TStoredData<any>>({ data: undefined, draggingId: undefined });
  const dragStoreId = useRef<IObservable<string | undefined>>(observe(undefined));


  useEffect(() => {
    const dragEvent = (e: DragEvent) => {
      if (!dragStore.current.draggingId) return;

      monitorRef.current.value = {
        x: e.clientX,
        y: e.clientY,
        droppableId: undefined,
        draggingId: dragStore.current.draggingId,
      };
    };

    document.addEventListener('dragover', dragEvent);

    return () => {
      document.removeEventListener('dragover', dragEvent);
    };
  }, []);


  const draggingIdSubscriber = useCallback((callback: (val: string | undefined) => void) => {
    return dragStoreId.current.subscribe(callback);
  }, []);

  const getData = useCallback(() => {
    return dragStore.current;
  }, []);

  const setData = useCallback((newData: TStoredData<any>) => {
    dragStore.current.data = newData.data;
    dragStoreId.current.value = newData.draggingId;
    dragStore.current.draggingId = newData.draggingId;
  }, []);

  const clearData = useCallback(() => {
    monitorRef.current.value = null;
    dragStore.current.data = undefined;
    dragStoreId.current.value = undefined;
    dragStore.current.draggingId = undefined;
  }, []);

  const getMonitor = useCallback(() => {
    return monitorRef.current;
  }, []);

  const setMonitor = useCallback((monitor: TDropMonitor | TDragMonitor | null) => {
    monitorRef.current.value = monitor;
  }, []);

  const updateDataOnly = useCallback((newData: any) => {
    dragStore.current.data = newData;
  }, []);


  const contextValue = useMemo(() => {
    const currentContextValue = { getData, setData, clearData, draggingIdSubscriber, updateDataOnly, getMonitor, setMonitor };

    if (nestedContext === emptyContext) return currentContextValue;

    return nestedContext;
  }, [nestedContext, getData, setData, clearData, draggingIdSubscriber, updateDataOnly, getMonitor, setMonitor]);


  return React.createElement(DragAndDropContext.Provider, { value: contextValue }, children);
};
