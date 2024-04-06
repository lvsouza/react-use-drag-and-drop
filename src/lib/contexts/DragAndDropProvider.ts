import React, { createContext, useCallback, useContext, useRef } from "react";
import { IObservable, ISubscription, observe } from "react-observing";


interface IDragAndDropContextData {
  clearData: () => void;
  updateDataOnly: <T = any>(newData: T) => void;
  getData: <T = any>() => TStoredData<T> | undefined;
  setData: <T = any>(newData: TStoredData<T>) => void;
  draggingIdSubscriber: (callback: (val: string | undefined) => void) => ISubscription;
}
const DragAndDropContext = createContext({} as IDragAndDropContextData);

export const useDragAndDropContext = () => useContext(DragAndDropContext);

type TStoredData<T> = {
  data: T;
  draggingId: string | undefined;
}
interface IDragAndDropProviderProps {
  children: React.ReactNode;
}
export const DragAndDropProvider = ({ children }: IDragAndDropProviderProps) => {
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


  return React.createElement(
    DragAndDropContext.Provider,
    { value: { getData, setData, clearData, draggingIdSubscriber, updateDataOnly } },
    children
  );
};
