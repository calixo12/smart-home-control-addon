import { useState, useEffect } from "react";
import { Shield, Home, Lock, DoorOpen, Bell, Delete } from "lucide-react";
import { playDSCKeypadBeep, playDSCSuccessBeep, playDSCErrorBeep, playDSCArmBeeps } from "@/lib/sounds";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

const ALARM_ENTITY_ID = "alarm_control_panel.stamps_residence";

export default function SecurityPanel() {
  const [systemStatus, setSystemStatus] = useState<"disarmed" | "armed-stay" | "armed-away">("disarmed");
  const [isReady, setIsReady] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [passcode, setPasscode] = useState("");

  // Poll alarm state from Home Assistant
  const { data: alarmState } = useQuery({
    queryKey: ["/api/entity", ALARM_ENTITY_ID, "state"],
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Update local state based on Home Assistant state
  useEffect(() => {
    if (alarmState) {
      const state = (alarmState as any).state;
      const attributes = (alarmState as any).attributes || {};
      
      console.log("[SecurityPanel] Alarm state:", state, "attributes:", attributes);
      
      // Update system status - handle all states including arming/pending
      if (state === "armed_home") {
        setSystemStatus("armed-stay");
      } else if (state === "armed_away" || state === "arming") {
        // Show armed-away during exit delay (arming state)
        setSystemStatus("armed-away");
      } else if (state === "disarmed") {
        setSystemStatus("disarmed");
      }
      
      // Check if system is ready
      // System is ready when state is "disarmed" and no issues
      setIsReady(state === "disarmed");
    }
  }, [alarmState]);

  const handleArmMode = async (mode: "armed-stay" | "armed-away") => {
    playDSCArmBeeps(); // 9 beeps when arming
    
    try {
      // Call Home Assistant to arm the system
      const service = mode === "armed-stay" ? "alarm_arm_home" : "alarm_arm_away";
      await apiRequest("POST", `/api/alarm/${ALARM_ENTITY_ID}/${service}`, { code: "1023" });
      
      setSystemStatus(mode);
    } catch (error) {
      console.error(`Failed to ${mode}:`, error);
      playDSCErrorBeep();
    }
  };

  const handleKeypadPress = (key: string) => {
    playDSCKeypadBeep(); // Play beep on every key press
    
    if (key === "delete") {
      setPasscode(passcode.slice(0, -1));
    } else if (passcode.length < 6) {
      setPasscode(passcode + key);
      
      // Auto-submit when 4 digits entered
      if (passcode.length + 1 === 4) {
        setTimeout(async () => {
          const enteredCode = passcode + key;
          
          // Check passcode (for demo, accept "1023")
          if (enteredCode === "1023") {
            try {
              // Call Home Assistant to disarm the system
              await apiRequest("POST", `/api/alarm/${ALARM_ENTITY_ID}/alarm_disarm`, { code: enteredCode });
              
              playDSCSuccessBeep(); // Success beep pattern
              setSystemStatus("disarmed");
              setShowKeypad(false);
              setPasscode("");
            } catch (error) {
              console.error("Failed to disarm:", error);
              playDSCErrorBeep();
              setPasscode("");
            }
          } else {
            // Wrong code - error beep and clear
            playDSCErrorBeep();
            setPasscode("");
          }
        }, 100);
      }
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div 
        className="w-full max-w-4xl h-[800px] rounded-xl overflow-hidden flex flex-col"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(80,80,80,0.4), transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6), transparent 50%),
            linear-gradient(145deg, #2a2a2a, #1a1a1a)
          `,
          boxShadow: "0 12px 40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.5)",
          border: "1px solid rgba(0,0,0,0.8)",
        }}
      >
        {/* Status Bar - Dark Mode */}
        <div 
          className="h-16 flex items-center justify-between px-6"
          style={{
            background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
            borderBottom: "1px solid rgba(0,0,0,0.8)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-4">
            <Shield className="w-5 h-5 text-gray-300" />
            <span className="text-white font-bold text-base" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>Stamps Residence</span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Status LEDs */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500' : 'bg-gray-700'}`} 
                style={{ boxShadow: isReady ? '0 0 10px rgba(34,197,94,0.9), inset 0 -1px 2px rgba(0,0,0,0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.5)' }}
              />
              <span className="text-xs text-gray-300 uppercase font-semibold">Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${systemStatus !== 'disarmed' ? 'bg-red-500' : 'bg-gray-700'}`}
                style={{ boxShadow: systemStatus !== 'disarmed' ? '0 0 10px rgba(239,68,68,0.9), inset 0 -1px 2px rgba(0,0,0,0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.5)' }}
              />
              <span className="text-xs text-gray-300 uppercase font-semibold">Armed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-700" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }} />
              <span className="text-xs text-gray-300 uppercase font-semibold">Trouble</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"
                style={{ boxShadow: '0 0 10px rgba(34,197,94,0.9), inset 0 -1px 2px rgba(0,0,0,0.3)' }}
              />
              <span className="text-xs text-gray-300 uppercase font-semibold">AC</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 relative">{showKeypad ? (
          /* Keypad View */
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <div className="text-2xl font-bold text-white mb-4" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>Enter Passcode to Disarm</div>
              <div className="flex gap-3 justify-center mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: i < passcode.length 
                        ? "linear-gradient(145deg, #4a4a4a, #2a2a2a)"
                        : "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
                      boxShadow: "inset 0 3px 6px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {i < passcode.length && (
                      <div className="w-4 h-4 rounded-full bg-green-500" style={{ boxShadow: "0 0 8px rgba(34,197,94,0.8)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* iPad 1 Style Keypad - Dark Mode */}
            <div className="grid grid-cols-3 gap-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeypadPress(key)}
                  className="w-20 h-20 rounded-xl transition-all flex items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg, #4a4a4a, #2a2a2a)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)",
                    border: "1px solid rgba(0,0,0,0.8)",
                  }}
                  data-testid={`keypad-${key}`}
                >
                  <span className="text-3xl font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{key}</span>
                </button>
              ))}
              <div />
              <button
                onClick={() => handleKeypadPress("0")}
                className="w-20 h-20 rounded-xl transition-all flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #4a4a4a, #2a2a2a)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)",
                  border: "1px solid rgba(0,0,0,0.8)",
                }}
                data-testid="keypad-0"
              >
                <span className="text-3xl font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>0</span>
              </button>
              <button
                onClick={() => handleKeypadPress("delete")}
                className="w-20 h-20 rounded-xl transition-all flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #3a3a3a, #1a1a1a)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)",
                  border: "1px solid rgba(0,0,0,0.8)",
                }}
                data-testid="keypad-delete"
              >
                <Delete className="w-6 h-6 text-gray-300" />
              </button>
            </div>

            <button
              onClick={() => {
                setShowKeypad(false);
                setPasscode("");
              }}
              className="mt-8 px-6 py-3 rounded-lg transition-all"
              style={{
                background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)",
                border: "1px solid rgba(0,0,0,0.8)",
              }}
              data-testid="button-cancel-keypad"
            >
              <span className="text-lg font-bold text-gray-300">Cancel</span>
            </button>
          </div>
        ) : (
          /* Main Security View */
          <>
          {/* Date and Time */}
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-white mb-2" style={{ textShadow: "0 3px 6px rgba(0,0,0,0.9)" }}>
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-lg text-gray-300 font-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* System Status Display */}
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg"
              style={{
                background: systemStatus === 'disarmed' 
                  ? "linear-gradient(145deg, #166534, #15803d)"
                  : systemStatus === 'armed-stay'
                  ? "linear-gradient(145deg, #a16207, #ca8a04)"
                  : "linear-gradient(145deg, #991b1b, #dc2626)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.4)",
                border: "1px solid rgba(0,0,0,0.6)",
              }}
            >
              <Shield className="w-8 h-8 text-white" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
              <span className="text-2xl font-bold text-white" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                {systemStatus === 'disarmed' ? 'System Disarmed' :
                 systemStatus === 'armed-stay' ? 'Armed Stay' :
                 'Armed Away'}
              </span>
            </div>
          </div>

          {/* Main Control Buttons - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Arm Stay */}
            <button
              onClick={() => handleArmMode('armed-stay')}
              className="h-40 rounded-xl transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden"
              style={{
                background: systemStatus === 'armed-stay' 
                  ? "linear-gradient(145deg, #ca8a04, #a16207)"
                  : "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                boxShadow: systemStatus === 'armed-stay'
                  ? "inset 0 -3px 10px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.2), 0 6px 16px rgba(0,0,0,0.6)"
                  : "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                border: "1px solid rgba(0,0,0,0.8)",
              }}
              data-testid="button-arm-stay"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div 
                  className="w-[60%] h-[60%] rounded-full"
                  style={{
                    background: systemStatus === 'armed-stay'
                      ? "radial-gradient(circle, #fde68a, #ca8a04)"
                      : "radial-gradient(circle, #4a4a4a, #2a2a2a)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  <div 
                    className="absolute inset-[15%] rounded-full flex flex-col items-center justify-center gap-1"
                    style={{
                      background: systemStatus === 'armed-stay'
                        ? "linear-gradient(145deg, #ca8a04, #92400e)"
                        : "linear-gradient(145deg, #3a3a3a, #1a1a1a)",
                      boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                    }}
                  >
                    <Home className="w-6 h-6 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                    <div className="text-xs font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                      Arm Stay
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Arm Away */}
            <button
              onClick={() => handleArmMode('armed-away')}
              className="h-40 rounded-xl transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden"
              style={{
                background: systemStatus === 'armed-away'
                  ? "linear-gradient(145deg, #dc2626, #991b1b)"
                  : "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                boxShadow: systemStatus === 'armed-away'
                  ? "inset 0 -3px 10px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.2), 0 6px 16px rgba(0,0,0,0.6)"
                  : "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                border: "1px solid rgba(0,0,0,0.8)",
              }}
              data-testid="button-arm-away"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div 
                  className="w-[60%] h-[60%] rounded-full"
                  style={{
                    background: systemStatus === 'armed-away'
                      ? "radial-gradient(circle, #fca5a5, #dc2626)"
                      : "radial-gradient(circle, #4a4a4a, #2a2a2a)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  <div 
                    className="absolute inset-[15%] rounded-full flex flex-col items-center justify-center gap-1"
                    style={{
                      background: systemStatus === 'armed-away'
                        ? "linear-gradient(145deg, #dc2626, #7f1d1d)"
                        : "linear-gradient(145deg, #3a3a3a, #1a1a1a)",
                      boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                    }}
                  >
                    <Lock className="w-6 h-6 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                    <div className="text-xs font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                      Arm Away
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Disarm */}
            <button
              onClick={() => setShowKeypad(true)}
              className="h-40 rounded-xl transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden"
              style={{
                background: systemStatus === 'disarmed'
                  ? "linear-gradient(145deg, #15803d, #166534)"
                  : "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                boxShadow: systemStatus === 'disarmed'
                  ? "inset 0 -3px 10px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.2), 0 6px 16px rgba(0,0,0,0.6)"
                  : "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                border: "1px solid rgba(0,0,0,0.8)",
              }}
              data-testid="button-disarm"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div 
                  className="w-[60%] h-[60%] rounded-full"
                  style={{
                    background: systemStatus === 'disarmed'
                      ? "radial-gradient(circle, #86efac, #15803d)"
                      : "radial-gradient(circle, #4a4a4a, #2a2a2a)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  <div 
                    className="absolute inset-[15%] rounded-full flex flex-col items-center justify-center gap-1"
                    style={{
                      background: systemStatus === 'disarmed'
                        ? "linear-gradient(145deg, #15803d, #14532d)"
                        : "linear-gradient(145deg, #3a3a3a, #1a1a1a)",
                      boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                    }}
                  >
                    <DoorOpen className="w-6 h-6 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                    <div className="text-xs font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                      Disarm
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Chime */}
            <button
              className="h-40 rounded-xl transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                border: "1px solid rgba(0,0,0,0.8)",
              }}
              data-testid="button-chime"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div 
                  className="w-[60%] h-[60%] rounded-full"
                  style={{
                    background: "radial-gradient(circle, #4a4a4a, #2a2a2a)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  <div 
                    className="absolute inset-[15%] rounded-full flex flex-col items-center justify-center gap-1"
                    style={{
                      background: "linear-gradient(145deg, #3a3a3a, #1a1a1a)",
                      boxShadow: "inset 0 3px 8px rgba(0,0,0,0.6)",
                    }}
                  >
                    <Bell className="w-6 h-6 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                    <div className="text-xs font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                      Chime
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </>
        )}
        </div>
      </div>
    </div>
  );
}
