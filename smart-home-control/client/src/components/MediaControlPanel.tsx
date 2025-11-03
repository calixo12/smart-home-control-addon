import { useState, useRef } from "react";
import { Plus, Minus, Volume2, VolumeX, Tv, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playButtonClick, playHighPitchClick } from "@/lib/sounds";

interface MediaInput {
  id: string;
  name: string;
  entityId: string;
  entityType: 'automation' | 'switch';
}

interface MediaControlPanelProps {
  input: MediaInput;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onTvToggle?: () => void;
  onPowerToggle?: () => void;
  tvState?: boolean;
  powerState?: boolean;
}

export default function MediaControlPanel({
  input,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  onTvToggle,
  onPowerToggle,
  tvState = false,
  powerState = false,
}: MediaControlPanelProps) {
  const [localVolume, setLocalVolume] = useState(volume);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const debouncedVolumeChange = (value: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onVolumeChange(value);
    }, 300);
  };

  const handleSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const handleDrag = (moveEvent: MouseEvent) => {
      const slider = sliderRef.current;
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const y = moveEvent.clientY - rect.top;
      const percentage = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
      const roundedPercentage = Math.round(percentage);
      setLocalVolume(roundedPercentage);
      debouncedVolumeChange(roundedPercentage);
    };

    handleDrag(e.nativeEvent);

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleVolumeUp = () => {
    playHighPitchClick();
    const newVolume = Math.min(100, localVolume + 5);
    setLocalVolume(newVolume);
    onVolumeChange(newVolume);
  };

  const handleVolumeDown = () => {
    playButtonClick();
    const newVolume = Math.max(0, localVolume - 5);
    setLocalVolume(newVolume);
    onVolumeChange(newVolume);
  };

  return (
    <>
      <div className="flex flex-col flex-1">
        <div className="text-base text-white drop-shadow-lg uppercase tracking-wide mb-8 text-center font-bold">
          Volume
        </div>

        <div 
          ref={sliderRef}
          className="relative h-[600px] w-full rounded-md overflow-hidden select-none cursor-pointer"
          onMouseDown={handleSliderMouseDown}
          data-testid="volume-slider"
          style={{
            background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)",
            border: "1px solid rgba(0,0,0,0.9)",
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-150"
            style={{ 
              height: `${localVolume}%`,
              background: "linear-gradient(to top, #4a4a4a, #3a3a3a)",
              boxShadow: "inset 0 2px 8px rgba(255,255,255,0.1)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl font-bold text-white drop-shadow-lg select-none">
              {localVolume}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 ml-6 h-[600px] mt-[calc(1rem+2rem)]">
        <button
          className="flex-1 w-24 rounded-xl transition-all relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
          onClick={handleVolumeUp}
          data-testid="button-volume-up"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div 
              className="absolute w-[55%] h-[55%] rounded-full"
              style={{
                background: "radial-gradient(circle, #2a2a2a, #1a1a1a)",
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              <div 
                className="absolute inset-[18%] rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9)",
                }}
              >
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </button>
        <button
          className="flex-1 w-24 rounded-xl transition-all relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
          onClick={handleVolumeDown}
          data-testid="button-volume-down"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div 
              className="absolute w-[55%] h-[55%] rounded-full"
              style={{
                background: "radial-gradient(circle, #2a2a2a, #1a1a1a)",
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              <div 
                className="absolute inset-[18%] rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9)",
                }}
              >
                <Minus className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </button>
        <button
          className="flex-1 w-24 rounded-xl transition-all relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
          onClick={() => {
            playButtonClick();
            onMuteToggle();
          }}
          data-testid="button-mute"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div 
              className="absolute w-[55%] h-[55%] rounded-full"
              style={{
                background: "radial-gradient(circle, #2a2a2a, #1a1a1a)",
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              <div 
                className="absolute inset-[18%] rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9)",
                }}
              >
                <VolumeX className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-4 h-[600px] mt-[calc(1rem+2rem)]">
        {onTvToggle && (
          <button
            className="flex-1 w-20 rounded-xl transition-all relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
              boxShadow: tvState
                ? "inset 0 4px 10px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.6)"
                : "0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            onClick={() => {
              playButtonClick();
              onTvToggle?.();
            }}
            data-testid="button-tv-toggle"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="absolute w-[70%] h-[70%] rounded-full"
                style={{
                  background: "radial-gradient(circle, #2a2a2a, #1a1a1a)",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                <div 
                  className="absolute inset-[15%] rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9)",
                  }}
                >
                  <Tv className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </button>
        )}
        {onPowerToggle && (
          <button
            className="flex-1 w-20 rounded-xl transition-all relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
              boxShadow: powerState
                ? "inset 0 4px 10px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.6)"
                : "0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            onClick={() => {
              playButtonClick();
              onPowerToggle?.();
            }}
            data-testid="button-power-toggle"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="absolute w-[70%] h-[70%] rounded-full"
                style={{
                  background: "radial-gradient(circle, #2a2a2a, #1a1a1a)",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                <div 
                  className="absolute inset-[15%] rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9)",
                  }}
                >
                  <Power className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </button>
        )}
      </div>
    </>
  );
}
