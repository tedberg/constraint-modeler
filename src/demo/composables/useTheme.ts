import { readonly, ref } from "vue";

export interface Theme {
  id: string;
  name: string;
}

export const themes: Theme[] = [
  { id: "default", name: "Default" },
  { id: "midnight", name: "Midnight Bloom" },
  { id: "minimal", name: "Modern Minimal" },
  { id: "solar", name: "Solar Dusk" },
];

// Singleton refs — shared across all useTheme() calls.
const themeId = ref("default");
const isDark = ref(true);
let _initialized = false;

const VALID_THEME_IDS = new Set(themes.map((t) => t.id));

function validatedThemeId(raw: string | null): string {
  return raw && VALID_THEME_IDS.has(raw) ? raw : "default";
}

function applyToDOM() {
  const el = document.documentElement;
  // Remove any existing theme class
  [...el.classList]
    .filter((c) => c.startsWith("theme-"))
    .forEach((c) => el.classList.remove(c));
  // Add the new theme class (default uses bare :root — no class needed)
  if (themeId.value !== "default") {
    el.classList.add(`theme-${themeId.value}`);
  }
  // Toggle .light for mode
  if (isDark.value) {
    el.classList.remove("light");
  } else {
    el.classList.add("light");
  }
}

export function useTheme() {
  if (!_initialized) {
    _initialized = true;
    themeId.value = validatedThemeId(localStorage.getItem("cm-theme"));
    const saved = localStorage.getItem("cm-dark");
    isDark.value = saved !== null ? saved === "true" : false;
    applyToDOM();
  }

  function setTheme(id: string) {
    if (!VALID_THEME_IDS.has(id)) return;
    themeId.value = id;
    localStorage.setItem("cm-theme", id);
    applyToDOM();
  }

  function toggleMode() {
    isDark.value = !isDark.value;
    localStorage.setItem("cm-dark", String(isDark.value));
    applyToDOM();
  }

  return {
    themes,
    themeId: readonly(themeId),
    isDark: readonly(isDark),
    setTheme,
    toggleMode,
  };
}
