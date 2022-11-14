import { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-use-drag-and-drop';


export const Home = () => {
  return (
    <div>
      <Droppable id="1">
        <Droppable id="2" />
      </Droppable>
      <Droppable id="3" />

      <hr />

      <Draggable id="1" />
      <Draggable id="2" />
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
    element: elementToDragRef.current,
    end: (props) => console.log('end', props),
    start: (props) => console.log('start', props),
  }, [counter, id]);


  return (
    <button ref={elementToDragRef} style={{ opacity: isDragging ? 0.5 : 1 }}>
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
  });


  return (
    <button ref={elementToDropRef} style={{ border: isDraggingOverCurrent ? '10px solid black' : isDraggingOver ? '10px dashed red' : '10px solid transparent' }}>
      Drop {id} -- {children}
    </button>
  );
};
