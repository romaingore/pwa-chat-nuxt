export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        console.log("Uploading image for id:", body.id);

        // Retour à la méthode de l'exemple de la doc : ID dans le body
        const response = await fetch("https://api.tools.gavago.fr/socketio/api/images/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: body.id,
                image_data: body.image_data,
            }),
        });

        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Non-JSON response:", responseText);
            throw createError({
                statusCode: 500,
                message: "L'API a renvoyé une réponse invalide (HTML au lieu de JSON)",
            });
        }

        if (!response.ok) {
            console.error("API error:", response.status, data);
            throw createError({
                statusCode: response.status,
                message: JSON.stringify(data),
            });
        }

        console.log("Upload response:", data);
        return data;
    } catch (error) {
        console.error("Upload error:", error);
        throw createError({
            statusCode: 500,
            message: String(error),
        });
    }
});
