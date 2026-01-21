import type { Message } from "~/types/chat";

/**
 * Vérifie si un message est lié à une image (à ignorer car on affiche déjà l'image via NEW_IMAGE)
 */
export function isImageRelatedMessage(content: string): boolean {
  return (
    content.startsWith("[IMAGE]") ||
    content.includes("api/images/") ||
    /^[\w-]{10,30}$/.test(content.trim())
  );
}

/**
 * Extrait le pseudo de l'auteur depuis le payload du serveur
 * Stratégies dans l'ordre:
 * 1. Pour les images: extraire du contenu "pour le user {pseudo}"
 * 2. Utiliser payload.pseudo si disponible et pas "SERVER"
 * 3. Chercher par userId dans la liste des users
 * 4. Chercher par socketId dans la liste des users
 */
export function extractAuthorPseudo(
  payload: any,
  isImage: boolean,
  contentStr: string,
  users: Record<string, string>
): string {
  // 1. Pour les images, extraire le pseudo du contenu
  if (isImage && contentStr.includes("pour le user ")) {
    const match = contentStr.match(/pour le user ([^.]+)/);
    if (match?.[1]) return match[1].trim();
  }

  // 2. Utiliser le pseudo du payload s'il existe et n'est pas "SERVER"
  if (payload.pseudo && payload.pseudo !== "SERVER" && payload.pseudo.trim() !== "") {
    return payload.pseudo;
  }

  // 3. Chercher dans la liste des users par userId
  if (payload.userId && users[payload.userId]) {
    return users[payload.userId];
  }

  // 4. Chercher par socketId
  if (payload.socketId && users[payload.socketId]) {
    return users[payload.socketId];
  }

  return "Anonyme";
}

/**
 * Récupère une image depuis l'API locale
 */
export async function fetchImageFromApi(imageId: string): Promise<string | undefined> {
  try {
    const response = await fetch(`/api/image/${imageId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data_image) {
        return data.data_image;
      }
    }
  } catch (e) {
    console.error("Erreur chargement image:", e);
  }
  return undefined;
}

/**
 * Trouve un message dupliqué dans la liste (pour éviter les doublons avec optimistic UI)
 */
export function findDuplicateMessage(
  messages: Message[],
  newMessage: Message,
  isImage: boolean,
  photoDataUrl?: string
): Message | undefined {
  return messages.find(
    (m) =>
      Math.abs(m.ts - newMessage.ts) < 5000 &&
      (isImage ? m.photoDataUrl === photoDataUrl : m.text === newMessage.text)
  );
}
