import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

/**
 * Interface that defines an observable value
 */
export interface IObservable<T> {
  value: T;
  subscribe(callback: (val: T) => void): () => void;
  notify(): void; // Útil para forçar notificação se o objeto for mutado internamente
}

function observe<T>(initialValue: T): IObservable<T> {
  const listeners = new Set<(value: T) => void>();
  let internalValue = initialValue;

  const subscribe = (fn: (val: T) => void) => {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  };

  const notify = () => {
    listeners.forEach((listener) => listener(internalValue));
  };

  return {
    subscribe,
    notify,
    get value() {
      return internalValue;
    },
    set value(newValue: T) {
      if (internalValue === newValue) return; // Evita disparos desnecessários
      internalValue = newValue;
      notify();
    }
  };
}


export type TDragAndDropMonitor = {
  x: number;
  y: number;
  draggingId: string | undefined;
  droppableId: string | undefined;
}

export type TMonitorState = TDragAndDropMonitor | null;

export type TStoredData<T = any> = {
  data: T;
  draggingId: string | undefined;
}

interface IDragAndDropContextData {
  clearData: () => void;
  getData: <T = any>() => TStoredData<T>;
  getMonitor: () => IObservable<TMonitorState>;
  setMonitor: (monitor: TMonitorState) => void;
  updateDataOnly: <T = any>(newData: T) => void;
  setData: <T = any>(newData: TStoredData<T>) => void;
  draggingIdSubscriber: (callback: (val: string | undefined) => void) => () => void;
}

// Contexto inicial seguro
const DragAndDropContext = createContext<IDragAndDropContextData | null>(null);

export const useDragAndDropContext = () => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error("useDragAndDropContext must be used within a DragAndDropProvider");
  }
  return context;
};

interface IDragAndDropProviderProps {
  children: React.ReactNode;
}
export const DragAndDropProvider = ({ children }: IDragAndDropProviderProps) => {
  const parentContext = useContext(DragAndDropContext);


  const dragStore = useRef<TStoredData<any>>({ data: undefined, draggingId: undefined });
  const dragStoreId = useRef(observe<string | undefined>(undefined));
  const monitorRef = useRef(observe<TMonitorState>(null));


  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      if (!dragStore.current.draggingId) return;

      if (e.defaultPrevented) return;

      monitorRef.current.value = {
        x: e.clientX,
        y: e.clientY,
        droppableId: undefined, // Importante: aqui é undefined pois estamos no "limbo"
        draggingId: dragStore.current.draggingId,
      };
    };

    document.addEventListener('dragover', handleGlobalDragOver);
    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
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
    dragStore.current.draggingId = newData.draggingId;
    dragStoreId.current.value = newData.draggingId;
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

  const setMonitor = useCallback((monitor: TMonitorState) => {
    monitorRef.current.value = monitor;
  }, []);

  const updateDataOnly = useCallback((newData: any) => {
    dragStore.current.data = newData;
  }, []);


  const contextValue = useMemo<IDragAndDropContextData>(() => ({
    getData,
    setData,
    clearData,
    getMonitor,
    setMonitor,
    updateDataOnly,
    draggingIdSubscriber,
  }), [getData, setData, clearData, draggingIdSubscriber, updateDataOnly, getMonitor, setMonitor]);


  if (parentContext) {
    return children;
  }

  return React.createElement(DragAndDropContext.Provider, { value: contextValue }, children);
};
