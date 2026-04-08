import { APP_CONFIG } from "@/config/app-config";

export default function VersionInfo() {
  return (
    <div className="mt-4 flex flex-col items-center gap-1 pt-4">
      <p className="text-xs text-muted-foreground">
        Version:{" "}
        <a
          href={APP_CONFIG.releaseLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-bold text-primary hover:underline"
        >
          V{APP_CONFIG.version}
        </a>
      </p>
      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
        ClassFlow Prime &copy; 2026
      </p>
    </div>
  );
}