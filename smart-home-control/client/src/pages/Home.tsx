import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import LightControlPanel from "@/components/LightControlPanel";
import LightBoxes from "@/components/LightBoxes";
import MediaControlPanel from "@/components/MediaControlPanel";
import MediaInputBoxes from "@/components/MediaInputBoxes";
import ConnectionSettings from "@/components/ConnectionSettings";
import ConnectionStatus from "@/components/ConnectionStatus";
import LockScreen from "@/components/LockScreen";
import { useToast } from "@/hooks/use-toast";
import { ROOM_CONFIGS, DEFAULT_ROOM } from "@/config/roomConfigs";
import { MEDIA_INPUTS, MediaInput } from "@/config/mediaInputs";
import { MAIN_ROOM_SHADES } from "@/config/mainRoomShades";
import { MASTER_BEDROOM_LIGHTS } from "@/config/masterBedroomLights";
import { MASTER_BEDROOM_SHADES } from "@/config/masterBedroomShades";
import { playButtonClick } from "@/lib/sounds";
import IntercomPanel from "@/components/IntercomPanel";
import SecurityPanel from "@/components/SecurityPanel";
import { motion, AnimatePresence } from "framer-motion";

interface Light {
  id: string;
  name: string;
  brightness: number;
  state: "on" | "off";
}

