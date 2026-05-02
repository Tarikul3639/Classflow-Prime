'use client';

import { useState } from 'react';

interface BravePushGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS = [
    {
        number: 1,
        instruction: 'Type this in the address bar',
        code: 'brave://settings/privacy',
        copyable: true,
    },
    {
        number: 2,
        instruction: 'Scroll down the page',
        code: null,
        copyable: false,
    },
    {
        number: 3,
        instruction: 'Turn ON "Use Google services for push messaging"',
        code: null,
        copyable: false,
    },
    {
        number: 4,
        instruction: 'Completely close the Brave browser and reopen it',
        code: null,
        copyable: false,
    },
    {
        number: 5,
        instruction: 'Come back and enable Notifications again',
        code: null,
        copyable: false,
    },
];

export default function BravePushGuideModal({
    isOpen,
    onClose,
}: BravePushGuideModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenSettings = () => {
        navigator.clipboard.writeText('brave://settings/privacy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900">

                {/* Header */}
                <div className="mb-5 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🦁</span>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                Brave Browser Setup
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                A quick setup is needed to enable notifications
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-xl leading-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                        ✕
                    </button>
                </div>

                {/* Steps */}
                <ol className="mb-6 space-y-3">
                    {STEPS.map((step) => (
                        <li
                            key={step.number}
                            className="flex items-start gap-3"
                        >
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                                {step.number}
                            </span>

                            <div className="flex-1">
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {step.instruction}
                                </p>

                                {step.copyable && step.code && (
                                    <div
                                        onClick={() => handleCopy(step.code)}
                                        className="mt-1 flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                    >
                                        <code className="font-mono text-xs text-orange-600 dark:text-orange-400">
                                            {step.code}
                                        </code>

                                        <span className="text-xs text-zinc-400">
                                            {copied ? '✓ Copied' : 'Copy'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleOpenSettings}
                        className="flex-1 rounded-sm bg-orange-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 cursor-pointer"
                    >
                        {copied ? '✓ Copied!' : 'Copy Address'}
                    </button>

                    <button
                        onClick={onClose}
                        className="flex-1 rounded-sm bg-zinc-100 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}