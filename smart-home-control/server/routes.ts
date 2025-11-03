import type { Express } from "express";
import { createServer, type Server } from "http";

interface HomeAssistantConfig {
  url: string;
  token: string;
}

let haConfig: HomeAssistantConfig | null = null;

async function fetchFromHA(endpoint: string, options: RequestInit = {}) {
  if (!haConfig) {
    throw new Error("Home Assistant not configured");
  }

  const response = await fetch(`${haConfig.url}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${haConfig.token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Home Assistant API error: ${response.statusText}`);
  }

  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/config", async (req, res) => {
    try {
      const { url, token } = req.body;
      
      if (!url || !token) {
        return res.status(400).json({ error: "URL and token required" });
      }

      // Remove trailing slash from URL if present
      const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      haConfig = { url: cleanUrl, token };

      console.log(`[Home Assistant] Attempting to connect to: ${cleanUrl}/api/`);

      const response = await fetch(`${cleanUrl}/api/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(`[Home Assistant] Connection failed with status: ${response.status}`);
        haConfig = null;
        return res.status(401).json({ 
          error: "Invalid credentials or unable to connect",
          details: `HTTP ${response.status}: ${response.statusText}`
        });
      }

      console.log(`[Home Assistant] Successfully connected!`);
      res.json({ success: true });
    } catch (error: any) {
      console.error(`[Home Assistant] Connection error:`, error.message);
      haConfig = null;
      res.status(500).json({ 
        error: "Failed to connect to Home Assistant",
        details: error.message 
      });
    }
  });

  app.get("/api/lights", async (req, res) => {
    try {
      const states = await fetchFromHA("/api/states");
      
      const lights = states
        .filter((entity: any) => {
          // Include entities that start with "light.", "switch.", "cover.", or "fan."
          const isLight = entity.entity_id.startsWith("light.");
          const isSwitch = entity.entity_id.startsWith("switch.");
          const isCover = entity.entity_id.startsWith("cover.");
          const isFan = entity.entity_id.startsWith("fan.");
          
          if (!isLight && !isSwitch && !isCover && !isFan) return false;
          
          // Exclude groups (they have an entity_id attribute listing member entities)
          if (entity.attributes.entity_id && Array.isArray(entity.attributes.entity_id)) {
            return false;
          }
          
          // For lights, exclude helpers and other non-physical lights by checking for supported features
          // Real lights typically have color/brightness support (supported_features > 0)
          // Helpers often have supported_features = 0 or are missing certain attributes
          if (isLight && !entity.attributes.supported_features) return false;
          
          // For covers, exclude helpers/groups by checking for supported features
          // Real covers typically have open/close/position support (supported_features > 0)
          if (isCover && !entity.attributes.supported_features) return false;
          
          return true;
        })
        .map((entity: any) => {
          const isCover = entity.entity_id.startsWith("cover.");
          const isFan = entity.entity_id.startsWith("fan.");
          
          // For covers, use position attribute (0-100)
          // For fans, use percentage attribute (0-100)
          // For lights, use brightness attribute (0-255)
          let brightness = 0;
          if (isCover) {
            // Covers use "current_position" attribute (0-100), state is "open", "closed", etc.
            brightness = entity.attributes.current_position || 0;
          } else if (isFan) {
            // Fans use "percentage" attribute (0-100)
            brightness = entity.attributes.percentage || 0;
          } else {
            // Lights and switches
            brightness = entity.state === "on" 
              ? Math.round((entity.attributes.brightness || 255) / 255 * 100)
              : 0;
          }
          
          return {
            id: entity.entity_id,
            name: entity.attributes.friendly_name || entity.entity_id,
            brightness,
            state: isCover 
              ? (entity.state === "open" || entity.state === "opening" ? "on" : "off")
              : entity.state,
          };
        });

      console.log(`[Home Assistant] Found ${lights.length} lights, switches, covers, and fans`);
      res.json(lights);
    } catch (error) {
      console.error(`[Home Assistant] Error fetching lights:`, error);
      res.status(500).json({ error: "Failed to fetch lights" });
    }
  });

  app.post("/api/lights/:id/brightness", async (req, res) => {
    try {
      const { id } = req.params;
      const { brightness } = req.body;

      const isCover = id.startsWith("cover.");
      const isFan = id.startsWith("fan.");
      
      if (isCover) {
        // For covers, use set_cover_position service with position (0-100)
        await fetchFromHA("/api/services/cover/set_cover_position", {
          method: "POST",
          body: JSON.stringify({
            entity_id: id,
            position: brightness,
          }),
        });
      } else if (isFan) {
        // For fans, use set_percentage service with percentage (0-100)
        await fetchFromHA("/api/services/fan/set_percentage", {
          method: "POST",
          body: JSON.stringify({
            entity_id: id,
            percentage: brightness,
          }),
        });
      } else {
        // For lights, use turn_on service with brightness (0-255)
        const brightnessValue = Math.round((brightness / 100) * 255);
        await fetchFromHA("/api/services/light/turn_on", {
          method: "POST",
          body: JSON.stringify({
            entity_id: id,
            brightness: brightnessValue,
          }),
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to set brightness" });
    }
  });

  app.post("/api/lights/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      const isCover = id.startsWith("cover.");
      const isFan = id.startsWith("fan.");
      const { state } = req.body;

      if (isCover) {
        // For covers, use open_cover or close_cover
        const service = state === "on" ? "open_cover" : "close_cover";
        await fetchFromHA(`/api/services/cover/${service}`, {
          method: "POST",
          body: JSON.stringify({
            entity_id: id,
          }),
        });
      } else if (isFan) {
        // For fans, use turn_on or turn_off
        const service = state === "on" ? "turn_on" : "turn_off";
        await fetchFromHA(`/api/services/fan/${service}`, {
          method: "POST",
          body: JSON.stringify({
            entity_id: id,
          }),
        });
      } else {
        // For lights and switches, use turn_on or turn_off
        const service = state === "on" ? "turn_on" : "turn_off";
        const domain = id.startsWith("switch.") ? "switch" : "light";

        await fetchFromHA(`/api/services/${domain}/${service}`, {
          method: "POST",
          body: JSON.stringify({
            entity_id: id,
          }),
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle light" });
    }
  });

  app.post("/api/switch/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      const { state } = req.body;

      const service = state === "on" ? "turn_on" : "turn_off";

      await fetchFromHA(`/api/services/switch/${service}`, {
        method: "POST",
        body: JSON.stringify({
          entity_id: id,
        }),
      });

      res.json({ success: true });
    } catch (error) {
      console.error(`[Home Assistant] Error toggling switch:`, error);
      res.status(500).json({ error: "Failed to toggle switch" });
    }
  });

  app.post("/api/media_player/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;

      await fetchFromHA(`/api/services/media_player/media_play_pause`, {
        method: "POST",
        body: JSON.stringify({
          entity_id: id,
        }),
      });

      res.json({ success: true });
    } catch (error) {
      console.error(`[Home Assistant] Error toggling media player:`, error);
      res.status(500).json({ error: "Failed to toggle media player" });
    }
  });

  app.post("/api/media_player/:id/volume", async (req, res) => {
    try {
      const { id } = req.params;
      const { volume } = req.body;

      // Convert percentage (0-100) to volume_level (0.0-1.0)
      const volumeLevel = volume / 100;

      console.log(`[Home Assistant] Setting volume for ${id} to ${volumeLevel}`);

      await fetchFromHA("/api/services/media_player/volume_set", {
        method: "POST",
        body: JSON.stringify({
          entity_id: id,
          volume_level: volumeLevel,
        }),
      });

      res.json({ success: true });
    } catch (error) {
      console.error(`[Home Assistant] Error setting media player volume:`, error);
      res.status(500).json({ error: "Failed to set media player volume" });
    }
  });

  app.post("/api/helper/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;

      await fetchFromHA(`/api/services/input_boolean/toggle`, {
        method: "POST",
        body: JSON.stringify({
          entity_id: id,
        }),
      });

      res.json({ success: true });
    } catch (error) {
      console.error(`[Home Assistant] Error toggling helper:`, error);
      res.status(500).json({ error: "Failed to toggle helper" });
    }
  });

  app.post("/api/automation/:id/trigger", async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`[Home Assistant] Triggering automation: ${id}`);
      
      await fetchFromHA("/api/services/automation/trigger", {
        method: "POST",
        body: JSON.stringify({
          entity_id: id,
        }),
      });

      res.json({ success: true });
    } catch (error) {
      console.error(`[Home Assistant] Error triggering automation:`, error);
      res.status(500).json({ error: "Failed to trigger automation" });
    }
  });

  app.get("/api/entity/:id/state", async (req, res) => {
    try {
      const { id } = req.params;
      const state = await fetchFromHA(`/api/states/${id}`);
      
      res.json({ 
        state: state.state,
        attributes: state.attributes 
      });
    } catch (error) {
      console.error(`[Home Assistant] Error getting entity state:`, error);
      res.status(500).json({ error: "Failed to get entity state" });
    }
  });

  app.get("/api/connection/status", async (req, res) => {
    if (!haConfig) {
      return res.json({ status: "disconnected" });
    }

    try {
      await fetch(`${haConfig.url}/api/`, {
        headers: {
          Authorization: `Bearer ${haConfig.token}`,
        },
      });
      res.json({ status: "connected" });
    } catch (error) {
      res.json({ status: "disconnected" });
    }
  });

  // Alarm control panel endpoints
  app.post("/api/alarm/:id/:service", async (req, res) => {
    try {
      const { id, service } = req.params;
      const { code } = req.body;
      
      console.log(`[Home Assistant] Calling alarm service: ${service} for ${id}`);
      
      // Build service data based on what the service accepts
      const serviceData: any = {
        entity_id: id,
      };
      
      // Only include code if provided
      if (code) {
        serviceData.code = code;
      }
      
      await fetchFromHA(`/api/services/alarm_control_panel/${service}`, {
        method: "POST",
        body: JSON.stringify(serviceData),
      });

      res.json({ success: true });
    } catch (error) {
      console.error(`[Home Assistant] Error calling alarm service:`, error);
      res.status(500).json({ error: "Failed to call alarm service" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
