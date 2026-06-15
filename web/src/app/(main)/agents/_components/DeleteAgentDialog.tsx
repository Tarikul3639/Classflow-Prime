"use client";

import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteAgentThunk } from "@/store/features/agent/thunks/delete-agent.thunk";

interface Props {
    agentId: string;
}

export default function DeleteAgentDialog({ agentId }: Props) {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.agent.delete.status);

    const handleDelete = () => {
        const promise = dispatch(deleteAgentThunk(agentId)).unwrap();

        toast.promise(promise, {
            loading: "Revoking agent...",
            success: (res) => res.message,
            error: (err) => err,
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-sm cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 rounded-sm"
                >
                    <Trash2 className="size-3.5" />
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-lg border-slate-200">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to revoke this agent? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer rounded-sm border-gray-200 bg-gray-50 hover:bg-gray-100">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white cursor-pointer rounded-sm"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Deleting
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}