<p align="center">
  <img src="./docs/logo.png" width="150" alt="react-use-drag-and-drop" />
  <h1 align="center">react-use-drag-and-drop</h1>
</p>

 [![NPM](https://img.shields.io/npm/v/react-use-drag-and-drop.svg)](https://www.npmjs.com/package/react-use-drag-and-drop) [![JavaScript Style Guide](https://img.shields.io/npm/dm/react-use-drag-and-drop.svg)](https://www.npmjs.com/package/react-use-drag-and-drop) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

 # Overview

This library will help you to drag and drop elements on the web. With a very simple use it is perfect for drag and drop in simple or even complex scenarios.

## Install

```bash
npm install --save react-use-drag-and-drop
```
or
```bash
yarn add react-use-drag-and-drop
```

## Usage

You need provide the drag and drop context

```ts
import { DragAndDropProvider } from 'react-use-drag-and-drop';
```


```html
<DragAndDropProvider>
  ...
</DragAndDropProvider>

```

Now in your component you can use the hooks, first create your draggable component


```ts
import { useDrag } from 'react-use-drag-and-drop';


const MyComponentDraggable = () => {
  const htmlRef = useRef(null);

  //...

  const { isDragging, preview } = useDrag({
    id,
    canDrag: true,
    data: { counter },
    element: elementToDragRef,
    end: (props) => console.log('end', props),
    start: (props) => console.log('start', props),
  }, [counter, id]);

  //...


  return <button ref={htmlRef}>Drag button</button>
}
```

Now you ca create your droppable component 

```ts
import { useDrop } from 'react-use-drag-and-drop';


const MyComponentDroppable = () => {
  const htmlRef = useRef(null);

  //...

  const [{ isDraggingOver, isDraggingOverCurrent }] = useDrop({
    id,
    element: elementToDropRef,
    drop: (data, monitor) => console.log('drop', data, monitor),
    hover: (data, monitor) => console.log('hover', data, monitor),
    leave: (data, monitor) => console.log('leave', data, monitor),
  }, [id]);

  //...


  return <div ref={htmlRef}>Drop area div</div>
}
```

## Contribute

1. Clone this repository
1. Prefer to use yarn for dependency installation
1. Install the dependencies

    ```
    yarn install
    ```
1. Run the example in local host

    ```
    yarn dev
    ```
1. Change `package.json` version
1. Build the package

    ```
    yarn build
    ```
1. Publish the new version

    ```
    npm publish
    ```