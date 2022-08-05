import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import { Flex } from "rebass";
import type { FlexProps, SxStyleProp } from "rebass";

export type FadeInMode = "turnover" | "fade";

export function ReactStripMenu({
  wrapperStyle = {},
  fadeInMode = "turnover",
  duration = 300,
  dropdowns,
  children,
}: {
  fadeInMode?: FadeInMode;
  wrapperStyle?: SxStyleProp;
  duration?: number;
  dropdowns: Array<React.ReactElement | JSX.Element>;
} & FlexProps) {
  const [dropdownIndex, setDropdownIndex] = useState<number>(-1);
  const self = useRef<HTMLElement>();
  const [menuStyle, setMenuStyle] = useState<SxStyleProp>({});
  // const [inMenu, setInMenu] = useState(false);
  const inMenu = useRef({ in: false });
  const onMouseOver = useCallback((evt: MouseEvent) => {
    const target = evt.target as HTMLDivElement;
    let left: number | undefined;
    if ((target as HTMLElement).id !== "menu-container") {
      left = target.offsetWidth / 2 + target.offsetLeft;
      for (let index = 0; index < (self.current?.children)!.length; index++) {
        if ((self.current?.children)![index] === target) {
          setDropdownIndex(index);
          setMenuStyle((pre: SxStyleProp) => {
            return {
              ...pre,
              transform:
                `perspective(1500px) ${
                  fadeInMode === "turnover" ? `rotateX(0deg)` : ""
                }` +
                (left !== undefined ? `translateX(calc(${left}px - 50%))` : ""),
              opacity: 1,
            };
          });
        }
      }
    }
  }, []);
  const onMouseLeave = useCallback(() => {
    setTimeout(() => {
      if (!inMenu.current.in) {
        setMenuStyle((pre: SxStyleProp & { transform: string }) => {
          if (pre) {
            return {
              ...pre,
              transform: pre!.transform!.replace(
                "rotateX(0deg)",
                "rotateX(-90deg)"
              ),
              opacity: 0,
            };
          } else {
            return pre;
          }
        });
      }
    }, 150);
  }, [inMenu]);
  const onMouseOverMenu = useCallback(() => {
    inMenu.current.in = true;
  }, []);
  const onMouseLeaveMenu = useCallback(() => {
    inMenu.current.in = false;
  }, []);
  if (Array.isArray(children) && children.length !== dropdowns.length) {
    throw Error("menu doesn't match dropdowns");
  }
  return (
    <Flex
      ref={self}
      flexDirection={"row"}
      justifyContent="space-between"
      sx={{ position: "relative" }}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <Flex
        onMouseOver={onMouseOverMenu}
        onMouseLeave={onMouseLeaveMenu}
        id={"menu-container"}
        sx={{
          willChange: "transform",
          transformOrigin: "50% 0%",
          transform: `perspective(1500px) ${
            fadeInMode === "turnover" ? `rotateX(-90deg)` : ""
          }`,
          opacity: 0,
          position: "absolute",
          background: "transparent",
          width: "fit-content",
          height: "fit-content",
          transition: `all ${duration}ms ease-in-out`,
          ...wrapperStyle,
          ...menuStyle,
        }}
      >
        <DropdownsWrapper
          duration={duration}
          dropdowns={dropdowns}
          dropdownIndex={dropdownIndex}
        />
      </Flex>
    </Flex>
  );
}

function DropdownsWrapper({
  duration = 300,
  dropdowns,
  dropdownIndex,
}: {
  duration?: number;
  dropdowns: React.ReactElement[];
  dropdownIndex: number;
}) {
  const self = useRef<HTMLElement>();
  const [offset, setOffset] = useState({});
  const [contentStyle, setContentStyle] = useState({});
  useEffect(() => {
    if (
      self.current &&
      self.current.children[0] &&
      self.current.children[0].children[dropdownIndex]
    ) {
      setOffset({
        width: self.current.children[0].children[dropdownIndex].clientWidth,
        height: self.current.children[0].children[dropdownIndex].clientHeight,
      });
      const translateX =
        dropdownIndex > 0
          ? new Array(dropdownIndex)
              .fill(true)
              .reduce((acc, cur, currentIndex) => {
                return (
                  self.current!.children[0].children[currentIndex].clientWidth +
                  acc
                );
              }, 0)
          : 0;
      setContentStyle({
        transform: `translateX(-${translateX}px)`,
      });
    }
  }, [dropdownIndex]);
  return (
    <Flex
      ref={self}
      sx={{
        ...offset,
        willChange: "transform",
        position: "relative",
        transition: `all ${duration}ms ease-in-out`,
        overflowX: "hidden",
        overflowY: "hidden",
      }}
    >
      <Flex
        sx={{
          position: "absolute",
          zIndex: 1,
          willChange: "transform",
          transition: `all ${duration}ms ease-in-out`,
          "& > *": {
            zIndex: -1,
          },
          ...contentStyle,
        }}
      >
        {dropdowns}
      </Flex>
    </Flex>
  );
}
