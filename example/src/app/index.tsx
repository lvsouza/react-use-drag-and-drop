import { DragAndDropProvider } from 'react-use-drag-and-drop/src';

import { Example } from './Example';
import './../styles.css';


export const App = () => {
  return (
    <div className='w-screen h-screen bg-paper flex justify-center items-center gap-8'>
      <DragAndDropProvider>
        <Example />
      </DragAndDropProvider>
    </div>
  );
}
