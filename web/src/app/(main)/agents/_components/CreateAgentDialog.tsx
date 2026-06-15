"use client";

import React, { useMemo, useState } from "react";
import { Bot, Loader2, Plus, Copy } from "lucide-react";
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
import type { IAgentScopes } from "@/store/features/agent/agent.types";
import { createAgentThunk } from "@/store/features/agent/thunks/create-agent.thunk";

type ClassItem = {
  _id: string;
  name: string;
  allowed: boolean;
};

export default function CreateAgentDialog() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.agent.create.status);
  const agents = useAppSelector((state) => state.agent.agents);

  const uniqueClasses = useMemo<ClassItem[]>(() => {
    const classMap = new Map<string, ClassItem>();
    agents.forEach((agent) => {
      (agent.classList ?? []).forEach((cls) => {
        if (!classMap.has(cls._id)) {
          classMap.set(cls._id, cls);
        }
      });
    });
    return Array.from(classMap.values());
  }, [agents]);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [scopes, setScopes] = useState<IAgentScopes>({
    create: false,
    update: false,
    delete: false,
  });
  const [allowedClassIds, setAllowedClassIds] = useState<string[]>([]);

  const resetForm = () => {
    setName("");
    setExpiresAt("");
    setScopes({ create: false, update: false, delete: false });
    setAllowedClassIds([]);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    const promise = dispatch(
      createAgentThunk({
        name,
        scopes,
        allowedClassIds,
        expiresAt: expiresAt || undefined,
      })
    ).unwrap();

    toast.promise(promise, {
      loading: "Creating agent...",
      success: (res) => {
        setOpen(false);
        resetForm();
        return `${res.data.agent.name} created successfully`;
      },
      error: (err) => err,
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

      <DialogContent className="w-[95vw] sm:max-w-105 max-h-[90vh] flex flex-col rounded-2xl p-0 overflow-hidden border border-slate-200">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bot className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900">
                Create Agent
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Configure new AI agent access
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-4 py-4 space-y-4 flex-1 overflow-y-auto">
          {/* Agent Name */}
          <div>
            <label className="text-sm font-medium text-slate-700">Agent Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hermes"
              className="mt-1.5 h-9 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          {/* Permissions */}
          <div>
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
                      setScopes((prev) => ({
                        ...prev,
                        [scope]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-primary cursor-pointer"
                  />
                  <span className="capitalize text-slate-700">{scope}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Allowed Classes */}
          <div>
            <label className="text-sm font-medium text-slate-700">Allowed Classes</label>
            <div className="max-h-44 mt-2 rounded-sm border border-slate-200 overflow-scroll">
              {uniqueClasses.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-xs text-slate-600">
                        Class Name
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-xs text-slate-600">
                        Access
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {uniqueClasses.map((cls) => (
                      <tr key={cls._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-sm text-slate-700 truncate">
                          {cls.name}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="checkbox"
                            checked={allowedClassIds.includes(cls._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAllowedClassIds((prev) => [...prev, cls._id]);
                              } else {
                                setAllowedClassIds((prev) =>
                                  prev.filter((id) => id !== cls._id)
                                );
                              }
                            }}
                            className="h-4 w-4 accent-primary cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-center px-4">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                    <Copy className="size-4 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600">No classes available yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create or join classes first</p>
                </div>
              )}
            </div>
          </div>

          {/* Expire At */}
          <div>
            <label className="text-sm font-medium text-slate-700">Expire At</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>
        </div>

        <DialogFooter className="px-4 py-3 border-t border-slate-200 flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            className="border-slate-200 hover:bg-slate-50 cursor-pointer rounded-sm"
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading} className="cursor-pointer rounded-sm">
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating
              </>
            ) : (
              "Create Agent"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}