import { useRef, useLayoutEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { DropdownsWrapperProps } from "./types";

export function DropdownsWrapper({
  duration,
  dropdowns,
  dropdownIndex,
  firstShowUp,
  reducedMotion,
  isVisible,
}: DropdownsWrapperProps) {
  const selfRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width?: number; height?: number }>({});
  const [contentTransform, setContentTransform] = useState("");

  useLayoutEffect(() => {
    if (dropdownIndex < 0) return;

    const el = selfRef.current;
    if (!el) return;

    const inner = el.firstElementChild;
    if (!inner) return;

    const target = inner.children[dropdownIndex] as HTMLElement | undefined;
    if (!target) return;

    setSize({
      width: target.clientWidth,
      height: target.clientHeight,
    });

    let translateX = 0;
    for (let i = 0; i < dropdownIndex; i++) {
      const child = inner.children[i] as HTMLElement | undefined;
      if (child) {
        translateX += child.clientWidth;
      }
    }
    setContentTransform(`translateX(-${translateX}px)`);
  }, [dropdownIndex]);

  const transitionValue = reducedMotion
    ? "none"
    : firstShowUp
      ? `all ${duration}ms ease-in-out, width 0s, height 0s, transform 0s`
      : `all ${duration}ms ease-in-out`;

  const outerStyle = useMemo<CSSProperties>(
    () => ({
      ...size,
      willChange: isVisible ? "transform" : "auto",
      position: "relative",
      transition: transitionValue,
      overflow: "hidden",
    }),
    [size, isVisible, transitionValue],
  );

  const innerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      position: "absolute",
      zIndex: 1,
      willChange: isVisible ? "transform" : "auto",
      transition: transitionValue,
      transform: contentTransform,
    }),
    [isVisible, transitionValue, contentTransform],
  );

  return (
    <div ref={selfRef} style={outerStyle}>
      <div style={innerStyle}>
        {dropdowns}
      </div>
    </div>
  );
}
