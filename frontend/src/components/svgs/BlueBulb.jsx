import React from "react";

const BlueBulb = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <circle cx="12" cy="10" r="6" fill="#3b82f6" />
    <rect x="10" y="16" width="4" height="4" rx="2" fill="#60a5fa" />
    <rect x="11" y="20" width="2" height="2" rx="1" fill="#60a5fa" />
    <path d="M12 4v2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default BlueBulb;
