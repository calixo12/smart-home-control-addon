import { MEDIA_ROOM_LIGHTS, MediaRoomLight } from "./mediaRoomLights";
import { MAIN_ROOM_LIGHTS, MainRoomLight } from "./mainRoomLights";
import { MASTER_BEDROOM_LIGHTS, MasterBedroomLight } from "./masterBedroomLights";
import { PLAYROOM_LIGHTS, PlayroomLight } from "./playroomLights";

export type RoomLight = MediaRoomLight | MainRoomLight | MasterBedroomLight | PlayroomLight;

export interface RoomConfig {
  id: string;
  name: string;
  lights: RoomLight[];
  stairsEntity: string;
  ledStripEntity: string;
}

export const ROOM_CONFIGS: Record<string, RoomConfig> = {
  "media-room": {
    id: "media-room",
    name: "Media Room",
    lights: MEDIA_ROOM_LIGHTS,
    stairsEntity: "switch.media_room_landing",
    ledStripEntity: "switch.master",
  },
  "main-room": {
    id: "main-room",
    name: "Main Room",
    lights: MAIN_ROOM_LIGHTS,
    stairsEntity: "switch.main_room_stairs",
    ledStripEntity: "switch.main_room_led_strip",
  },
  "master-bedroom": {
    id: "master-bedroom",
    name: "Master Bedroom",
    lights: MASTER_BEDROOM_LIGHTS,
    stairsEntity: "switch.master_bedroom_stairs",
    ledStripEntity: "switch.master_bedroom_led_strip",
  },
  "playroom": {
    id: "playroom",
    name: "Playroom",
    lights: PLAYROOM_LIGHTS,
    stairsEntity: "switch.playroom_stairs",
    ledStripEntity: "switch.playroom_led_strip",
  },
};

export const DEFAULT_ROOM = "media-room";
