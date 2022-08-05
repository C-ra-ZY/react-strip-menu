# React Strip Menu

## Description

This is typescript react component library, provides minimalist access for developer to realize a strip menu.

## [Demo](https://c-ra-zy.github.io/react-strip-menu-demo/)

## Install

```bash
npm install react-strip-menu
```

```bash
yarn add react-strip-men
```

## Demo Code

create a create-react-app project

```bash
npx create-react-app its-a-demo --template typescript
```

and paste below content to src/index.tsx
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { Box, Flex } from "rebass";

import { ReactStripMenu } from "react-strip-menu";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Flex
      sx={{
        height: "72px",
        width: "100%",
        display: "flex",
        top: 0,
        zIndex: 999,
        position: "fixed",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingRight: "5%",
        background: "gray",
        backdropFilter: "unset",
      }}
    >
      <ReactStripMenu
        fadeInMode="fade"
        wrapperStyle={{
          transformOrigin: "0 0",
          background: "rgba(10, 10, 10, 1)",
          mixBlendMode: "normal",
          top: "50px",
          color: "#ffffff",
          border: "solid rgba(255, 255, 255, 0.2) 0.5px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 50px 100px rgba(50, 50, 93, 0.1)",
        }}
        dropdowns={[
          <Box sx={{ width: "100px", height: "100px", color: "red" }}>D</Box>,
          <Box sx={{ width: "200px", height: "200px", color: "red" }}>DDD</Box>,
          <Box sx={{ width: "300px", height: "300px", color: "red" }}>
            DDDDD
          </Box>,
        ]}
      >
        <Box textAlign={"center"} width="100px">
          A
        </Box>
        <Box textAlign={"center"} width="100px">
          B
        </Box>
        <Box textAlign={"center"} width="100px">
          C
        </Box>
      </ReactStripMenu>
    </Flex>
  </React.StrictMode>
);
```

run command to view demo
```bash
npm start
```