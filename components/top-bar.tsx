import { Search, Bell } from "lucide-react";

export default function TopBar({
  placeholder = "Search...",
  searchWidth = "w-[400px]",
  children,
}: {
  placeholder?: string;
  searchWidth?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div
        className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 sm:flex-none ${searchWidth}`}
      >
        <Search className="size-4 shrink-0 text-slate-500" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-4">
        {children}
        <button
          type="button"
          aria-label="Notifications"
          className="flex items-center justify-center rounded-[10px] border border-slate-200 bg-white p-2.5 text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Bell className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}
