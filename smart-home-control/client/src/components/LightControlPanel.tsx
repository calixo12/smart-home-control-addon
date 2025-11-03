import { useState, useRef, useEffect } from "react";
import { Lightbulb, LightbulbOff, Plus, Minus, MoveUp, Zap, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playButtonClick, playHighPitchClick } from "@/lib/sounds";

interface Light {
  id: string;
  name: string;
  brightness: number;
  state: "on" | "off";
}

interface LightControlPanelProps {
  light: Light;
  onBrightnessChange: (brightness: number) => void;
  onToggle: (state: "on" | "off") => void;
  onAppleToggle?: () => void;
  onLampToggle?: () => void;
  appleState?: boolean;
  lampState?: boolean;
  isDimmable?: boolean;
  isShades?: boolean;
}

export default function LightControlPanel({
  light,
  onBrightnessChange,
  onToggle,
  onAppleToggle,
  onLampToggle,
  appleState = false,
  lampState = false,
  isDimmable = true,
  isShades = false,
}: LightControlPanelProps) {
  const [brightness, setBrightness] = useState(light.brightness);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setBrightness(light.brightness);
  }, [light.id, light.brightness]);

  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0]);
    onBrightnessChange(value[0]);
  };

  const isOn = light.state === "on";

  const sliderRef = useRef<HTMLDivElement>(null);

  const debouncedBrightnessChange = (value: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onBrightnessChange(value);
    }, 300);
  };

  const handleSliderDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDimmable) return;
    
    const slider = sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const y = e.clientY - rect.top;
    let percentage = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    
    // Reverse the percentage for shades (top = 0%, bottom = 100%)
    if (isShades) {
      percentage = 100 - percentage;
    }
    
    const roundedPercentage = Math.round(percentage);
    setBrightness(roundedPercentage);
    debouncedBrightnessChange(roundedPercentage);
    
    if (light.state === "off" && roundedPercentage > 0) {
      onToggle("on");
    } else if (roundedPercentage === 0) {
      onToggle("off");
    }
  };

  const handleSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDimmable) return;
    
    handleSliderDrag(e);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDimmable) return;
      
      const slider = sliderRef.current;
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const y = moveEvent.clientY - rect.top;
      let percentage = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
      
      // Reverse the percentage for shades (top = 0%, bottom = 100%)
      if (isShades) {
        percentage = 100 - percentage;
      }
      
      const roundedPercentage = Math.round(percentage);
      setBrightness(roundedPercentage);
      debouncedBrightnessChange(roundedPercentage);
      
      if (light.state === "off" && roundedPercentage > 0) {
        onToggle("on");
      } else if (roundedPercentage === 0) {
        onToggle("off");
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <div className="flex flex-col flex-1">
        <div className="text-base text-white drop-shadow-lg uppercase tracking-wide mb-8 text-center font-bold" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
          {isShades ? "Level" : "Brightness"}
        </div>

        <div 
          ref={sliderRef}
          className={`relative h-[600px] w-full backdrop-blur-sm rounded-md overflow-hidden select-none ${
            isDimmable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
          }`}
          onMouseDown={handleSliderMouseDown}
          data-testid="slider-brightness"
          style={{
            background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
            border: "1px solid rgba(0,0,0,0.8)",
          }}
        >
            <div className="absolute inset-0 flex flex-col">
              {isShades ? (
                <>
                  <div 
                    className="bg-white/30 transition-all duration-75 relative"
                    style={{ height: `${brightness}%` }}
                  >
                    <div className="absolute -bottom-3 left-0 right-0 h-6 bg-white border-2 border-white/30" />
                  </div>
                  <div 
                    className="bg-black/30 transition-all duration-75"
                    style={{ height: `${100 - brightness}%` }}
                  />
                </>
              ) : (
                <>
                  <div 
                    className="bg-black/30 transition-all duration-75"
                    style={{ height: `${100 - brightness}%` }}
                  />
                  <div 
                    className="bg-white/30 transition-all duration-75 relative"
                    style={{ height: `${brightness}%` }}
                  >
                    <div className="absolute -top-3 left-0 right-0 h-6 bg-white border-2 border-white/30" />
                  </div>
                </>
              )}
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-6xl font-bold text-white/90 drop-shadow-lg">
                {brightness}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-14">
          <button
            onClick={() => {
              playHighPitchClick();
              if (isDimmable) {
                setBrightness(100);
                onBrightnessChange(100);
              }
              onToggle("on");
            }}
            className="w-24 h-[135px] rounded-xl transition-all relative overflow-hidden"
            style={{
              background: (brightness === 100 && isDimmable) || (!isDimmable && isOn)
                ? "linear-gradient(145deg, #4a4a4a, #3a3a3a)"
                : "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
              boxShadow: (brightness === 100 && isDimmable) || (!isDimmable && isOn)
                ? "inset 0 -3px 10px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.2), 0 6px 16px rgba(0,0,0,0.6)"
                : "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
              border: "1px solid rgba(0,0,0,0.8)",
            }}
            data-testid="button-light-on"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="absolute w-[60%] h-[60%] rounded-full"
                style={{
                  background: (brightness === 100 && isDimmable) || (!isDimmable && isOn)
                    ? "radial-gradient(circle, #5a5a5a, #4a4a4a)"
                    : "radial-gradient(circle, #2a2a2a, #1a1a1a)",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                }}
              >
                <div 
                  className="absolute inset-[18%] rounded-full flex items-center justify-center"
                  style={{
                    background: (brightness === 100 && isDimmable) || (!isDimmable && isOn)
                      ? "linear-gradient(145deg, #4a4a4a, #3a3a3a)"
                      : "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
                    boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  {isShades ? (
                    <ArrowUp className="w-10 h-10 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                  ) : (
                    <Lightbulb className="w-10 h-10 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                  )}
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              playHighPitchClick();
              if (!isDimmable) return;
              const newValue = Math.min(100, brightness + 10);
              setBrightness(newValue);
              onBrightnessChange(newValue);
              if (light.state === "off" && newValue > 0) {
                onToggle("on");
              }
            }}
            className={`w-24 h-[135px] rounded-xl transition-all relative overflow-hidden ${!isDimmable ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{
              background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
              boxShadow: "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
              border: "1px solid rgba(0,0,0,0.8)",
            }}
            data-testid="button-increase-brightness"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="absolute w-[60%] h-[60%] rounded-full"
                style={{
                  background: "radial-gradient(circle, #4a4a4a, #3a3a3a)",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                }}
              >
                <div 
                  className="absolute inset-[18%] rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                    boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  <Plus className="w-8 h-8 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              playButtonClick();
              if (!isDimmable) return;
              const newValue = Math.max(0, brightness - 10);
              setBrightness(newValue);
              onBrightnessChange(newValue);
              if (newValue === 0) {
                onToggle("off");
              }
            }}
            className={`w-24 h-[135px] rounded-xl transition-all relative overflow-hidden ${!isDimmable ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{
              background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
              boxShadow: "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
              border: "1px solid rgba(0,0,0,0.8)",
            }}
            data-testid="button-decrease-brightness"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="absolute w-[60%] h-[60%] rounded-full"
                style={{
                  background: "radial-gradient(circle, #4a4a4a, #3a3a3a)",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                }}
              >
                <div 
                  className="absolute inset-[18%] rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                    boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  <Minus className="w-8 h-8 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              playButtonClick();
              if (isDimmable) {
                setBrightness(0);
                onBrightnessChange(0);
              }
              onToggle("off");
            }}
            className="w-24 h-[135px] rounded-xl transition-all relative overflow-hidden"
            style={{
              background: (brightness === 0 && isDimmable) || (!isDimmable && !isOn)
                ? "linear-gradient(145deg, #4a4a4a, #3a3a3a)"
                : "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
              boxShadow: (brightness === 0 && isDimmable) || (!isDimmable && !isOn)
                ? "inset 0 -3px 10px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.2), 0 6px 16px rgba(0,0,0,0.6)"
                : "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
              border: "1px solid rgba(0,0,0,0.8)",
            }}
            data-testid="button-light-off"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="absolute w-[60%] h-[60%] rounded-full"
                style={{
                  background: (brightness === 0 && isDimmable) || (!isDimmable && !isOn)
                    ? "radial-gradient(circle, #5a5a5a, #4a4a4a)"
                    : "radial-gradient(circle, #4a4a4a, #3a3a3a)",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                }}
              >
                <div 
                  className="absolute inset-[18%] rounded-full flex items-center justify-center"
                  style={{
                    background: (brightness === 0 && isDimmable) || (!isDimmable && !isOn)
                      ? "linear-gradient(145deg, #4a4a4a, #3a3a3a)"
                      : "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                    boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  {isShades ? (
                    <ArrowDown className="w-10 h-10 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                  ) : (
                    <LightbulbOff className="w-10 h-10 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                  )}
                </div>
              </div>
            </div>
          </button>
      </div>

      <div className="flex flex-col gap-5 pt-14">
        {/* Empty space for future features */}
        <div className="w-24 h-[290px]"></div>
        <div className="w-24 h-[290px]"></div>
      </div>
    </>
  );
}
