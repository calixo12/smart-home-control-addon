import { useState } from "react";
import LightBoxes from "../LightBoxes";

const mockLights = [
  { id: "1", name: "Living Room", brightness: 75, state: "on" as const },
  { id: "2", name: "Kitchen", brightness: 100, state: "on" as const },
  { id: "3", name: "Bedroom", brightness: 50, state: "on" as const },
  { id: "4", name: "Bathroom", brightness: 0, state: "off" as const },
];

export default function LightBoxesExample() {
  const [selectedLight, setSelectedLight] = useState(mockLights[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <LightBoxes
        lights={mockLights}
        selectedLight={selectedLight}
        onSelectLight={setSelectedLight}
      />
    </div>
  );
}
