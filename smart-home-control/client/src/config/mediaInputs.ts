export interface MediaInput {
  id: string;
  name: string;
  entityId: string;
  entityType: 'automation' | 'switch';
}

export const MEDIA_INPUTS: MediaInput[] = [
  {
    id: "apple_tv",
    name: "Apple TV",
    entityId: "automation.media_atv_control_2",
    entityType: "automation",
  },
  {
    id: "ps5",
    name: "PS5",
    entityId: "automation.media_playstation_control",
    entityType: "automation",
  },
  {
    id: "blu_ray",
    name: "Blu-Ray",
    entityId: "automation.media_blu_ray_control",
    entityType: "automation",
  },
  {
    id: "record_player",
    name: "Record Player",
    entityId: "automation.media_rcp_control",
    entityType: "automation",
  },
];
