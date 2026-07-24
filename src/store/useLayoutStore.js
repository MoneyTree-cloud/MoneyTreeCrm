import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";

const useLayoutStore = create(
  devtools(
    immer((set) => ({
      isSidebarCollapsed: false,
      // Action methods

      changeSidebar: () =>
        set((state) => {
          state.isSidebarCollapsed = !state.isSidebarCollapsed;
        }),
    })),
    { name: "layout" }
  )
);

export default useLayoutStore;
