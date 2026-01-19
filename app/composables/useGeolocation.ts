import { ref } from "vue";

export function useGeolocation() {
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const position = ref<{ lat: number; lng: number } | null>(null);

    /**
     * Vérifie si la géolocalisation est supportée
     */
    function isSupported(): boolean {
        return "geolocation" in navigator;
    }

    /**
     * Récupère la position actuelle de l'utilisateur
     */
    async function getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
        if (!isSupported()) {
            error.value = "La géolocalisation n'est pas supportée par ce navigateur";
            return null;
        }

        isLoading.value = true;
        error.value = null;

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    position.value = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };
                    isLoading.value = false;
                    resolve(position.value);
                },
                (err) => {
                    isLoading.value = false;
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            error.value = "Permission de géolocalisation refusée";
                            break;
                        case err.POSITION_UNAVAILABLE:
                            error.value = "Position non disponible";
                            break;
                        case err.TIMEOUT:
                            error.value = "Délai d'attente dépassé";
                            break;
                        default:
                            error.value = "Erreur de géolocalisation";
                    }
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000,
                }
            );
        });
    }

    return {
        isLoading,
        error,
        position,
        isSupported,
        getCurrentPosition,
    };
}
