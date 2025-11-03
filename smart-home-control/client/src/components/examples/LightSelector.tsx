import { useState } from "react";
import LightSelector from "../LightSelector";

const mockLights = [
  { id: "1", name: "Living Room", brightness: 75, state: "on" as const },
  { id: "2", name: "Kitchen", brightness: 100, state: "on" as const },
  { id: "3", name: "Bedroom", brightness: 50, state: "on" as const },
  { id: "4", name: "Bathroom", brightness: 0, state: "off" as const },
  { id: "5", name: "Office", brightness: 80, state: "on" as const },
];

export default function LightSelectorExample() {
  const [selectedLight, setSelectedLight] = useState(mockLights[0]);

  return (
    <LightSelector
      lights={mockLights}
      selectedLight={selectedLight}
      onSelectLight={setSelectedLight}
    />
  );
}
