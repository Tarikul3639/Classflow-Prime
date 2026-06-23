"use client";

import React, { useState } from "react";
import { Loader, Download, SquareArrowOutUpRight } from "lucide-react";
import type { Material } from "@/types/update.types";
import { MATERIAL_TYPE_CONFIG } from "@/types/update.types";
import { formatFileSize } from "@/utils/formatFileSize";

interface UpdateMaterialProps {
  material: Material;
}

export default function UpdateMaterial({ material }: UpdateMaterialProps) {
  const config =
    MATERIAL_TYPE_CONFIG[material.type] ?? MATERIAL_TYPE_CONFIG["link"];
  const Icon = config.icon;
  const isLink = material.type === "link";

  // console.log(material.url);

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!material.url || isLink) return;

    try {
      setDownloading(true);
      const response = await fetch(material.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = material.name || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
      {/* Icon */}
      <div
        className={`w-8 h-8 flex items-center justify-center ${config.bgColor} ${config.color} rounded`}
      >
        <Icon className="size-5 md:size-6" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <a
          className="text-xs font-semibold text-slate-900 truncate hover:underline cursor-pointer"
          href={isLink ? material.url : undefined}
          target={isLink ? "_blank" : undefined}
          rel={isLink ? "noopener noreferrer" : undefined}
        >
          {material.name || "Untitled"}
        </a>
        {!isLink && (
          <p className="text-[10px] text-slate-500">
            {material.size ? formatFileSize(material.size) : "—"}
          </p>
        )}
      </div>

      {/* Action button */}
      {isLink ? (
        <a
          href={isLink ? material.url : undefined}
          target={isLink ? "_blank" : undefined}
          rel={isLink ? "noopener noreferrer" : undefined}
          className="text-primary hover:text-primary/80"
        >
          <SquareArrowOutUpRight size={20} />
        </a>
      ) : (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="text-primary hover:text-primary/80 cursor-pointer disabled:cursor-not-allowed disabled:text-primary/50"
        >
          {downloading ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <Download size={20} />
          )}
        </button>
      )}
    </div>
  );
}
