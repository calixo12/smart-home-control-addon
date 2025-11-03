import { useState } from "react";
import { Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BackgroundCustomizerProps {
  currentBackground: string;
  onBackgroundChange: (background: string) => void;
}

const GRADIENT_PRESETS = [
  { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Night", value: "linear-gradient(135deg, #434343 0%, #000000 100%)" },
  { name: "Aurora", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { name: "Fire", value: "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)" },
  { name: "Lavender", value: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)" },
  { name: "Mint", value: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)" },
  { name: "Sky", value: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" },
];

export default function BackgroundCustomizer({
  currentBackground,
  onBackgroundChange,
}: BackgroundCustomizerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-xl z-50"
          data-testid="button-open-background-settings"
        >
          <Palette className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Background Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Gradient Presets
            </div>
            <div className="grid grid-cols-3 gap-3">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    onBackgroundChange(preset.value);
                    console.log("Background changed:", preset.name);
                  }}
                  className={`aspect-square rounded-2xl hover-elevate active-elevate-2 transition-all ${
                    currentBackground === preset.value
                      ? "ring-4 ring-primary scale-105"
                      : ""
                  }`}
                  style={{ background: preset.value }}
                  data-testid={`button-preset-${preset.name.toLowerCase()}`}
                >
                  <span className="sr-only">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onBackgroundChange(
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                );
                console.log("Reset to default background");
              }}
              data-testid="button-reset-background"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