export default function Home() {
  const { toast } = useToast();
  const [enabledLights, setEnabledLights] = useState<string[]>(() => {
    const saved = localStorage.getItem("enabled-lights");
    return saved ? JSON.parse(saved) : [];
  });
  const [appName, setAppName] = useState(() => {
    return localStorage.getItem("app-name") || "Smart Home";
  });
  const [background, setBackground] = useState(() => {
    const saved = localStorage.getItem("app-background");
    // Force reset to carbon-fiber if using old defaults
    if (!saved || saved === "brushed-silver" || saved.includes("linear-gradient")) {
      localStorage.setItem("app-background", "carbon-fiber");
      return "carbon-fiber";
    }
    return saved;
  });
  const [appleEntity, setAppleEntity] = useState(() => {
    return localStorage.getItem("apple-entity") || "switch.media_room_landing";
  });
  const [lampEntity, setLampEntity] = useState(() => {
    return localStorage.getItem("lamp-entity") || "switch.master";
  });
  const [roomName, setRoomName] = useState(() => {
    return localStorage.getItem("room-name") || "Media Room";
  });
  const [selectedRoom, setSelectedRoom] = useState(() => {
    return localStorage.getItem("selected-room") || DEFAULT_ROOM;
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<"lighting" | "shades" | "media" | "intercom" | "security">("lighting");
  const [previousTab, setPreviousTab] = useState<"lighting" | "shades" | "media" | "intercom" | "security">("lighting");
  const [isLocked, setIsLocked] = useState(() => {
    const saved = localStorage.getItem("is-locked");
    return saved !== "false"; // Default to locked
  });
  const [incomingCall, setIncomingCall] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // Handle tab change with animation
  const handleTabChange = (newTab: "lighting" | "shades" | "media" | "intercom" | "security") => {
    if (activeTab !== newTab) {
      playButtonClick();
      setPreviousTab(activeTab);
      setActiveTab(newTab);
    }
  };

  // Auto-lock after 2 minutes of inactivity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivityTime(Date.now());
    };

    // Listen for user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('click', updateActivity);

    // Check for inactivity every 10 seconds
    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityTime;
      if (inactiveTime > 120000 && !isLocked) { // 2 minutes = 120000ms
        setIsLocked(true);
        localStorage.setItem("is-locked", "true");
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(interval);
    };
  }, [lastActivityTime, isLocked]);

  const { data: lights = [], isLoading } = useQuery<Light[]>({
    queryKey: ["/api/lights"],
    refetchInterval: 5000,
  });

  const { data: connectionData } = useQuery<{ status: "connected" | "connecting" | "disconnected" }>({
    queryKey: ["/api/connection/status"],
    refetchInterval: 10000,
  });

  const connectionStatus = connectionData?.status || "disconnected";

  // Get current room configuration
  const currentRoomConfig = ROOM_CONFIGS[selectedRoom];
  
  // Determine which lights/shades to show based on selected room and active tab
  let displayLights: Light[] = [];
  
  if (activeTab === "lighting") {
    const roomLightEntityIds = currentRoomConfig.lights.map(l => l.id);
    displayLights = lights.filter(l => roomLightEntityIds.includes(l.id));
  } else if (activeTab === "shades") {
    // Use room-specific shades based on selectedRoom
    if (selectedRoom === "main-room") {
      const shadeEntityIds = MAIN_ROOM_SHADES.map(s => s.id);
      displayLights = lights.filter(l => shadeEntityIds.includes(l.id));
    } else if (selectedRoom === "master-bedroom") {
      const bedroomShadeEntityIds = MASTER_BEDROOM_SHADES.map(s => s.id);
      displayLights = lights.filter(l => bedroomShadeEntityIds.includes(l.id));
    }
  }
  
  const [selectedLight, setSelectedLight] = useState<Light | null>(null);
  
  // Media tab state
  const [selectedInput, setSelectedInput] = useState<MediaInput | null>(MEDIA_INPUTS[0]);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [mediaPlayerEntity] = useState("media_player.downstairs_speaker");
  const [tvEntity, setTvEntity] = useState(() => {
    return localStorage.getItem("tv-entity") || "switch.tv";
  });
  const [powerEntity, setPowerEntity] = useState(() => {
    return localStorage.getItem("power-entity") || "automation.media_off_control";
  });

  useEffect(() => {
    if (displayLights.length > 0 && !selectedLight) {
      setSelectedLight(displayLights[0]);
    }
  }, [displayLights, selectedLight]);
  
  // Find the currently selected light's config to check if it's dimmable
  let selectedLightConfig;
  if (activeTab === "shades") {
    if (selectedRoom === "main-room") {
      selectedLightConfig = MAIN_ROOM_SHADES.find(s => s.id === selectedLight?.id);
    } else if (selectedRoom === "master-bedroom") {
      selectedLightConfig = MASTER_BEDROOM_SHADES.find(s => s.id === selectedLight?.id);
    }
  } else {
    selectedLightConfig = currentRoomConfig.lights.find(l => l.id === selectedLight?.id);
  }
  const isSelectedLightDimmable = selectedLightConfig?.isDimmable ?? true;
  
  // Update stairs and LED strip entities when room changes
  useEffect(() => {
    setAppleEntity(currentRoomConfig.stairsEntity);
    setLampEntity(currentRoomConfig.ledStripEntity);
  }, [selectedRoom]);

  useEffect(() => {
    localStorage.setItem("app-background", background);
  }, [background]);

  useEffect(() => {
    const url = localStorage.getItem("ha-url");
    const token = localStorage.getItem("ha-token");
    
    if (url && token && !isInitialized) {
      configMutation.mutate({ url, token });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const brightnessMutation = useMutation({
    mutationFn: async ({ id, brightness }: { id: string; brightness: number }) => {
      return apiRequest("POST", `/api/lights/${id}/brightness`, { brightness });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lights"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update brightness",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, state }: { id: string; state: "on" | "off" }) => {
      return apiRequest("POST", `/api/lights/${id}/toggle`, { state });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lights"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to toggle light",
        variant: "destructive",
      });
    },
  });

  const configMutation = useMutation({
    mutationFn: async ({ url, token }: { url: string; token: string }) => {
      return apiRequest("POST", "/api/config", { url, token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connection/status"] });
      toast({
        title: "Success",
        description: "Connected to Home Assistant",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to connect to Home Assistant",
        variant: "destructive",
      });
    },
  });

  const { data: appleData } = useQuery<{ state: string }>({
    queryKey: ["/api/entity", appleEntity, "state"],
    enabled: !!appleEntity,
    refetchInterval: 5000,
  });

  const { data: lampData } = useQuery<{ state: string }>({
    queryKey: ["/api/entity", lampEntity, "state"],
    enabled: !!lampEntity,
    refetchInterval: 5000,
  });

  const { data: tvData } = useQuery<{ state: string }>({
    queryKey: ["/api/entity", tvEntity, "state"],
    enabled: !!tvEntity,
    refetchInterval: 5000,
  });

  const appleToggleMutation = useMutation({
    mutationFn: async () => {
      const currentState = appleData?.state === "on" ? "off" : "on";
      return apiRequest("POST", `/api/switch/${appleEntity}/toggle`, { state: currentState });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entity", appleEntity, "state"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to toggle switch",
        variant: "destructive",
      });
    },
  });

  const lampToggleMutation = useMutation({
    mutationFn: async () => {
      const currentState = lampData?.state === "on" ? "off" : "on";
      return apiRequest("POST", `/api/switch/${lampEntity}/toggle`, { state: currentState });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entity", lampEntity, "state"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to toggle switch",
        variant: "destructive",
      });
    },
  });

  const handleBrightnessChange = (brightness: number) => {
    if (!selectedLight) return;
    brightnessMutation.mutate({ id: selectedLight.id, brightness });
  };

  const handleToggle = (state: "on" | "off") => {
    if (!selectedLight) return;
    toggleMutation.mutate({ id: selectedLight.id, state });
  };

  const handleSelectLight = (light: Light) => {
    setSelectedLight(light);
  };

  const handleConnectionSave = async (
    url: string, 
    token: string, 
    name: string, 
    apple: string, 
    lamp: string,
    bg: string,
    room: string,
    selectedRoomId: string
  ) => {
    localStorage.setItem("ha-url", url);
    localStorage.setItem("ha-token", token);
    localStorage.setItem("app-name", name);
    localStorage.setItem("apple-entity", apple);
    localStorage.setItem("lamp-entity", lamp);
    localStorage.setItem("app-background", bg);
    localStorage.setItem("room-name", room);
    localStorage.setItem("selected-room", selectedRoomId);
    setAppName(name);
    setAppleEntity(apple);
    setLampEntity(lamp);
    setBackground(bg);
    setRoomName(room);
    setSelectedRoom(selectedRoomId);
    
    await configMutation.mutateAsync({ url, token });
  };

  const handleAppleToggle = () => {
    if (!appleEntity) return;
    appleToggleMutation.mutate();
  };

  const handleLampToggle = () => {
    if (!lampEntity) return;
    lampToggleMutation.mutate();
  };

  const volumeMutation = useMutation({
    mutationFn: async (volume: number) => {
      return apiRequest("POST", `/api/media_player/${mediaPlayerEntity}/volume`, { volume });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set volume",
        variant: "destructive",
      });
    },
  });

  // Media handlers
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    volumeMutation.mutate(newVolume);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // Mute by setting volume to 0, unmute by restoring previous volume
    const muteVolume = !isMuted ? 0 : volume;
    volumeMutation.mutate(muteVolume);
  };

  const tvToggleMutation = useMutation({
    mutationFn: async () => {
      const currentState = tvData?.state === "on" ? "off" : "on";
      return apiRequest("POST", `/api/switch/${tvEntity}/toggle`, { state: currentState });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entity", tvEntity, "state"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to toggle TV switch",
        variant: "destructive",
      });
    },
  });

  const powerTriggerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/automation/${powerEntity}/trigger`, {});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to trigger power automation",
        variant: "destructive",
      });
    },
  });

  const inputTriggerMutation = useMutation({
    mutationFn: async (entityId: string) => {
      return apiRequest("POST", `/api/automation/${entityId}/trigger`, {});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to trigger input automation",
        variant: "destructive",
      });
    },
  });

  const handleTvToggle = () => {
    if (!tvEntity) return;
    tvToggleMutation.mutate();
  };

  const handlePowerToggle = () => {
    if (!powerEntity) return;
    powerTriggerMutation.mutate();
  };

  const handleSelectInput = (input: MediaInput) => {
    setSelectedInput(input);
    inputTriggerMutation.mutate(input.entityId);
  };

  // Intercom handlers
  const handleRoomSelect = (room: { id: string; label: string }) => {
    console.log("Calling room:", room.label);
    // TODO: Implement WebRTC call initiation
  };

  const handleUnlock = () => {
    setIsLocked(false);
    setActiveTab("lighting");
    localStorage.setItem("is-locked", "false");
  };

  const getBackgroundStyle = () => {
    switch (background) {
      case "pool-table":
        return {
          background: `
            radial-gradient(circle 1px at 12% 18%, rgba(10,20,12,0.4), transparent),
            radial-gradient(circle 1px at 87% 73%, rgba(10,20,12,0.35), transparent),
            radial-gradient(circle 1px at 45% 91%, rgba(10,20,12,0.3), transparent),
            radial-gradient(circle 1px at 63% 34%, rgba(10,20,12,0.38), transparent),
            radial-gradient(circle 1px at 24% 67%, rgba(10,20,12,0.32), transparent),
            repeating-linear-gradient(90deg, transparent 0, transparent 0.5px, rgba(20,40,25,0.15) 0.5px, rgba(20,40,25,0.15) 1px),
            repeating-linear-gradient(0deg, transparent 0, transparent 0.5px, rgba(20,40,25,0.15) 0.5px, rgba(20,40,25,0.15) 1px),
            radial-gradient(ellipse at top, rgba(35,70,45,0.3), transparent 60%),
            linear-gradient(135deg, #1a4028 0%, #0f2418 100%)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 1px 1px, 1px 1px, 100% 100%, 100% 100%",
        };
      case "walnut-wood":
        return {
          background: `
            linear-gradient(90deg, rgba(0,0,0,0.5) 0%, transparent 8%, rgba(0,0,0,0.4) 15%, transparent 23%, rgba(0,0,0,0.45) 31%, transparent 39%, rgba(0,0,0,0.35) 47%, transparent 55%, rgba(0,0,0,0.5) 63%, transparent 71%, rgba(0,0,0,0.4) 79%, transparent 87%, rgba(0,0,0,0.45) 95%),
            linear-gradient(92deg, rgba(0,0,0,0.2) 0%, transparent 25%, rgba(0,0,0,0.15) 50%, transparent 75%),
            repeating-linear-gradient(90deg, #2a1810 0px, #341d13 45px, #3e2316 90px, #2f1a12 135px, #2a1810 180px),
            radial-gradient(ellipse at 50% 0%, rgba(60,35,20,0.3), transparent 70%),
            radial-gradient(ellipse at center, #2c1810, #1a0f08)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%",
        };
      case "leather":
        return {
          background: `
            radial-gradient(ellipse 80px 60px at 15% 22%, rgba(0,0,0,0.25), transparent),
            radial-gradient(ellipse 95px 75px at 78% 68%, rgba(0,0,0,0.2), transparent),
            radial-gradient(ellipse 70px 55px at 42% 85%, rgba(0,0,0,0.22), transparent),
            radial-gradient(ellipse 60px 50px at 89% 34%, rgba(0,0,0,0.18), transparent),
            radial-gradient(circle 1px at 23% 45%, rgba(0,0,0,0.3), transparent),
            radial-gradient(circle 1px at 67% 78%, rgba(0,0,0,0.28), transparent),
            radial-gradient(circle 1px at 51% 12%, rgba(0,0,0,0.32), transparent),
            repeating-radial-gradient(circle at 35% 40%, transparent 0, transparent 1.5px, rgba(0,0,0,0.06) 1.5px, rgba(0,0,0,0.06) 2.5px),
            repeating-radial-gradient(circle at 70% 65%, transparent 0, transparent 1.8px, rgba(0,0,0,0.05) 1.8px, rgba(0,0,0,0.05) 2.8px),
            radial-gradient(ellipse at 20% 30%, #5d2f0f, #3a1d09)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 3px 3px, 3px 3px, 100% 100%",
        };
      case "brushed-metal":
        return {
          background: `
            linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 45%, rgba(0,0,0,0.15) 100%),
            repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.15) 0.8px, transparent 1.6px, rgba(0,0,0,0.08) 2.4px, transparent 3.2px),
            linear-gradient(180deg, #8a99a8 0%, #7a8997 25%, #95a4b3 50%, #7a8997 75%, #6a7987 100%)
          `,
          backgroundSize: "100% 100%, 2px 100%, 100% 100%",
        };
      case "cork-board":
        return {
          background: `
            radial-gradient(circle 2px at 11% 19%, rgba(90, 60, 30, 0.4), transparent),
            radial-gradient(circle 3px at 83% 71%, rgba(90, 60, 30, 0.35), transparent),
            radial-gradient(circle 1.5px at 37% 54%, rgba(90, 60, 30, 0.38), transparent),
            radial-gradient(circle 2.5px at 68% 28%, rgba(90, 60, 30, 0.32), transparent),
            radial-gradient(circle 2px at 24% 82%, rgba(90, 60, 30, 0.36), transparent),
            radial-gradient(circle 1px at 91% 47%, rgba(90, 60, 30, 0.3), transparent),
            radial-gradient(circle 3px at 56% 91%, rgba(90, 60, 30, 0.33), transparent),
            repeating-radial-gradient(circle at 25% 35%, transparent 0, transparent 6px, rgba(0,0,0,0.05) 6px, rgba(0,0,0,0.05) 9px),
            repeating-radial-gradient(circle at 75% 70%, transparent 0, transparent 7px, rgba(0,0,0,0.04) 7px, rgba(0,0,0,0.04) 10px),
            linear-gradient(135deg, #9d6e3f 0%, #8a5f35 50%, #77502b 100%)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%",
        };
      case "linen":
        return {
          background: `
            repeating-linear-gradient(0deg, transparent 0, transparent 0.8px, rgba(0,0,0,0.05) 0.8px, rgba(0,0,0,0.05) 1.6px),
            repeating-linear-gradient(90deg, transparent 0, transparent 0.8px, rgba(0,0,0,0.05) 0.8px, rgba(0,0,0,0.05) 1.6px),
            repeating-linear-gradient(45deg, rgba(200,195,175,0.6) 0px, rgba(210,205,185,0.6) 1px, rgba(200,195,175,0.6) 2px),
            repeating-linear-gradient(-45deg, rgba(205,200,180,0.5) 0px, rgba(215,210,190,0.5) 1px, rgba(205,200,180,0.5) 2px),
            linear-gradient(90deg, #c8c0a8 0%, #b8b098 25%, #c8c0a8 50%, #b8b098 75%, #c8c0a8 100%)
          `,
          backgroundSize: "1.6px 1.6px, 1.6px 1.6px, 2px 2px, 2px 2px, 100% 100%",
        };
      case "marble":
        return {
          background: `
            linear-gradient(125deg, transparent 0%, rgba(80,80,80,0.25) 12%, rgba(80,80,80,0.25) 18%, transparent 24%, transparent 35%, rgba(70,70,70,0.3) 42%, rgba(70,70,70,0.3) 51%, transparent 58%, transparent 68%, rgba(75,75,75,0.22) 74%, rgba(75,75,75,0.22) 82%, transparent 88%),
            linear-gradient(58deg, transparent 0%, rgba(85,85,85,0.18) 23%, rgba(85,85,85,0.18) 31%, transparent 39%, transparent 61%, rgba(78,78,78,0.2) 68%, rgba(78,78,78,0.2) 76%, transparent 84%),
            radial-gradient(ellipse at 35% 45%, rgba(110,110,110,0.35), transparent 55%),
            radial-gradient(ellipse at 72% 58%, rgba(95,95,95,0.25), transparent 48%),
            radial-gradient(ellipse at 18% 78%, rgba(100,100,100,0.2), transparent 42%),
            radial-gradient(ellipse at 88% 22%, rgba(90,90,90,0.22), transparent 45%),
            linear-gradient(180deg, #b8b8b8 0%, #a0a0a0 50%, #989898 100%)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%",
        };
      case "carbon-fiber":
        return {
          background: `
            repeating-linear-gradient(45deg, transparent 0px, transparent 2px, rgba(0,0,0,0.6) 2px, rgba(0,0,0,0.6) 4px),
            repeating-linear-gradient(-45deg, transparent 0px, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px),
            repeating-linear-gradient(45deg, rgba(20,20,20,0.8) 0px, rgba(20,20,20,0.8) 3px, rgba(30,30,30,0.6) 3px, rgba(30,30,30,0.6) 6px),
            repeating-linear-gradient(-45deg, rgba(15,15,15,0.8) 0px, rgba(15,15,15,0.8) 3px, rgba(25,25,25,0.6) 3px, rgba(25,25,25,0.6) 6px),
            linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 30%, rgba(0,0,0,0.3) 100%),
            radial-gradient(ellipse at 50% 0%, rgba(40,40,40,0.4), transparent 60%),
            linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #151515 100%)
          `,
          backgroundSize: "4px 4px, 4px 4px, 6px 6px, 6px 6px, 100% 100%, 100% 100%, 100% 100%",
        };
      default:
        return { background };
    }
  };

  const isRetro = ["pool-table", "walnut-wood", "leather", "brushed-metal", "cork-board", "linen", "marble", "carbon-fiber"].includes(background);

  const handleLock = () => {
    setIsLocked(true);
    localStorage.setItem("is-locked", "true");
  };

  if (isLocked) {
    const currentRoomName = ROOM_CONFIGS[selectedRoom]?.name || "Room";
    
    return (
      <div className="relative w-full h-screen" style={getBackgroundStyle()}>
        {/* Only show lockscreen when NOT receiving a call */}
        {!incomingCall && (
          <LockScreen 
            onUnlock={handleUnlock} 
            backgroundStyle={getBackgroundStyle()} 
            roomName={currentRoomName}
            onSecurityOpen={() => setActiveTab("security")}
          />
        )}
        
        {/* Always keep IntercomPanel active for WebSocket connection */}
        <div className={incomingCall ? "absolute inset-0 z-50" : "absolute inset-0 pointer-events-none"} style={incomingCall ? {} : { visibility: 'hidden' }}>
          <IntercomPanel 
            currentRoom={selectedRoom}
            onCallStateChange={(state) => {
              console.log('[Home] Call state changed while locked:', state);
              setIncomingCall(state === "receiving");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col transition-all duration-500 overflow-hidden"
      style={getBackgroundStyle()}
    >
      <header 
        className="flex items-center justify-between px-6 h-16 flex-shrink-0" 
        style={{ 
          animation: 'slideInDown 0.5s ease-out',
          background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
          borderBottom: '1px solid rgba(0,0,0,0.8)',
          boxShadow: "0 6px 16px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="rounded-lg p-1 flex gap-1"
            style={{
              background: `
                radial-gradient(ellipse at top left, rgba(80,80,80,0.4), transparent 50%),
                radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6), transparent 50%),
                linear-gradient(145deg, #2a2a2a, #1a1a1a)
              `,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.1)",
              border: "1px solid rgba(0,0,0,0.8)",
            }}
          >
            <button
              onClick={() => handleTabChange("lighting")}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all`}
              style={
                activeTab === "lighting"
                  ? {
                      background: "linear-gradient(145deg, #4a4a4a, #3a3a3a)",
                      boxShadow: "inset 0 4px 10px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(255,255,255,0.1)",
                      color: "white",
                      textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                    }
                  : {
                      background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                      color: "#9ca3af",
                    }
              }
              data-testid="tab-lighting"
            >
              Lighting
            </button>
            {selectedRoom !== "media-room" && (
              <button
                onClick={() => handleTabChange("shades")}
                className="px-6 py-2 rounded-md text-sm font-bold transition-all"
                style={
                  activeTab === "shades"
                    ? {
                        background: "linear-gradient(145deg, #4a4a4a, #3a3a3a)",
                        boxShadow: "inset 0 4px 10px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(255,255,255,0.1)",
                        color: "white",
                        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                      }
                    : {
                        background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                        color: "#9ca3af",
                      }
                }
                data-testid="tab-shades"
              >
                Shades
              </button>
            )}
            {(selectedRoom === "media-room" || selectedRoom === "playroom") && (
              <button
                onClick={() => handleTabChange("media")}
                className="px-6 py-2 rounded-md text-sm font-bold transition-all"
                style={
                  activeTab === "media"
                    ? {
                        background: "linear-gradient(145deg, #4a4a4a, #3a3a3a)",
                        boxShadow: "inset 0 4px 10px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(255,255,255,0.1)",
                        color: "white",
                        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                      }
                    : {
                        background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                        color: "#9ca3af",
                      }
                }
                data-testid="tab-media"
              >
                Media
              </button>
            )}
            <button
              onClick={() => handleTabChange("intercom")}
              className="px-6 py-2 rounded-md text-sm font-bold transition-all"
              style={
                activeTab === "intercom"
                  ? {
                      background: "linear-gradient(145deg, #4a4a4a, #3a3a3a)",
                      boxShadow: "inset 0 4px 10px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(255,255,255,0.1)",
                      color: "white",
                      textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                    }
                  : {
                      background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                      color: "#9ca3af",
                    }
              }
              data-testid="tab-intercom"
            >
              Intercom
            </button>
            {(selectedRoom === "main-room" || selectedRoom === "media-room") && (
              <button
                onClick={() => handleTabChange("security")}
                className="px-6 py-2 rounded-md text-sm font-bold transition-all"
                style={
                  activeTab === "security"
                    ? {
                        background: "linear-gradient(145deg, #4a4a4a, #3a3a3a)",
                        boxShadow: "inset 0 4px 10px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(255,255,255,0.1)",
                        color: "white",
                        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                      }
                    : {
                        background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                        color: "#9ca3af",
                      }
                }
                data-testid="tab-security"
              >
                Security
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div 
            style={{
              background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
              border: "1px solid rgba(0,0,0,0.8)",
              borderRadius: "8px",
              padding: "4px 12px",
            }}
          >
            <ConnectionStatus status={connectionStatus} />
          </div>
          <button
            onClick={() => {
              playButtonClick();
              handleLock();
            }}
            className="transition-all"
            style={{
              background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
              border: "1px solid rgba(0,0,0,0.8)",
              borderRadius: "8px",
              padding: "8px 10px",
            }}
            data-testid="button-lock"
            title="Lock Screen"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: '#fff' }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </button>
          <div
            style={{
              background: "linear-gradient(145deg, #e8e8e8, #d0d0d0)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)",
              border: "1px solid #999",
              borderRadius: "8px",
            }}
          >
            <ConnectionSettings
              onSave={handleConnectionSave}
              initialUrl={localStorage.getItem("ha-url") || "http://homeassistant.local:8123"}
              initialAppName={appName}
              initialAppleEntity={appleEntity}
              initialLampEntity={lampEntity}
              initialBackground={background}
              initialRoomName={roomName}
              initialSelectedRoom={selectedRoom}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex items-center justify-center h-full w-full px-8 relative">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === "lighting" && (
              <motion.div
                key="lighting"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ 
                  type: "tween",
                  ease: [0.42, 0, 0.58, 1],
                  duration: 0.35
                }}
                className="absolute inset-0 flex items-center justify-center px-8"
              >
                {isLoading || !selectedLight ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-md p-10 border border-white/30 flex items-center justify-center min-h-[400px] min-w-[600px]">
                <div className="text-white/70 text-center drop-shadow-lg">
                  {isLoading ? (
                    <div className="text-lg">Loading lights...</div>
                  ) : (
                    <div>
                      <div className="text-lg mb-2">No lights found</div>
                      <div className="text-sm">Configure Home Assistant connection in settings</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div 
                className="rounded-md p-10 flex gap-8 w-full max-w-7xl"
                style={{
                  background: `
                    radial-gradient(ellipse at top left, rgba(80,80,80,0.4), transparent 50%),
                    radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6), transparent 50%),
                    linear-gradient(145deg, #2a2a2a, #1a1a1a)
                  `,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0,0,0,0.8)",
                }}
              >
                <LightControlPanel
                  light={selectedLight}
                  onBrightnessChange={handleBrightnessChange}
                  onToggle={handleToggle}
                  onAppleToggle={handleAppleToggle}
                  onLampToggle={handleLampToggle}
                  appleState={appleData?.state === "playing" || appleData?.state === "on"}
                  lampState={lampData?.state === "on"}
                  isDimmable={isSelectedLightDimmable}
                />
                <LightBoxes
                  lights={displayLights}
                  selectedLight={selectedLight}
                  onSelectLight={handleSelectLight}
                />
              </div>
            )}
              </motion.div>
            )}

            {activeTab === "shades" && (
              <motion.div
                key="shades"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ 
                  type: "tween",
                  ease: [0.42, 0, 0.58, 1],
                  duration: 0.35
                }}
                className="absolute inset-0 flex items-center justify-center px-8"
              >
                {isLoading || !selectedLight ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-md p-10 border border-white/30 flex items-center justify-center min-h-[400px] min-w-[600px]">
                <div className="text-white/70 text-center drop-shadow-lg">
                  {isLoading ? (
                    <div className="text-lg">Loading lights...</div>
                  ) : (
                    <div>
                      <div className="text-lg mb-2">No lights found</div>
                      <div className="text-sm">Configure Home Assistant connection in settings</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div 
                className="rounded-md p-10 flex gap-8 w-full max-w-7xl"
                style={{
                  background: `
                    radial-gradient(ellipse at top left, rgba(80,80,80,0.4), transparent 50%),
                    radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6), transparent 50%),
                    linear-gradient(145deg, #2a2a2a, #1a1a1a)
                  `,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0,0,0,0.8)",
                }}
              >
                <LightControlPanel
                  light={selectedLight}
                  onBrightnessChange={handleBrightnessChange}
                  onToggle={handleToggle}
                  onAppleToggle={handleAppleToggle}
                  onLampToggle={handleLampToggle}
                  appleState={appleData?.state === "playing" || appleData?.state === "on"}
                  lampState={lampData?.state === "on"}
                  isDimmable={isSelectedLightDimmable}
                  isShades={true}
                />
                <LightBoxes
                  lights={displayLights}
                  selectedLight={selectedLight}
                  onSelectLight={handleSelectLight}
                  isShades={true}
                />
              </div>
            )}
              </motion.div>
            )}

            {activeTab === "media" && (
              <motion.div
                key="media"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ 
                  type: "tween",
                  ease: [0.42, 0, 0.58, 1],
                  duration: 0.35
                }}
                className="absolute inset-0 flex items-center justify-center px-8"
              >
                <div 
              className="rounded-md p-10 flex gap-8 w-full max-w-7xl"
              style={{
                background: `
                  radial-gradient(ellipse at top left, rgba(80,80,80,0.4), transparent 50%),
                  radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6), transparent 50%),
                  linear-gradient(145deg, #2a2a2a, #1a1a1a)
                `,
                boxShadow: "0 8px 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: "1px solid rgba(0,0,0,0.8)",
              }}
            >
              <MediaControlPanel
                input={selectedInput || MEDIA_INPUTS[0]}
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={handleMuteToggle}
                onTvToggle={handleTvToggle}
                onPowerToggle={handlePowerToggle}
                tvState={tvData?.state === "on"}
              />
              <MediaInputBoxes
                inputs={MEDIA_INPUTS}
                selectedInput={selectedInput}
                onSelectInput={handleSelectInput}
                isRetro={isRetro}
              />
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ 
                  type: "tween",
                  ease: [0.42, 0, 0.58, 1],
                  duration: 0.35
                }}
                className="absolute inset-0 flex items-center justify-center px-8"
              >
                <SecurityPanel />
              </motion.div>
            )}

            {activeTab === "intercom" && (
              <motion.div
                key="intercom"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ 
                  type: "tween",
                  ease: [0.42, 0, 0.58, 1],
                  duration: 0.35
                }}
                className="absolute inset-0 flex items-center justify-center px-8"
              >
                <IntercomPanel 
                  currentRoom={selectedRoom}
                  onCallStateChange={(state) => setIncomingCall(state === "receiving")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}
