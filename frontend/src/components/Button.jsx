const Button = ({ children, onClick, className = "", variant = "primary" }) => {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold transition";
  const variantClasses = {
    primary: "bg-gray-100 text-white hover:bg-teal-700",
    secondary:
      "bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-50",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
