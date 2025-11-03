import { ChevronUp, ChevronDown, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Light {
  id: string;
  name: string;
  brightness: number;
  state: "on" | "off";
}

interface LightSelectorProps {
  lights: Light[];
  selectedLight: Light;
  onSelectLight: (light: Light) => void;
  onClose?: () => void;
}

export default function LightSelector({
  lights,
  selectedLight,
  onSelectLight,
}: LightSelectorProps) {
  const currentIndex = lights.findIndex((l) => l.id === selectedLight.id);
  
  const selectNext = () => {
    const nextIndex = (currentIndex + 1) % lights.length;
    onSelectLight(lights[nextIndex]);
  };

  const selectPrevious = () => {
    const prevIndex = (currentIndex - 1 + lights.length) % lights.length;
    onSelectLight(lights[prevIndex]);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-12 h-full w-full px-12 relative">
      <div className="absolute top-8 right-12 text-lg font-semibold text-white drop-shadow-lg">
        Lighting
      </div>

      <div className="text-sm text-white/70 drop-shadow uppercase tracking-wide">
        Light Selector
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full max-w-2xl bg-white/20 backdrop-blur-sm rounded-md p-6 border border-white/30 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-1 justify-center">
            <Lightbulb
              className={`w-16 h-16 ${selectedLight.state === "on" ? "text-white" : "text-white/50"}`}
            />
            <div className="text-4xl font-semibold text-white drop-shadow-lg">
              {selectedLight.name}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={selectPrevious}
              className="w-12 h-12 rounded-xl"
              data-testid="button-previous-light"
            >
              <ChevronUp className="w-6 h-6 text-white" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={selectNext}
              className="w-12 h-12 rounded-xl"
              data-testid="button-next-light"
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
