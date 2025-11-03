export interface MasterBedroomLight {
  id: string;
  displayName: string;
  position: "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";
  isDimmable: boolean;
}

export const MASTER_BEDROOM_LIGHTS: MasterBedroomLight[] = [
  {
    id: "light.master_bedroom_main_lights",
    displayName: "Main Lights",
    position: "top-left",
    isDimmable: true,
  },
  {
    id: "fan.accent_nightlight",
    displayName: "Accent Nightlight",
    position: "top-right",
    isDimmable: false,
  },
];
