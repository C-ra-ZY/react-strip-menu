import React, {
  MouseEvent,
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
} from "react";
import { Flex } from "rebass";
import type { FlexProps, SxStyleProp } from "rebass";

export type FadeInMode = "turnover" | "fade";

function isAncestor(child: HTMLElement, suspected: HTMLElement): Boolean {
  if (child.parentElement === suspected) {
    return true;
  } else if (
    child.parentElement &&
    child.parentElement !== document.documentElement
  ) {
    return isAncestor(child.parentElement, suspected);
  } else if (
    child.parentElement &&
    child.parentElement === document.documentElement &&
    suspected === document.documentElement
  ) {
    return true;
  } else {
    return false;
  }
}

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
  const menuContainer = useRef<HTMLElement>();
  const [menuStyle, setMenuStyle] = useState<SxStyleProp>({});
  const inMenu = useRef({ in: false });
  const onMouseOver = useCallback(
    (evt: MouseEvent) => {
      const target = evt.target as HTMLElement;
      if (
        menuContainer.current &&
        !isAncestor(target as HTMLElement, menuContainer.current!)
      ) {
        for (let index = 0; index < (self.current?.children)!.length; index++) {
          if (
            isAncestor(target, (self.current?.children)![index] as HTMLElement)
          ) {
            const titleContainer = (self.current?.children)![
              index
            ] as HTMLElement;
            let left =
              titleContainer.offsetWidth / 2 + titleContainer.offsetLeft;
            setDropdownIndex(index);
            setMenuStyle((pre: SxStyleProp) => {
              return {
                ...pre,
                transform:
                  `perspective(1500px) ${
                    fadeInMode === "turnover" ? `rotateX(0deg)` : ""
                  }` +
                  (left !== undefined
                    ? `translateX(calc(${left}px - 50%))`
                    : ""),
                opacity: 1,
              };
            });
          }
        }
      }
    },
    [menuContainer]
  );
  const onMouseLeave = useCallback(() => {
    setTimeout(() => {
      if (!inMenu.current.in) {
        setMenuStyle((pre: SxStyleProp & { transform: string }) => {
          if (pre) {
            return {
              ...pre,
              ...(pre!.transform
                ? {
                    transform: pre!.transform!.replace(
                      "rotateX(0deg)",
                      "rotateX(-90deg)"
                    ),
                  }
                : {}),
              opacity: 0,
            };
          } else {
            return pre;
          }
        });
        setTimeout(() => {
          !inMenu.current.in &&
            setMenuStyle((pre: SxStyleProp & { transform: string }) => {
              return pre ? { ...pre, display: "none!important" } : pre;
            });
        }, duration);
      }
    }, 150);
  }, [inMenu, duration]);
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
        ref={menuContainer}
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
  useLayoutEffect(() => {
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
