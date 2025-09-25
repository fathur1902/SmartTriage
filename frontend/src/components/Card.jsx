const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition ${className}`}>
      {children}
    </div>
  );
};

export default Card;