import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
}) => {
  const baseClasses =
    "w-full h-11 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {children}
    </button>
  );
};

export default Button

