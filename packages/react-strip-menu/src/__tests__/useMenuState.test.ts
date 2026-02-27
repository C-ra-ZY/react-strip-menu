import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useMenuState } from "../useMenuState";

describe("useMenuState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start with initial closed state", () => {
    const { result } = renderHook(() => useMenuState(300));
    expect(result.current.state.dropdownIndex).toBe(-1);
    expect(result.current.state.isVisible).toBe(false);
    expect(result.current.state.opacity).toBe(0);
    expect(result.current.state.left).toBe(0);
  });

  it("should open a dropdown", () => {
    const { result } = renderHook(() => useMenuState(300));

    act(() => {
      result.current.open(1, 150);
    });

    expect(result.current.state.dropdownIndex).toBe(1);
    expect(result.current.state.isVisible).toBe(true);
    expect(result.current.state.opacity).toBe(1);
    expect(result.current.state.left).toBe(150);
  });

  it("should mark first show up correctly", () => {
    const { result } = renderHook(() => useMenuState(300));

    act(() => {
      result.current.open(0, 50);
    });

    // First open when nothing is visible → isFirstShowUp = true
    expect(result.current.state.isFirstShowUp).toBe(true);
  });

  it("should schedule close and dispatch CLOSE after delay", () => {
    const { result } = renderHook(() => useMenuState(300));

    act(() => {
      result.current.open(0, 50);
    });
    expect(result.current.state.isVisible).toBe(true);

    act(() => {
      result.current.setInTitles(false);
      result.current.setInMenu(false);
      result.current.scheduleClose();
    });

    // Not yet closed
    expect(result.current.state.opacity).toBe(1);

    // Fast-forward past the duration
    act(() => {
      vi.advanceTimersByTime(301);
    });

    expect(result.current.state.opacity).toBe(0);
    expect(result.current.state.dropdownIndex).toBe(-1);
  });

  it("should use closeDelay when provided", () => {
    const { result } = renderHook(() => useMenuState(300, 100));

    act(() => {
      result.current.open(0, 50);
    });

    act(() => {
      result.current.setInTitles(false);
      result.current.setInMenu(false);
      result.current.scheduleClose();
    });

    // After 100ms (closeDelay) it should close
    act(() => {
      vi.advanceTimersByTime(101);
    });

    expect(result.current.state.opacity).toBe(0);
  });

  it("should cancel close when re-entering menu", () => {
    const { result } = renderHook(() => useMenuState(300));

    act(() => {
      result.current.open(0, 50);
    });

    act(() => {
      result.current.setInTitles(false);
      result.current.scheduleClose();
    });

    // Re-enter before timeout fires
    act(() => {
      vi.advanceTimersByTime(100);
      result.current.setInMenu(true);
      result.current.open(1, 200);
    });

    // After the original timeout would have fired
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should still be open because we re-entered
    expect(result.current.state.isVisible).toBe(true);
    expect(result.current.state.opacity).toBe(1);
    expect(result.current.state.dropdownIndex).toBe(1);
  });

  it("should hide after opacity reaches 0 and transition ends", () => {
    const { result } = renderHook(() => useMenuState(300));

    act(() => {
      result.current.open(0, 50);
    });

    act(() => {
      result.current.setInTitles(false);
      result.current.setInMenu(false);
      result.current.scheduleClose();
    });

    act(() => {
      vi.advanceTimersByTime(301);
    });

    // opacity is 0 but still visible (waiting for transition end)
    expect(result.current.state.opacity).toBe(0);
    expect(result.current.state.isVisible).toBe(true);

    // Simulate transition end → hide
    act(() => {
      result.current.hide();
    });

    expect(result.current.state.isVisible).toBe(false);
  });
});
