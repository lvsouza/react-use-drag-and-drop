import React, { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { IObservable, ISubscription, observe } from "react-observing";


const emptyContext = {} as IDragAndDropContextData;


interface IDragAndDropContextData {
  clearData: () => void;
  updateDataOnly: <T = any>(newData: T) => void;
  getData: <T = any>() => TStoredData<T> | undefined;
  setData: <T = any>(newData: TStoredData<T>) => void;
  draggingIdSubscriber: (callback: (val: string | undefined) => void) => ISubscription;
}
const DragAndDropContext = createContext(emptyContext);

export const useDragAndDropContext = () => useContext(DragAndDropContext);

type TStoredData<T> = {
  data: T;
  draggingId: string | undefined;
}
interface IDragAndDropProviderProps {
  children: React.ReactNode;
}
export const DragAndDropProvider = ({ children }: IDragAndDropProviderProps) => {
  const nestedContext = useContext(DragAndDropContext);


  const dragStore = useRef<TStoredData<any>>({ data: undefined, draggingId: undefined });
  const dragStoreId = useRef<IObservable<string | undefined>>(observe(undefined));


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
    dragStore.current.data = undefined;
    dragStoreId.current.value = undefined;
    dragStore.current.draggingId = undefined;
  }, []);

  const updateDataOnly = useCallback((newData: any) => {
    dragStore.current.data = newData;
  }, []);


  const contextValue = useMemo(() => {
    const currentContextValue = { getData, setData, clearData, draggingIdSubscriber, updateDataOnly };

    if (nestedContext === emptyContext) return currentContextValue;

    return nestedContext;
  }, [nestedContext, getData, setData, clearData, draggingIdSubscriber, updateDataOnly]);


  return React.createElement(DragAndDropContext.Provider, { value: contextValue }, children);
};
