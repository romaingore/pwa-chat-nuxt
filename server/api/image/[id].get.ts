export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID manquant",
        });
    }

    try {
        const response = await fetch(`https://api.tools.gavago.fr/socketio/api/images/${id}`);

        if (!response.ok) {
            console.error(`Erreur API images: ${response.status}`);
            throw createError({
                statusCode: response.status,
                message: `Erreur récupération image: ${response.status}`,
            });
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur fetch image:", error);
        throw createError({
            statusCode: 500,
            message: String(error),
        });
    }
});
