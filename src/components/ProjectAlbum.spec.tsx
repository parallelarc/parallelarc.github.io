import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  userEvent,
  within,
} from "../utils/test-utils";
import ProjectAlbum from "./ProjectAlbum";

const images = Array.from({ length: 9 }, (_, index) => ({
  id: `photo-${index + 1}`,
  src: `/photo-${index + 1}.jpg`,
  alt: `Scene ${index + 1}`,
}));

function setup() {
  const user = userEvent.setup();
  const view = render(
    <ProjectAlbum title="Demo" images={images} previewImageIds={["photo-9"]} />
  );
  return { user, ...view };
}

describe("Project album", () => {
  beforeEach(() => {
    // jsdom has no native dialog API or layout; the browser checks cover those.
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value() {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value() {
        this.removeAttribute("open");
      },
    });
    Element.prototype.scrollTo = vi.fn();
    document.body.style.overflow = "";
  });

  it("previews four photos with the chosen cover and the remaining count", () => {
    setup();
    const preview = screen.getAllByRole("img");
    expect(preview).toHaveLength(4);
    expect(preview[0]).toHaveAttribute("src", "/photo-9.jpg");
    expect(screen.getByText("+5")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the clicked photo, navigates in both directions, and selects thumbnails", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /Open photo 4/ }));
    const dialog = screen.getByRole("dialog", { name: "Demo / photos" });
    expect(within(dialog).getByText("4 / 9")).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Next photo" })
    );
    expect(within(dialog).getByText("5 / 9")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /^Photo 1:/ }));
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(within(dialog).getByText("9 / 9")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByText("1 / 9")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /^Photo 7:/ }));
    expect(within(dialog).getByText("7 / 9")).toBeInTheDocument();
  });

  it("changes the preview on a horizontal wheel gesture without consuming vertical scrolling or zoom", () => {
    setup();
    const cover = screen.getByRole("button", { name: /Open photo 1/ });
    expect(fireEvent.wheel(cover, { deltaX: 80, deltaY: 0 })).toBe(false);
    expect(cover).toHaveAccessibleName(/Open photo 2/);
    fireEvent.wheel(cover, { deltaX: 90, deltaY: 0 });
    expect(cover).toHaveAccessibleName(/Open photo 2/);
    expect(fireEvent.wheel(cover, { deltaX: 0, deltaY: 100 })).toBe(true);
    expect(fireEvent.wheel(cover, { deltaX: 100, ctrlKey: true })).toBe(true);
    expect(cover).toHaveAccessibleName(/Open photo 2/);
    fireEvent.wheel(cover, { deltaX: -100, deltaY: 0 });
    expect(cover).toHaveAccessibleName(/Open photo 1/);
  });

  it("restores the opener and previous overflow after closing or cancelling", async () => {
    const { user } = setup();
    document.body.style.overflow = "scroll";
    const opener = screen.getByRole("button", { name: /View all 9 photos/ });
    await user.click(opener);
    expect(document.body.style.overflow).toBe("hidden");
    await user.click(screen.getByRole("button", { name: "Close photos" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("scroll");
    await user.click(opener);
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true })
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("switches on a horizontal swipe while leaving vertical and multi-touch gestures alone", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /View all 9 photos/ }));
    const dialog = screen.getByRole("dialog");
    const stage = within(dialog).getByRole("img").parentElement;
    if (!stage) throw new Error("Missing photo stage");
    const point = (clientX: number, clientY: number) => ({ clientX, clientY });
    fireEvent.touchStart(stage, { touches: [point(200, 100)] });
    fireEvent.touchEnd(stage, {
      touches: [],
      changedTouches: [point(70, 105)],
    });
    expect(within(dialog).getByText("2 / 9")).toBeInTheDocument();
    fireEvent.touchStart(stage, { touches: [point(200, 100)] });
    fireEvent.touchEnd(stage, {
      touches: [],
      changedTouches: [point(180, 280)],
    });
    expect(within(dialog).getByText("2 / 9")).toBeInTheDocument();
    fireEvent.touchStart(stage, { touches: [point(200, 100)] });
    fireEvent.touchMove(stage, { touches: [point(180, 100), point(90, 100)] });
    fireEvent.touchEnd(stage, {
      touches: [],
      changedTouches: [point(70, 105)],
    });
    expect(within(dialog).getByText("2 / 9")).toBeInTheDocument();
  });

  it("offers a retry after a failed image and clears the error on success", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /View all 9 photos/ }));
    const dialog = screen.getByRole("dialog");
    fireEvent.error(within(dialog).getByRole("img"));
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Unable to load"
    );
    await user.click(within(dialog).getByRole("button", { name: /Retry/ }));
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: "Close photos" })
    );
    expect(within(dialog).queryByRole("alert")).toBeNull();
    fireEvent.load(within(dialog).getByRole("img"));
    expect(within(dialog).queryByText("Loading photo…")).toBeNull();
  });

  it("handles empty and single-photo albums", async () => {
    const { rerender, user } = setup();
    rerender(<ProjectAlbum title="Empty" images={[]} />);
    expect(screen.queryByRole("region")).toBeNull();
    rerender(<ProjectAlbum title="Single" images={images.slice(0, 1)} />);
    expect(screen.queryByText(/\+\d/)).toBeNull();
    await user.click(screen.getByRole("button", { name: /View all 1 photo/ }));
    expect(
      screen.getByRole("button", { name: "Previous photo" })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
  });

  it("unlocks scrolling if an open album is unmounted", async () => {
    const { user, unmount } = setup();
    await user.click(screen.getByRole("button", { name: /View all 9 photos/ }));
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
