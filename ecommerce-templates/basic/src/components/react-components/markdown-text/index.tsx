import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownTextProps {
  text: string;
  className?: string;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ text, className }) => {
  return (
    <div className={`text-lg max-w-xl ${className || ""}`}>
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
};

export default MarkdownText;
