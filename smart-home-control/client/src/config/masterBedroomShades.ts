export interface MasterBedroomShade {
  id: string;
  displayName: string;
  position: "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right";
  isDimmable: boolean;
}

export const MASTER_BEDROOM_SHADES: MasterBedroomShade[] = [
  {
    id: "cover.horizontal",
    displayName: "Horizontal",
    position: "top-left",
    isDimmable: true,
  },
  {
    id: "cover.vertical",
    displayName: "Vertical",
    position: "top-right",
    isDimmable: true,
  },
];
