import { playButtonClick } from "@/lib/sounds";

interface MediaInput {
  id: string;
  name: string;
  entityId: string;
  entityType: 'automation' | 'switch';
}

interface MediaInputBoxesProps {
  inputs: MediaInput[];
  selectedInput: MediaInput | null;
  onSelectInput: (input: MediaInput) => void;
  isRetro?: boolean;
}

export default function MediaInputBoxes({
  inputs,
  selectedInput,
  onSelectInput,
  isRetro = false,
}: MediaInputBoxesProps) {
  const displayInputs = inputs.slice(0, 4);

  if (isRetro) {
    return (
      <div className="flex flex-col w-full max-w-2xl">
        <div className="text-base text-white drop-shadow-lg uppercase tracking-wide mb-8 text-center font-bold">
          Inputs
        </div>
        <div className="grid grid-cols-2 gap-6 h-[600px]">
          {displayInputs.map((input) => {
            const isSelected = selectedInput?.id === input.id;

            return (
              <button
                key={input.id}
                onClick={() => {
                  playButtonClick();
                  onSelectInput(input);
                }}
                className={`relative rounded-md transition-all flex flex-col items-center justify-center overflow-hidden ${
                  isSelected ? "scale-[1.02]" : ""
                }`}
                style={{
                  background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                  boxShadow: isSelected 
                    ? "inset 0 4px 10px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.6)"
                    : "0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
                data-testid={`button-input-${input.id}`}
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
                      <div className="text-sm font-bold text-white text-center px-2">
                        {input.name}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-2xl">
      <div className="text-base text-black drop-shadow-lg uppercase tracking-wide mb-8 text-center font-bold">
        Inputs
      </div>
      <div className="grid grid-cols-2 gap-6 h-[600px]">
        {displayInputs.map((input) => {
          const isSelected = selectedInput?.id === input.id;

          return (
            <button
              key={input.id}
              onClick={() => {
                playButtonClick();
                onSelectInput(input);
              }}
              className={`bg-white/10 backdrop-blur-sm rounded-md p-6 border-2 transition-all hover-elevate active-elevate-2 flex flex-col items-center justify-center gap-4 ${
                isSelected
                  ? "border-white bg-white/20 scale-[1.02]"
                  : "border-white/30"
              }`}
              data-testid={`button-input-${input.id}`}
            >
              <div className="text-2xl font-semibold text-white drop-shadow-lg text-center">
                {input.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
