import { beforeEach, describe, expect, it, vi } from "vitest";

// Each test gets a fresh module instance via vi.resetModules() + dynamic import
// so the singleton state doesn't bleed between tests.

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({ matches }),
  });
}

describe("useTheme", () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.className = "";
    mockMatchMedia(true); // default: system prefers dark
    vi.resetModules();
  });

  it("initialises with default theme id", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { themeId } = useTheme();
    expect(themeId.value).toBe("default");
  });

  it("initialises dark when system prefers dark and no localStorage value", async () => {
    mockMatchMedia(true);
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark } = useTheme();
    expect(isDark.value).toBe(true);
  });

  it("initialises light when system prefers light and no localStorage value", async () => {
    mockMatchMedia(false);
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark } = useTheme();
    expect(isDark.value).toBe(false);
  });

  it("restores themeId from localStorage", async () => {
    localStorage.setItem("cm-theme", "solar");
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { themeId } = useTheme();
    expect(themeId.value).toBe("solar");
  });

  it("restores dark mode from localStorage regardless of system preference", async () => {
    localStorage.setItem("cm-dark", "false");
    mockMatchMedia(true); // system says dark, localStorage says light
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark } = useTheme();
    expect(isDark.value).toBe(false);
  });

  it("setTheme adds the correct class to documentElement", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { setTheme } = useTheme();
    setTheme("midnight");
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(true);
  });

  it("setTheme removes previous theme class when switching", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { setTheme } = useTheme();
    setTheme("midnight");
    setTheme("solar");
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(false);
    expect(document.documentElement.classList.contains("theme-solar")).toBe(true);
  });

  it("setTheme default removes all theme classes", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { setTheme } = useTheme();
    setTheme("minimal");
    setTheme("default");
    expect(
      [...document.documentElement.classList].some((c) => c.startsWith("theme-")),
    ).toBe(false);
  });

  it("setTheme persists to localStorage", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { setTheme } = useTheme();
    setTheme("solar");
    expect(localStorage.getItem("cm-theme")).toBe("solar");
  });

  it("toggleMode flips isDark", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark, toggleMode } = useTheme();
    const initial = isDark.value;
    toggleMode();
    expect(isDark.value).toBe(!initial);
  });

  it("toggleMode adds .light class when switching to light", async () => {
    localStorage.setItem("cm-dark", "true"); // start dark
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { toggleMode } = useTheme();
    toggleMode(); // dark → light
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("toggleMode removes .light class when switching to dark", async () => {
    localStorage.setItem("cm-dark", "false"); // start light
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { toggleMode } = useTheme();
    toggleMode(); // light → dark
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("toggleMode persists to localStorage", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark, toggleMode } = useTheme();
    toggleMode();
    expect(localStorage.getItem("cm-dark")).toBe(String(isDark.value));
  });

  it("themes list contains all four entries", async () => {
    const { themes } = await import("@/demo/composables/useTheme");
    expect(themes.map((t) => t.id)).toEqual(["default", "midnight", "minimal", "solar"]);
  });
});
