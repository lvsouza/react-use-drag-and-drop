import { useEffect, useRef, useState } from 'react';

import { useDrag, useDrop } from 'react-use-drag-and-drop/src';


export const Example = () => {
  return (
    <div className='flex gap-2'>
      <div className='border p-2 flex gap-2'>
        <Draggable id="1" />
        <Draggable id="2" />
      </div>

      <hr />

      <div className='bg-background p-2 flex gap-2'>
        <Droppable id="1">
          <Droppable id="2" />
        </Droppable>
        <Droppable id="3" />
      </div>
    </div>
  );
}

const Draggable = ({ id }: { id: string }) => {
  const elementToDragRef = useRef<HTMLButtonElement>(null);

  const [counter, setCounter] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setCounter(old => ++old)
    }, 1000);
  }, []);


  const { isDragging } = useDrag({
    id,
    canDrag: true,
    data: { counter },
    element: elementToDragRef,
    end: (props) => console.log('end', props),
    start: (props) => console.log('start', props),
  }, [counter, id]);


  return (
    <button ref={elementToDragRef} className='ring-1 ring-background hover:ring-primary shadow' style={{ opacity: isDragging ? 0.5 : 1 }}>
      Drag {id} -- {isDragging ? 'dragging' : ''} {counter}
    </button>
  );
};

const Droppable = ({ id, children }: { id: string, children?: React.ReactNode }) => {
  const elementToDropRef = useRef<HTMLButtonElement>(null);


  const [{ isDraggingOver, isDraggingOverCurrent }] = useDrop({
    id: id,
    element: elementToDropRef,
    drop: (data, monitor) => console.log('drop', data, monitor),
    hover: (data, monitor) => console.log('hover', data, monitor),
    leave: (data, monitor) => console.log('leave', data, monitor),
  }, [id]);


  return (
    <button
      ref={elementToDropRef}
      className='border hover:bg-red-500/50'
      style={{ border: isDraggingOverCurrent ? '10px solid red' : isDraggingOver ? '10px dashed red' : '10px solid transparent' }}
    >
      Drop {id} -- {children}
    </button>
  );
};
