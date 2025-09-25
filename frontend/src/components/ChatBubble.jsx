const ChatBubble = ({ message, isUser = false }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isUser ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        {message}
      </div>
    </div>
  );
};

export default ChatBubble;
