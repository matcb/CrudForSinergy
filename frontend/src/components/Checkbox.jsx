// src/components/Checkbox.jsx
import { forwardRef } from "react";

const Checkbox = forwardRef(
  ({ id, checked, onCheckedChange, onChange, ...rest }, ref) => {
    const handleChange = (e) => {
      const newChecked = e.target.checked;

      // Radix / Headless UI style
      if (onCheckedChange) onCheckedChange(newChecked);

      // Classic HTML onChange (your old code expects this)
      if (onChange) onChange(e);
    };

    return (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        {...rest}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;