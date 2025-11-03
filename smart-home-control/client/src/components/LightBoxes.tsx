import { Lightbulb, Blinds } from "lucide-react";
import { playButtonClick } from "@/lib/sounds";

interface Light {
  id: string;
  name: string;
  brightness: number;
  state: "on" | "off";
}

interface LightBoxesProps {
  lights: Light[];
  selectedLight: Light;
  onSelectLight: (light: Light) => void;
  isShades?: boolean;
}

export default function LightBoxes({
  lights,
  selectedLight,
  onSelectLight,
  isShades = false,
}: LightBoxesProps) {
  const displayLights = lights.slice(0, 6);
  
  // Determine grid layout based on number of items
  const numItems = displayLights.length;
  let gridCols = "grid-cols-2";
  let gridRows = "grid-rows-3";
  
  if (numItems <= 2) {
    gridCols = "grid-cols-1";
    gridRows = "grid-rows-2";
  } else if (numItems <= 4) {
    gridCols = "grid-cols-2";
    gridRows = "grid-rows-2";
  }

  return (
    <div className="flex flex-col w-full max-w-xl">
      <div className="text-base text-white drop-shadow-lg uppercase tracking-wide mb-8 text-center font-bold" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        {isShades ? "Shades" : "Lighting"}
      </div>
      <div className={`grid ${gridCols} ${gridRows} gap-6`} style={{ height: '600px' }}>
          {displayLights.map((light) => (
            <button
              key={light.id}
              onClick={() => {
                playButtonClick();
                onSelectLight(light);
              }}
              className="relative rounded-md transition-all flex flex-col items-center justify-center overflow-hidden"
              style={{
                background: light.id === selectedLight.id
                  ? "linear-gradient(145deg, #4a4a4a, #3a3a3a)"
                  : "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                boxShadow: light.id === selectedLight.id
                  ? "inset 0 6px 14px rgba(0,0,0,0.7), inset 0 -3px 6px rgba(255,255,255,0.05)"
                  : "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                border: "1px solid rgba(0,0,0,0.8)",
              }}
              data-testid={`button-select-light-${light.id}`}
            >
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
                <div 
                  className="w-24 h-24 rounded-full mb-4 flex items-center justify-center"
                  style={{
                    background: light.id === selectedLight.id
                      ? "radial-gradient(circle, #5a5a5a, #4a4a4a)"
                      : "radial-gradient(circle, #2a2a2a, #1a1a1a)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  <div 
                    className="w-[70%] h-[70%] rounded-full flex items-center justify-center"
                    style={{
                      background: light.id === selectedLight.id
                        ? "linear-gradient(145deg, #4a4a4a, #3a3a3a)"
                        : "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
                      boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                    }}
                  >
                    {isShades ? (
                      <Blinds className="w-10 h-10 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                    ) : (
                      <Lightbulb className={`w-10 h-10 ${light.state === "on" ? "text-white" : "text-gray-400"}`} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                    )}
                  </div>
                </div>
                <div className="text-white text-xl font-bold text-center" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                  {light.name}
                </div>
                <div className="text-gray-300 text-base mt-1" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                  {light.state === "on" ? `${light.brightness}%` : "Off"}
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
