import { ref, onMounted, onUnmounted } from "vue";

interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
    onchargingtimechange: ((this: BatteryManager, ev: Event) => void) | null;
    ondischargingtimechange: ((this: BatteryManager, ev: Event) => void) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
}

declare global {
    interface Navigator {
        getBattery?: () => Promise<BatteryManager>;
    }
}

export function useBattery() {
    const isSupported = ref(false);
    const level = ref(100); // Pourcentage 0-100
    const charging = ref(false);
    const chargingTime = ref(0); // En secondes
    const dischargingTime = ref(0); // En secondes

    let battery: BatteryManager | null = null;

    const updateBatteryInfo = () => {
        if (battery) {
            level.value = Math.round(battery.level * 100);
            charging.value = battery.charging;
            chargingTime.value = battery.chargingTime;
            dischargingTime.value = battery.dischargingTime;
        }
    };

    const formatTime = (seconds: number): string => {
        if (!isFinite(seconds) || seconds <= 0) return "";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes}min`;
    };

    const getBatteryIcon = (): string => {
        if (charging.value) return "🔌";
        if (level.value <= 10) return "🪫";
        if (level.value <= 20) return "🔋";
        return "🔋";
    };

    const getBatteryColor = (): string => {
        if (charging.value) return "text-emerald-400";
        if (level.value <= 10) return "text-red-400";
        if (level.value <= 20) return "text-orange-400";
        if (level.value <= 50) return "text-yellow-400";
        return "text-emerald-400";
    };

    onMounted(async () => {
        if (typeof navigator !== "undefined" && navigator.getBattery) {
            try {
                battery = await navigator.getBattery();
                isSupported.value = true;
                updateBatteryInfo();

                // Écoute les changements
                battery.addEventListener("chargingchange", updateBatteryInfo);
                battery.addEventListener("levelchange", updateBatteryInfo);
                battery.addEventListener("chargingtimechange", updateBatteryInfo);
                battery.addEventListener("dischargingtimechange", updateBatteryInfo);
            } catch {
                isSupported.value = false;
            }
        }
    });

    onUnmounted(() => {
        if (battery) {
            battery.removeEventListener("chargingchange", updateBatteryInfo);
            battery.removeEventListener("levelchange", updateBatteryInfo);
            battery.removeEventListener("chargingtimechange", updateBatteryInfo);
            battery.removeEventListener("dischargingtimechange", updateBatteryInfo);
        }
    });

    return {
        isSupported,
        level,
        charging,
        chargingTime,
        dischargingTime,
        formatTime,
        getBatteryIcon,
        getBatteryColor,
    };
}
