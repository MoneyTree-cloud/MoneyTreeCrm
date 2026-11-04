import { forwardRef } from "react";
import Select from "react-select";

// Defaults that make react-select look like a `.form-control` input (black 1px border).
const defaultStyles = {
  control: (base) => ({
    ...base,
    borderColor: "#000",
    boxShadow: "none",
    "&:hover": { borderColor: "#000" },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

// Screen-level `styles` run after the defaults, so custom borders (error red, focus colours) still win.
const mergeStyles = (custom = {}) => {
  const merged = { ...defaultStyles };
  Object.keys(custom).forEach((key) => {
    const base = defaultStyles[key];
    merged[key] = (provided, state) => custom[key](base ? base(provided, state) : provided, state);
  });
  return merged;
};

const AppSelect = forwardRef(({ styles, ...props }, ref) => (
  <Select
    ref={ref}
    menuPortalTarget={document.body}
    {...props}
    styles={mergeStyles(styles)}
  />
));

export default AppSelect;
