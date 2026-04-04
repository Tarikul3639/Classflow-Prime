"use client";

import { Search, Bell } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-3">
      <div className="flex items-center gap-4 mx-auto">
        {/* Left: Profile & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div
              className="size-11 rounded-xl ring-2 ring-primary/10 bg-cover bg-center shadow-sm transition-transform group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuClNnw6aauNG2u0MAaUdo4ceSc6pryAsYYQBSLldRLmEEyjwRzswwlPm0ykikSqyo50QI8GfPxSAga7wjXvcEzps9DYx8yQtRa7bMole4kgdoR8AT1YkLNfxsoc3HM0X8iQLh1EsR-yDgfqRzzt_l5KwJMJpoHFqbl6NLJdfptBT6SnN9hs3KZfBEAc2jy56wyEFGDUnjAqY3SnflCRblIB9QvN8EDapruEYXcYqAUTqh-8RwQ8DB0y1K7tv48PMq2KZNdivzE1Zfdv")',
              }}
            />
            <span className="absolute -bottom-1 -right-1 size-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
          </div>

          <div className="hidden sm:block w-px h-8 bg-slate-200" />

          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-none tracking-tight text-slate-900 mb-1">
              Dashboard
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">
                v2.0
              </span>
              <p className="text-[12px] font-medium text-primary/80">
                ClassFlow
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center size-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-white hover:shadow-md hover:text-primary transition-all border border-transparent hover:border-slate-100">
            <Search size={19} />
          </button>
          <button className="relative flex items-center justify-center size-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-white hover:shadow-md hover:text-primary transition-all border border-transparent hover:border-slate-100">
            <Bell size={19} />
            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}
