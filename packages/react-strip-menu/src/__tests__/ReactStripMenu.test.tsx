import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ReactStripMenu } from "../ReactStripMenu";

function renderMenu(props = {}) {
  const defaultDropdowns = [
    <div key="d1" data-testid="dropdown-0">Dropdown A</div>,
    <div key="d2" data-testid="dropdown-1">Dropdown B</div>,
    <div key="d3" data-testid="dropdown-2">Dropdown C</div>,
  ];

  return render(
    <ReactStripMenu
      dropdowns={defaultDropdowns}
      {...props}
    >
      <span>Item A</span>
      <span>Item B</span>
      <span>Item C</span>
    </ReactStripMenu>,
  );
}

describe("ReactStripMenu", () => {
  describe("rendering", () => {
    it("should render all trigger children", () => {
      renderMenu();
      expect(screen.getByText("Item A")).toBeInTheDocument();
      expect(screen.getByText("Item B")).toBeInTheDocument();
      expect(screen.getByText("Item C")).toBeInTheDocument();
    });

    it("should render all dropdown items", () => {
      renderMenu();
      expect(screen.getByTestId("dropdown-0")).toBeInTheDocument();
      expect(screen.getByTestId("dropdown-1")).toBeInTheDocument();
      expect(screen.getByTestId("dropdown-2")).toBeInTheDocument();
    });

    it("should start with popover hidden", () => {
      renderMenu();
      const popover = screen.getByRole("menu", { hidden: true });
      expect(popover).toHaveAttribute("aria-hidden", "true");
      expect(popover).toHaveStyle({ visibility: "hidden" });
    });
  });

  describe("ARIA attributes", () => {
    it("should have role=menubar on root", () => {
      renderMenu();
      expect(screen.getByRole("menubar")).toBeInTheDocument();
    });

    it("should have role=menuitem with aria-haspopup on each trigger", () => {
      renderMenu();
      const items = screen.getAllByRole("menuitem");
      expect(items).toHaveLength(3);
      items.forEach((item) => {
        expect(item).toHaveAttribute("aria-haspopup", "true");
        expect(item).toHaveAttribute("aria-expanded", "false");
        expect(item).toHaveAttribute("tabindex", "0");
      });
    });

    it("should have role=menu on popover", () => {
      renderMenu();
      const menu = screen.getByRole("menu", { hidden: true });
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("mouse interaction", () => {
    it("should open dropdown on mouse over trigger", () => {
      renderMenu();
      const itemA = screen.getByText("Item A");
      fireEvent.mouseOver(itemA);

      const triggers = screen.getAllByRole("menuitem");
      expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    });

    it("should call onOpen callback on hover", () => {
      const onOpen = vi.fn();
      renderMenu({ onOpen });
      const itemB = screen.getByText("Item B");
      fireEvent.mouseOver(itemB);
      expect(onOpen).toHaveBeenCalledWith(1);
    });
  });

  describe("keyboard navigation", () => {
    it("should open dropdown on Enter key", async () => {
      const user = userEvent.setup();
      renderMenu();

      const triggers = screen.getAllByRole("menuitem");
      triggers[0]!.focus();
      await user.keyboard("{Enter}");

      expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    });

    it("should open dropdown on Space key", async () => {
      const user = userEvent.setup();
      renderMenu();

      const triggers = screen.getAllByRole("menuitem");
      triggers[0]!.focus();
      await user.keyboard(" ");

      expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    });

    it("should navigate right with ArrowRight", async () => {
      const user = userEvent.setup();
      const onOpen = vi.fn();
      renderMenu({ onOpen });

      const triggers = screen.getAllByRole("menuitem");
      triggers[0]!.focus();

      // Open first trigger explicitly (no auto-open on focus)
      await user.keyboard("{Enter}");
      expect(onOpen).toHaveBeenCalledWith(0);

      // ArrowRight should navigate to next trigger
      await user.keyboard("{ArrowRight}");
      expect(onOpen).toHaveBeenCalledWith(1);
    });

    it("should navigate left with ArrowLeft and wrap around", async () => {
      const user = userEvent.setup();
      const onOpen = vi.fn();
      renderMenu({ onOpen });

      const triggers = screen.getAllByRole("menuitem");
      triggers[0]!.focus();

      // ArrowLeft from first → should wrap to last (index 2)
      await user.keyboard("{ArrowLeft}");

      expect(onOpen).toHaveBeenCalledWith(2);
    });

    it("should close on Escape and return focus to trigger", async () => {
      const user = userEvent.setup();
      renderMenu();

      const triggers = screen.getAllByRole("menuitem");
      triggers[1]!.focus();

      // Open
      await user.keyboard("{Enter}");
      expect(triggers[1]).toHaveAttribute("aria-expanded", "true");

      // Close with Escape
      await user.keyboard("{Escape}");
      expect(triggers[1]).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("error handling", () => {
    it("should log error when children/dropdowns count mismatch", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(
        <ReactStripMenu
          dropdowns={[
            <div key="d1">One</div>,
            <div key="d2">Two</div>,
          ]}
        >
          <span>Only One</span>
        </ReactStripMenu>,
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ReactStripMenu] children count"),
      );
      consoleSpy.mockRestore();
    });
  });
});
