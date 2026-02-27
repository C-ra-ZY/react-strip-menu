import { useCallback, useEffect, useReducer, useRef } from "react";
import type { MenuState, MenuAction } from "./types";

function menuReducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case "OPEN":
      return {
        ...state,
        dropdownIndex: action.index,
        left: action.left,
        isVisible: true,
        isFirstShowUp: action.isFirst,
        opacity: 1,
      };
    case "CLOSE":
      if (state.dropdownIndex === -1 && state.opacity === 0) {
        return state;
      }
      return {
        ...state,
        dropdownIndex: -1,
        opacity: 0,
      };
    case "HIDE":
      return {
        ...state,
        isVisible: false,
      };
    default:
      return state;
  }
}

const initialState: MenuState = {
  dropdownIndex: -1,
  isVisible: false,
  isFirstShowUp: false,
  left: 0,
  opacity: 0,
};

export function useMenuState(
  duration: number,
  closeDelay?: number,
  onClose?: () => void,
) {
  const [state, dispatch] = useReducer(menuReducer, initialState);

  // Mirror state in a ref so callbacks can read current values
  // without depending on state (avoids useCallback rebuild chains)
  const stateRef = useRef(state);
  stateRef.current = state;

  const inMenu = useRef(false);
  const inTitles = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const open = useCallback(
    (index: number, left: number) => {
      clearCloseTimer();
      const s = stateRef.current;
      const isFirst = !inMenu.current && !inTitles.current && !s.isVisible;
      dispatch({ type: "OPEN", index, left, isFirst });
    },
    [clearCloseTimer],
  );

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    const delay = closeDelay ?? duration;
    closeTimerRef.current = setTimeout(() => {
      if (!inMenu.current && !inTitles.current) {
        const s = stateRef.current;
        if (s.dropdownIndex !== -1 || s.opacity !== 0) {
          dispatch({ type: "CLOSE" });
          onClose?.();
        }
      }
    }, delay);
  }, [clearCloseTimer, closeDelay, duration, onClose]);

  const closeImmediately = useCallback(() => {
    clearCloseTimer();
    const s = stateRef.current;
    if (s.dropdownIndex !== -1 || s.opacity !== 0) {
      dispatch({ type: "CLOSE" });
      onClose?.();
    }
  }, [clearCloseTimer, onClose]);

  const hide = useCallback(() => {
    const s = stateRef.current;
    if (!inMenu.current && !inTitles.current && s.opacity === 0) {
      dispatch({ type: "HIDE" });
    }
  }, []);

  const setInMenu = useCallback((value: boolean) => {
    inMenu.current = value;
  }, []);

  const setInTitles = useCallback((value: boolean) => {
    inTitles.current = value;
  }, []);

  return {
    state,
    open,
    scheduleClose,
    closeImmediately,
    hide,
    setInMenu,
    setInTitles,
    clearCloseTimer,
  };
}
