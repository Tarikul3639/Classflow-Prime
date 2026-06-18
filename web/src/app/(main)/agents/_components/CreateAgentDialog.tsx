"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bot, Check, Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import type {
  IAgentScopes,
  ICreateAgentResponse,
} from "@/store/features/agent/agent.types";

import { createAgentThunk } from "@/store/features/agent/thunks/create-agent.thunk";
import { searchClassesThunk } from "@/store/features/agent/thunks/search-classes.thunk";
import { clearSearchClassesResult } from "@/store/features/agent/agent.slice";

export default function CreateAgentDialog() {
  const dispatch = useAppDispatch();

  const classes = useAppSelector((state) => state.agent.search.classes);
  const searchLoading = useAppSelector((state) => state.agent.search.status.loading);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [scopes, setScopes] = useState<IAgentScopes>({
    create: true,
    update: false,
    delete: false,
  });

  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");

  const selectedClass = useMemo(
    () => classes.find((item) => item._id === classId) ?? null,
    [classes, classId]
  );

  const resetForm = () => {
    setName("");
    setExpiresAt("");
    setScopes({ create: false, update: false, delete: false });
    setSearch("");
    setClassId("");
    dispatch(clearSearchClassesResult());
  };

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      dispatch(searchClassesThunk(search.trim()));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [open, search, dispatch]);

  const handleCreate = () => {
    if (!name.trim()) return toast.error("Agent name is required");
    if (!classId) return toast.error("Please select a class");

    const promise = dispatch(
      createAgentThunk({ name, classId, scopes, expiresAt: expiresAt || undefined })
    ).unwrap();

    toast.promise(promise, {
      loading: "Creating agent...",
      success: (res: ICreateAgentResponse) => {
        setOpen(false);
        resetForm();
        return `${res.data.agent.name} created successfully`;
      },
      error: (err) =>
        typeof err === "string" ? err : err?.message ?? "Failed to create agent",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-9 rounded-sm cursor-pointer">
          <Plus className="size-4" />
          New Agent
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:max-w-155 max-h-[90vh] flex flex-col rounded-2xl px-1 py-2 overflow-hidden border border-slate-200">
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bot className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900 text-left">
                Create Agent
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Configure new AI agent access
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body — two column grid */}
        <div className="px-4 py-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">

            {/* Agent Name */}
            <div className="col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-slate-700">Agent Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hermes"
                className="mt-1.5 h-9 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* Expire At */}
            <div className="col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-slate-700">Expire At</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1.5 h-9 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* Permissions */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700">Permissions</label>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
                {(["create", "update", "delete"] as const).map((scope) => (
                  <label
                    key={scope}
                    className="flex items-center gap-2 text-sm cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={scopes[scope]}
                      onChange={(e) =>
                        setScopes((prev) => ({ ...prev, [scope]: e.target.checked }))
                      }
                      className="h-4 w-4 accent-primary cursor-pointer"
                    />
                    <span className="capitalize text-slate-700">{scope}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Class — full width */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700">Class</label>

              <div className="mt-1.5 relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search class..."
                  className="h-9 w-full rounded-sm border border-slate-200 pl-9 pr-9 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {selectedClass && (
                <div className="mt-2 rounded-sm border border-primary/20 bg-primary/5 px-3 py-2 text-sm flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-primary truncate">
                      {selectedClass.className}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{selectedClass._id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClassId("")}
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="mt-2 border border-slate-200 rounded-sm overflow-hidden">
                <ScrollArea className="h-44">
                  {searchLoading ? (
                    <div className="h-44 flex items-center justify-center text-sm text-slate-500">
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Searching classes...
                    </div>
                  ) : classes.length > 0 ? (
                    <div className="divide-y divide-x divide-slate-200">
                      {classes.map((cls) => {
                        const active = classId === cls._id;
                        return (
                          <button
                            key={cls._id}
                            type="button"
                            onClick={() => setClassId(cls._id)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                              active ? "bg-primary/10 text-primary" : "hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-sm truncate pr-3">{cls.className}</span>
                            <span
                              className={`shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full border ${
                                active
                                  ? "border-primary bg-primary text-white"
                                  : "border-slate-300 text-transparent"
                              }`}
                            >
                              <Check className="size-3.5" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-center px-4">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <Search className="size-4 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600">No classes found</p>
                      <p className="text-xs text-slate-400 mt-1">Search by class name</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 py-3 border-t border-slate-200 flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => { setOpen(false); resetForm(); }}
            className="border-slate-200 hover:bg-slate-50 cursor-pointer rounded-sm"
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} className="cursor-pointer rounded-sm">
            Create Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}