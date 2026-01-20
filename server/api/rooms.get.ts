export default defineEventHandler(async () => {
    try {
        const response = await fetch("https://api.tools.gavago.fr/socketio/api/rooms", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                message: `Erreur récupération rooms: ${response.status}`,
            });
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur fetch rooms:", error);
        throw createError({
            statusCode: 500,
            message: String(error),
        });
    }
});
