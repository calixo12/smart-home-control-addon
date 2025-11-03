import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected";
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: Wifi,
          text: "Connected",
          color: "#22c55e",
        };
      case "connecting":
        return {
          icon: Loader2,
          text: "Connecting",
          color: "#eab308",
          animate: true,
        };
      case "disconnected":
        return {
          icon: WifiOff,
          text: "Disconnected",
          color: "#ef4444",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold w-full h-full"
      data-testid={`status-${status}`}
      style={{
        color: config.color,
        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
      }}
    >
      <Icon
        className={`w-3.5 h-3.5 ${config.animate ? "animate-spin" : ""}`}
        style={{ filter: `drop-shadow(0 0 4px ${config.color})` }}
      />
      <span>{config.text}</span>
    </div>
  );
}
