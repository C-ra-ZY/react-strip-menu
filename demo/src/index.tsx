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
          <Box
            sx={{ width: "100px", height: "100px", color: "red" }}
            onClick={() => {
              console.log("a");
            }}
          >
            D
          </Box>,
          <Box sx={{ width: "200px", height: "200px", color: "red" }}>DDD</Box>,
          <Box sx={{ width: "300px", height: "300px", color: "red" }}>
            DDDDD
          </Box>,
        ]}
      >
        <Box textAlign={"center"} width="100px">
          <Box>A</Box>
        </Box>
        <Box textAlign={"center"} width="100px">
          <Box>B</Box>
        </Box>
        <Box textAlign={"center"} width="100px">
          <Box>C</Box>
        </Box>
      </ReactStripMenu>
    </Flex>
  </React.StrictMode>
);
