# React Strip Menu

TypeScript React component library that provides an animated strip/dropdown menu with a minimal API.

This repository is a Bun workspaces monorepo containing both the published package and the demo app.

## Demo

- [Live demo](https://c-ra-zy.github.io/react-strip-menu)

## Install

```bash
npm install react-strip-menu
```

```bash
yarn add react-strip-menu
```

```bash
bun add react-strip-menu
```

## Usage

```tsx
import { ReactStripMenu } from "react-strip-menu";

export function Example() {
  return (
    <ReactStripMenu
      animation="fade"
      align="center"
      duration={300}
      popoverStyle={{
        top: "50px",
        background: "rgba(10, 10, 10, 1)",
        color: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
      }}
      dropdowns={[
        <div key="d1" style={{ width: "120px", height: "80px", padding: "8px" }}>A panel</div>,
        <div key="d2" style={{ width: "180px", height: "120px", padding: "8px" }}>B panel</div>,
        <div key="d3" style={{ width: "240px", height: "160px", padding: "8px" }}>C panel</div>,
      ]}
      onOpen={(index) => console.log("opened", index)}
      onClose={() => console.log("closed")}
    >
      <div style={{ width: "100px", textAlign: "center" }}>A</div>
      <div style={{ width: "100px", textAlign: "center" }}>B</div>
      <div style={{ width: "100px", textAlign: "center" }}>C</div>
    </ReactStripMenu>
  );
}
```
