export default function ToothLogo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full border-2 border-blue-500/70 bg-white shadow-sm`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3/5 w-3/5 text-blue-600"
        aria-hidden="true"
      >
        <path d="M12 5.2c-1.5-1.3-3.4-1.9-5-1.2-2.4 1-3.6 3.5-3 6 .4 1.6 1 2.6 1.4 4 .5 1.7.6 3.6.8 5.6.1 1.3.5 3 1.6 3 1.4 0 1.3-2.7 1.8-4.4.3-1 .6-1.8 1.4-1.8s1.1.8 1.4 1.8c.5 1.7.4 4.4 1.8 4.4 1.1 0 1.5-1.7 1.6-3 .2-2 .3-3.9.8-5.6.4-1.4 1-2.4 1.4-4 .6-2.5-.6-5-3-6-1.6-.7-3.5-.1-5 1.2Z" />
      </svg>
    </span>
  );
}
