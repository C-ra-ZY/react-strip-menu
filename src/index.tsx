import React, {
  MouseEvent,
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
} from "react";
import { Flex } from "rebass";
import { SystemStyleObject } from "@styled-system/css";
import type { FlexProps, SxStyleProp } from "rebass";

export type FadeInMode = "turnover" | "fade";
export type AlignInMode = "left" | "center";

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
  alignInMode = "center",
  fadeInMode = "turnover",
  duration = 300,
  dropdowns,
  children,
}: {
  alignInMode?: AlignInMode;
  fadeInMode?: FadeInMode;
  wrapperStyle?: SxStyleProp;
  duration?: number;
  dropdowns: Array<React.ReactElement | JSX.Element>;
} & FlexProps) {
  const [dropdownIndex, setDropdownIndex] = useState<number>(-1);
  const self = useRef<HTMLElement>();
  const menuContainer = useRef<HTMLElement>();
  const [classNamesString, setClassNamesString] = useState("");
  const [menuStyle, setMenuStyle] = useState<SxStyleProp>({});
  const [firstShowUp, setFirstShowUp] = useState(false);

  const [left, setLeft] = useState(0);
  const inMenu = useRef({ in: false });
  const inTitles = useRef({ in: false });
  const onMouseOver = useCallback(
    (evt: MouseEvent) => {
      const target = evt.target as HTMLElement;
      if (
        !inMenu.current.in &&
        !inTitles.current.in &&
        menuContainer.current!.style.visibility === "hidden"
      ) {
        setFirstShowUp(true);
      } else {
        setFirstShowUp(false);
      }
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
            setLeft(
              alignInMode === "center"
                ? titleContainer.offsetWidth / 2 + titleContainer.offsetLeft
                : titleContainer.offsetLeft
            );
            setDropdownIndex(index);
            if (
              !inMenu.current.in &&
              !inTitles.current.in &&
              menuContainer.current.style.visibility === "hidden"
            ) {
              setClassNamesString(`${fadeInMode} translateWithoutTransition`);
            } else {
              setClassNamesString(`${fadeInMode} translateWithTransition`);
            }
            setMenuStyle((pre: SxStyleProp & { transform: string }) => {
              menuContainer.current!.style.visibility = "visible";
              return {
                ...pre,
                opacity: 1,
              };
            });
          }
        }
        inTitles.current.in = true;
      }
    },
    [menuContainer, inTitles]
  );
  const onMouseLeave = useCallback(() => {
    inTitles.current.in = false;
    setTimeout(() => {
      if (!inMenu.current.in && !inTitles.current.in) {
        setDropdownIndex(-1);
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
      }
    }, duration);
  }, [inMenu, duration]);

  const onTransitionEnd = useCallback(() => {
    !inMenu.current.in &&
      !inTitles.current.in &&
      (menuStyle as any).opacity == "0" &&
      (menuContainer.current!.style.visibility = "hidden");
  }, [menuStyle]);
  const onMouseOverMenu = useCallback(() => {
    inMenu.current.in = true;
  }, [inMenu]);
  const onMouseLeaveMenu = useCallback(() => {
    inMenu.current.in = false;
  }, [inMenu]);

  if (Array.isArray(children) && children.length !== dropdowns.length) {
    throw Error("menu doesn't match dropdowns");
  }
  return (
    <Flex
      ref={self}
      flexDirection={"row"}
      justifyContent="space-between"
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onTransitionEnd={onTransitionEnd}
      sx={{
        position: "relative",
        ".turnover": {
          transform: `perspective(1500px) rotateX(0deg)`,
          transition: `all ${duration}ms ease-in-out`,
        },
        ".fadeIn": {
          transform: `perspective(1500px)`,
          transition: `all ${duration}ms ease-in-out`,
        },
        ".translateWithTransition": {
          transform: left
            ? `translateX(calc(${left}px${
                alignInMode === "center" ? " - 50%" : ""
              }))`
            : "",
          transition: `all ${duration}ms ease-in-out`,
        },
        ".translateWithoutTransition": {
          transform: left
            ? `translateX(calc(${left}px${
                alignInMode === "center" ? " - 50%" : ""
              }))`
            : "",
          transition: "all ${duration}ms ease-in-out, transform 0",
        },
      }}
    >
      {children}
      <Flex
        onMouseOver={onMouseOverMenu}
        onMouseLeave={onMouseLeaveMenu}
        className={classNamesString}
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
          transition: `opacity ${duration}ms ease-in-out`,
          ...wrapperStyle,
          ...menuStyle,
        }}
      >
        <DropdownsWrapper
          duration={duration}
          dropdowns={dropdowns}
          dropdownIndex={dropdownIndex}
          firstShowUp={firstShowUp}
        />
      </Flex>
    </Flex>
  );
}

function DropdownsWrapper({
  duration = 300,
  dropdowns,
  dropdownIndex,
  firstShowUp = false,
}: {
  duration?: number;
  dropdowns: React.ReactElement[];
  dropdownIndex: number;
  firstShowUp?: boolean;
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
        transition: `all ${duration}ms ease-in-out${
          firstShowUp ? ", width 0, height 0, transform 0" : ""
        }`,
        overflowX: "hidden",
        overflowY: "hidden",
      }}
    >
      <Flex
        sx={{
          position: "absolute",
          zIndex: 1,
          willChange: "transform",
          transition: `all ${duration}ms ease-in-out${
            firstShowUp ? ", width 0, height 0, transform 0" : ""
          }`,
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
