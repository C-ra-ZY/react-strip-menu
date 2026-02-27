import type { CSSProperties, ReactElement } from "react";

/** Animation mode for dropdown appearance */
export type FadeInMode = "flip" | "fade";

/** Alignment mode for dropdown positioning relative to its trigger */
export type AlignInMode = "left" | "center";

export interface ReactStripMenuProps {
  /** Style applied to the dropdown popover container */
  popoverStyle?: CSSProperties;
  /** How to align the dropdown relative to its trigger. @default "center" */
  align?: AlignInMode;
  /** Animation mode. @default "flip" */
  animation?: FadeInMode;
  /** Duration of transitions in ms. @default 300 */
  duration?: number;
  /** Delay before closing on mouse leave, in ms. @default same as duration */
  closeDelay?: number;
  /** Array of dropdown panels, one per trigger child */
  dropdowns: ReactElement[];
  /** Trigger elements (must match dropdowns.length) */
  children: ReactElement | ReactElement[];
  /** Callback fired when a dropdown opens */
  onOpen?: (index: number) => void;
  /** Callback fired when the dropdown closes */
  onClose?: () => void;
  /** Additional className for the root element */
  className?: string;
  /** Additional inline style for the root element */
  style?: CSSProperties;
}

export interface DropdownsWrapperProps {
  duration: number;
  dropdowns: ReactElement[];
  dropdownIndex: number;
  firstShowUp: boolean;
  reducedMotion: boolean;
  isVisible: boolean;
}

/** Internal state managed by the hover reducer */
export interface MenuState {
  dropdownIndex: number;
  isVisible: boolean;
  isFirstShowUp: boolean;
  left: number;
  opacity: number;
}

export type MenuAction =
  | { type: "OPEN"; index: number; left: number; isFirst: boolean }
  | { type: "CLOSE" }
  | { type: "HIDE" };
