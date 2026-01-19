
<p align="center">
  <img src="./docs/logo.png" width="180" alt="react-use-drag-and-drop Logo" />
</p>

<h1 align="center">react-use-drag-and-drop</h1>

<p align="center">
  <strong>Lightweight, High-Performance, and Headless Drag and Drop for React.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-use-drag-and-drop">
    <img src="https://img.shields.io/npm/v/react-use-drag-and-drop.svg?style=flat-square" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/react-use-drag-and-drop">
    <img src="https://img.shields.io/npm/dm/react-use-drag-and-drop.svg?style=flat-square" alt="Downloads" />
  </a>
  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square" alt="Standard JS" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/npm/l/react-use-drag-and-drop?style=flat-square" alt="License" />
  </a>
</p>

---

## 🚀 Why use this library?

Dragging elements on the web often comes with performance costs. Many libraries trigger React re-renders on every pixel the mouse moves, causing UI jank and lag.

**react-use-drag-and-drop** is different.

* ⚡ **High Performance:** Uses **Observables** and direct DOM event listeners to handle high-frequency events (like `dragover`). React only re-renders when it strictly needs to (e.g., when the drop state actually changes).
* 🎣 **Hooks First:** Simple `useDrag` and `useDrop` hooks that fit naturally into your functional components.
* 🧠 **Headless:** We handle the logic, you handle the UI. No pre-styled components or rigid structures.
* 🛡️ **Type Safe:** Written in TypeScript with full type definitions included.

---

## 📦 Install

```bash
npm install --save react-use-drag-and-drop
# or
yarn add react-use-drag-and-drop

```

---

## ⚡ Quick Start

### 1. Wrap your application

Add the `DragAndDropProvider` at the root (or near the root) of your application. This manages the shared state without polluting your component tree.

```tsx
import { DragAndDropProvider } from 'react-use-drag-and-drop';

const App = () => {
  return (
    <DragAndDropProvider>
      <YourApp />
    </DragAndDropProvider>
  );
};

```

### 2. Make an element Draggable

Use the `useDrag` hook. Attach the reference to the DOM element you want to move.

```tsx
import React, { useRef } from 'react';
import { useDrag } from 'react-use-drag-and-drop';

const DraggableCard = ({ id, title }) => {
  const cardRef = useRef(null);

  const { isDragging } = useDrag({
    id,
    element: cardRef,
    data: { title, id }, // Data to be transferred
    start: (data) => console.log('Started dragging', data),
    end: (data) => console.log('Stopped dragging', data),
  }, [title]); // Dependency array for updates

  return (
    <div 
      ref={cardRef} 
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {title}
    </div>
  );
};

```

### 3. Create a Drop Zone

Use the `useDrop` hook to handle incoming items.

```tsx
import React, { useRef } from 'react';
import { useDrop } from 'react-use-drag-and-drop';

const DropZone = () => {
  const zoneRef = useRef(null);

  const [{ isDraggingOver }] = useDrop({
    id: 'my-drop-zone',
    element: zoneRef,
    // Triggered when an item is dropped here
    drop: (data, monitor) => {
      console.log('Dropped item:', data);
      console.log('Coordinates:', monitor.x, monitor.y);
    },
    // Triggered constantly while hovering (High perf)
    hover: (data, monitor) => {
      // Logic here runs without re-rendering the component!
    }
  });

  return (
    <div 
      ref={zoneRef}
      style={{ 
        border: isDraggingOver ? '2px dashed green' : '1px solid gray',
        background: isDraggingOver ? '#eef' : 'white'
      }}
    >
      {isDraggingOver ? 'Release to Drop!' : 'Drop items here'}
    </div>
  );
};

```

---

## 📖 API Reference

### `useDrag`

```ts
const { isDragging, preview } = useDrag(options, deps);

```

#### Options

| Prop | Type | Description |
| --- | --- | --- |
| `id` | `string` | **Required**. Unique identifier for the draggable item. |
| `element` | `RefObject<HTMLElement>` | **Required**. React Ref attached to the DOM node. |
| `data` | `T` | The data payload to be transferred to the drop zone. |
| `canDrag` | `boolean` | (Optional) Toggle to enable/disable dragging. Default: `true`. |
| `start` | `(data) => void` | Callback when drag starts. |
| `end` | `(data) => void` | Callback when drag ends. |

#### Return

| Property | Type | Description |
| --- | --- | --- |
| `isDragging` | `boolean` | `true` if this specific item is currently being dragged. |
| `preview` | `Function` | Function to set a custom drag layer image/element. |

---

### `useDrop`

```ts
const [{ isDraggingOver, isDraggingOverCurrent }] = useDrop(options, deps);

```

#### Options

| Prop | Type | Description |
| --- | --- | --- |
| `id` | `string` | **Required**. Unique identifier for the drop zone. |
| `element` | `RefObject<HTMLElement>` | **Required**. React Ref attached to the DOM node. |
| `drop` | `(data, monitor) => void` | Callback when a valid item is dropped. |
| `hover` | `(data, monitor) => void` | Callback fired continuously while an item hovers. |
| `leave` | `(data, monitor) => void` | Callback fired when an item leaves the zone. |

#### Return

| Property | Type | Description |
| --- | --- | --- |
| `isDraggingOver` | `boolean` | `true` if an item is hovering over this zone or its children. |
| `isDraggingOverCurrent` | `boolean` | `true` ONLY if the item is hovering strictly over this zone (not children). |

---

## 🤝 Contribute

We welcome contributions! Please follow these steps to run the project locally:

1. **Clone the repo:**
    ```bash
    git clone https://github.com/lvsouza/react-use-drag-and-drop.git
    ```


2. **Install dependencies:**
    ```bash
    yarn install
    ```


3. **Run the example playground:**
    ```bash
    yarn dev
    ```


4. **Build the package:**
    ```bash
    yarn build
    ```


4. **Publish the package:**
    ```bash
    npm publish
    ```



## 📄 License

MIT © Lucas Souza Dev
