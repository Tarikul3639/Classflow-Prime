import { ExternalLink } from "lucide-react";
import { ClassGroup } from "@/types/group.types";
import { GROUP_PLATFORM_CONFIG } from "@/types/group.types";

export const GroupCard = ({ group }: { group: ClassGroup }) => {
  const config = GROUP_PLATFORM_CONFIG[group.platform];
  const Icon = config.icon;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-11 md:w-12 h-11 md:h-12 rounded-xl ${config.uiConfig.platformBg} flex items-center justify-center shrink-0`}
          >
            <Icon
              className={`${config.uiConfig.platformColor} size-5 md:size-6`}
            />
          </div>

          <div>
            <h4 className="text-[14px] md:text-[15px] lg:text-[16px] font-bold text-slate-900">
              {group.name}
            </h4>

            <p
              className={`text-[10px] md:text-[11px] lg:text-[12px] font-medium ${config.uiConfig.platformColor} ${config.uiConfig.platformBg} px-2 py-0.5 rounded-md inline-block mt-1 uppercase tracking-tight`}
            >
              {group.platform}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] md:text-[13px] lg:text-[14px] text-slate-600 leading-relaxed">
        {group.description || "No description provided."}
      </p>

      {/* Enroll Button */}
      <button
        onClick={() => group.link && window.open(group.link, "_blank")}
        className="w-full bg-primary hover:bg-primary/90 text-white text-[12px] md:text-[13px] lg:text-[14px] font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
      >
        Enroll Group
        <ExternalLink size={18} />
      </button>
    </div>
  );
};