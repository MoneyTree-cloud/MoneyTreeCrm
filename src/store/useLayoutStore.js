import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import { applyTheme, loadSavedTheme, saveTheme, THEMES, DEFAULT_THEME_ID } from "../helpers/defaultTheme";

const useLayoutStore = create(
  devtools(
    immer((set) => ({
      isSidebarCollapsed: false,
      // colour theme picked in the header Theme switcher: { id, primary }
      theme: loadSavedTheme(),
      // Action methods

      changeSidebar: () =>
        set((state) => {
          state.isSidebarCollapsed = !state.isSidebarCollapsed;
        }),

      setTheme: (theme) => {
        applyTheme(theme);
        saveTheme(theme);
        set((state) => {
          state.theme = theme;
        });
      },

      // live preview while hovering a swatch — not saved
      previewTheme: (theme) => applyTheme(theme),

      resetTheme: () => {
        const theme = { id: DEFAULT_THEME_ID, primary: THEMES[0].primary };
        applyTheme(theme);
        saveTheme(theme);
        set((state) => {
          state.theme = theme;
        });
      },
    })),
    { name: "layout" }
  )
);

export default useLayoutStore;
