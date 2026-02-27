# React Strip Menu

TypeScript React component library that provides an animated strip/dropdown menu with a minimal API.

This repository is a Bun workspaces monorepo containing both the published package and the demo app.

## Demo

- Live demo: `https://c-ra-zy.github.io/react-strip-menu/`

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

## Monorepo Structure

- `packages/react-strip-menu`: library package (published to npm)
- `packages/demo`: Vite demo app

## Development

Requirements:

- Bun `>=1.3`

Install dependencies:

```bash
bun install
```

From repository root:

```bash
bun run lint
bun run test
bun run build
bun run dev
```

## Demo Deployment

Demo is deployed via GitHub Actions with `.github/workflows/deploy-demo.yml`.

- Build output: `packages/demo/dist`
- Pages base path: `/react-strip-menu/`

## Publish Library

From `packages/react-strip-menu`:

```bash
bun run prepublishOnly
npm publish
```
