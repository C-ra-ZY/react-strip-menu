import {
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
  type TransitionEvent,
} from "react";
import type { AlignInMode, ReactStripMenuProps } from "./types";
import { useMenuState } from "./useMenuState";
import { useReducedMotion } from "./useReducedMotion";
import { DropdownsWrapper } from "./DropdownsWrapper";

function getTranslateX(left: number, align: AlignInMode): string {
  if (left === 0) return "";
  return align === "center"
    ? `translateX(calc(${left}px - 50%))`
    : `translateX(${left}px)`;
}

const EMPTY_STYLE: React.CSSProperties = {};

const ROOT_BASE_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  position: "relative",
};
export function ReactStripMenu({
  popoverStyle = EMPTY_STYLE,
  align = "center",
  animation = "flip",
  duration = 300,
  closeDelay,
  dropdowns,
  children,
  onOpen,
  onClose,
  className,
  style,
}: ReactStripMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<(HTMLElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  const {
    state,
    open,
    scheduleClose,
    closeImmediately,
    hide,
    setInMenu,
    setInTitles,
  } = useMenuState(duration, closeDelay, onClose);

  const stateRef = useRef(state);
  stateRef.current = state;

  const childArray = useMemo(
    () => (Array.isArray(children) ? children : [children]),
    [children],
  );

  if (childArray.length !== dropdowns.length) {
    console.error(
      `[ReactStripMenu] children count (${childArray.length}) does not match dropdowns count (${dropdowns.length}).`,
    );
  }

  // --- Helpers ---

  const openByIndex = useCallback(
    (index: number) => {
      const root = rootRef.current;
      if (!root) return;
      const triggerEl = root.children[index] as HTMLElement | undefined;
      if (!triggerEl) return;
      const left =
        align === "center"
          ? triggerEl.offsetWidth / 2 + triggerEl.offsetLeft
          : triggerEl.offsetLeft;
      open(index, left);
      onOpen?.(index);
    },
    [align, open, onOpen],
  );

  const closeMenu = useCallback(() => {
    closeImmediately();
  }, [closeImmediately]);

  // --- Mouse handlers ---

  const handleTriggerMouseEnter = useCallback(
    (index: number) => {
      openByIndex(index);
      setInTitles(true);
    },
    [openByIndex, setInTitles],
  );

  const handleMouseLeave = useCallback(() => {
    setInTitles(false);
    scheduleClose();
  }, [setInTitles, scheduleClose]);

  const handleTransitionEnd = useCallback(
    (evt: TransitionEvent) => {
      if (evt.target !== popoverRef.current) return;
      hide();
    },
    [hide],
  );

  const handlePopoverMouseOver = useCallback(() => {
    setInMenu(true);
  }, [setInMenu]);

  const handlePopoverMouseLeave = useCallback(() => {
    setInMenu(false);
    scheduleClose();
  }, [setInMenu, scheduleClose]);

  // --- Keyboard handler ---

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      const triggerCount = childArray.length;
      const currentIndex = stateRef.current.dropdownIndex;

      switch (evt.key) {
        case "ArrowRight": {
          evt.preventDefault();
          const next = currentIndex < triggerCount - 1 ? currentIndex + 1 : 0;
          openByIndex(next);
          triggerRefs.current[next]?.focus();
          break;
        }
        case "ArrowLeft": {
          evt.preventDefault();
          const prev = currentIndex > 0 ? currentIndex - 1 : triggerCount - 1;
          openByIndex(prev);
          triggerRefs.current[prev]?.focus();
          break;
        }
        case "ArrowDown": {
          evt.preventDefault();
          // Focus into the popover content
          const popover = popoverRef.current;
          if (popover) {
            const firstFocusable = popover.querySelector<HTMLElement>(
              "a, button, input, [tabindex]",
            );
            firstFocusable?.focus();
          }
          break;
        }
        case "Enter":
        case " ": {
          evt.preventDefault();
          if (currentIndex === -1) {
            // Find which trigger is focused
            const focused = document.activeElement as HTMLElement;
            const root = rootRef.current;
            if (root) {
              const triggerCount2 = root.children.length - 1;
              for (let i = 0; i < triggerCount2; i++) {
                if (root.children[i]?.contains(focused)) {
                  openByIndex(i);
                  break;
                }
              }
            }
          } else {
            closeMenu();
          }
          break;
        }
        case "Escape": {
          evt.preventDefault();
          closeMenu();
          // Return focus to the trigger that opened the menu
          if (currentIndex >= 0) {
            triggerRefs.current[currentIndex]?.focus();
          }
          break;
        }
        case "Tab": {
          // Close the menu on Tab to let natural tab order continue
          if (stateRef.current.isVisible) {
            closeMenu();
          }
          break;
        }
      }
    },
    [childArray.length, openByIndex, closeMenu],
  );

  const triggerRefHandlers = useMemo(
    () =>
      childArray.map(
        (_, i) => (el: HTMLElement | null) => {
          triggerRefs.current[i] = el;
        },
      ),
    [childArray.length],
  );

  const triggerEnterHandlers = useMemo(
    () => childArray.map((_, i) => () => handleTriggerMouseEnter(i)),
    [childArray.length, handleTriggerMouseEnter],
  );

  // --- Computed styles ---

  const translateX = getTranslateX(state.left, align);
  const useTransitionAnim = !state.isFirstShowUp;

  const baseTransform = "perspective(1500px)";
  const animationTransform =
    animation === "flip"
      ? state.opacity === 1
        ? `${baseTransform} rotateX(0deg)`
        : `${baseTransform} rotateX(-90deg)`
      : baseTransform;

  const popoverTransition = reducedMotion
    ? "none"
    : useTransitionAnim
      ? `all ${duration}ms ease-in-out`
      : `opacity ${duration}ms ease-in-out, transform 0s`;

  const popoverComputedStyle = useMemo<React.CSSProperties>(() => ({
    willChange: state.isVisible ? "transform, opacity" : "auto",
    transformOrigin: "50% 0%",
    transform: [animationTransform, translateX].filter(Boolean).join(" "),
    opacity: state.opacity,
    position: "absolute",
    background: "transparent",
    width: "fit-content",
    height: "fit-content",
    visibility: state.isVisible ? "visible" : "hidden",
    transition: popoverTransition,
    ...popoverStyle,
  }), [
    state.isVisible,
    state.opacity,
    animationTransform,
    translateX,
    popoverTransition,
    popoverStyle,
  ]);
  return (
    <div
      ref={rootRef}
      className={className}
      role="menubar"
      onMouseLeave={handleMouseLeave}
      onTransitionEnd={handleTransitionEnd}
      onKeyDown={handleKeyDown}
      style={style ? { ...ROOT_BASE_STYLE, ...style } : ROOT_BASE_STYLE}
    >
      {childArray.map((child, i) => (
        <div
          key={i}
          role="menuitem"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={state.dropdownIndex === i}
          ref={triggerRefHandlers[i]}
          onMouseEnter={triggerEnterHandlers[i]}
        >
          {child}
        </div>
      ))}
      <div
        ref={popoverRef}
        role="menu"
        aria-hidden={!state.isVisible}
        onMouseOver={handlePopoverMouseOver}
        onMouseLeave={handlePopoverMouseLeave}
        style={popoverComputedStyle}
      >
        <DropdownsWrapper
          duration={duration}
          dropdowns={dropdowns}
          dropdownIndex={state.dropdownIndex}
          firstShowUp={state.isFirstShowUp}
          reducedMotion={reducedMotion}
          isVisible={state.isVisible}
        />
      </div>
    </div>
  );
}
