"use client";

export default function SuccessIcon() {
  return (
    <div className="relative flex items-center justify-center w-52 h-52">

      {/* Glow */}
      <div className="absolute w-full h-full rounded-full bg-[#536588]/30 blur-2xl animate-pulse" />

      {/* Ring */}
      <div className="absolute w-33 h-33 rounded-full border-10 border-[#536588]" />

      {/* Circle */}
      <div className="relative z-10 flex items-center justify-center w-25 h-25 rounded-full bg-[#1b325f] shadow-xl">

        {/* Check */}
        <svg
          className="w-16 h-16 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Particles */}
      <span className="particle particle-1" />
      <span className="particle particle-2" />
      <span className="particle particle-3" />
      <span className="particle particle-4" />

    </div>
  );
}
