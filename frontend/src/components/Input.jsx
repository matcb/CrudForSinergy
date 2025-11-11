import React from "react";

const Input = ({
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  className = "",
  disabled = false,
}) => {
  const baseClasses =
    "w-full h-11 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";

  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
    />
  );
};

export default Input;
