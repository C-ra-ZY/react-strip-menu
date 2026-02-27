import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { ReactStripMenu } from "react-strip-menu";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <div
      style={{
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
      }}
    >
      <ReactStripMenu
        animation="fade"
        popoverStyle={{
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
        onOpen={(index) => console.log("opened:", index)}
        onClose={() => console.log("closed")}
        dropdowns={[
          <div
            key="d1"
            style={{ width: "100px", height: "100px", color: "red", padding: "8px" }}
            onClick={() => console.log("clicked A dropdown")}
          >
            D
          </div>,
          <div
            key="d2"
            style={{ width: "200px", height: "200px", color: "red", padding: "8px" }}
          >
            DDD
          </div>,
          <div
            key="d3"
            style={{ width: "300px", height: "300px", color: "red", padding: "8px" }}
          >
            DDDDD
          </div>,
        ]}
      >
        <div style={{ textAlign: "center", width: "100px", color:"pink" }}>A</div>
        <div style={{ textAlign: "center", width: "100px", color:"pink" }}>B</div>
        <div style={{ textAlign: "center", width: "100px", color:"pink" }}>C</div>
      </ReactStripMenu>
    </div>
  </React.StrictMode>
);
