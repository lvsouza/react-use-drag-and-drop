import { DragAndDropProvider } from 'react-use-drag-and-drop/src';

import { Example } from './Example';
import './../styles.css';


export const App = () => {
  return (
    <div className='w-screen h-screen bg-paper flex flex-col justify-center items-center gap-8'>
      <div className='flex flex-col justify-center items-center gap-8 bg-blue-500/50 p-2'>
        Single context
        <DragAndDropProvider>
          <Example />

          <div className='flex-1 flex justify-center items-center gap-8 bg-blue-500/50 p-2'>
            Nested context
            <DragAndDropProvider>
              <Example />
            </DragAndDropProvider>
          </div>
        </DragAndDropProvider>
      </div >
    </div >
  );
}
