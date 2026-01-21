# 💬 PWA Chat Nuxt

> **Application de messagerie instantanée Progressive Web App**  
> Construite avec Nuxt 4, Vue 3, Pinia et Socket.IO

![Nuxt](https://img.shields.io/badge/Nuxt-4.1.3-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)

---

## 📋 Table des matières

1. [Présentation du projet](#-présentation-du-projet)
2. [Fonctionnalités principales](#-fonctionnalités-principales)
3. [Architecture technique](#-architecture-technique)
4. [Structure du projet](#-structure-du-projet)
5. [API Web utilisées](#-api-web-utilisées)
6. [Stores Pinia](#-stores-pinia)
7. [Composables Vue](#-composables-vue)
8. [Tests](#-tests)
9. [Configuration PWA](#-configuration-pwa)
10. [Déploiement](#-déploiement)
11. [Installation et développement](#-installation-et-développement)
12. [Commandes disponibles](#-commandes-disponibles)

---

## 🎯 Présentation du projet

**PWA Chat Nuxt** est une application de messagerie instantanée complète qui combine le meilleur du offline et du online. L'application permet aux utilisateurs de :

- 💬 **Discuter en temps réel** dans des salons de chat
- 📷 **Capturer et partager des photos** via la caméra
- 📍 **Partager leur localisation GPS**
- 🔔 **Recevoir des notifications push** native
- 📴 **Utiliser l'app en mode hors-ligne** (données persistées localement)

### Objectifs pédagogiques

Ce projet a été réalisé dans le cadre du cours de **Développement Front Avancé** et démontre la maîtrise de :

- Les **Progressive Web Apps** (PWA) avec Service Worker et cache
- La **communication temps réel** avec Socket.IO
- Les **API Web modernes** (Camera, Geolocation, Battery, Notifications, Vibration)
- L'architecture **Nuxt 4** avec App Directory
- La gestion d'état avec **Pinia**
- Le **TypeScript** strict
- Les **tests unitaires** (Vitest) et **E2E** (Playwright)
- Le **déploiement automatisé** (CI/CD avec GitHub Actions + Podman)

---

## ✨ Fonctionnalités principales

| Fonctionnalité | Description | API/Technologie |
|----------------|-------------|-----------------|
| 💬 **Chat temps réel** | Messages instantanés via WebSocket | Socket.IO |
| 📴 **Mode hors-ligne** | Persistance locale des messages et profil | localStorage + Service Worker |
| 📷 **Capture photo** | Prise de photo avec la caméra de l'appareil | MediaDevices API |
| 📍 **Géolocalisation** | Partage de position GPS dans le chat | Geolocation API |
| 🔔 **Notifications push** | Alertes natives | Notifications API |
| 🔋 **Indicateur batterie** | Affichage du niveau de batterie | Battery API |
| 📲 **Installable** | Installation sur l'écran d'accueil | PWA Manifest |

---

## 🏗️ Architecture technique

### Stack technologique

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Nuxt 4)                          │
├─────────────────────────────────────────────────────────────────┤
│  Vue 3 Composition API  │  Pinia (Stores)  │  TypeScript Strict │
├─────────────────────────────────────────────────────────────────┤
│                    Tailwind CSS (Styling)                       │
├─────────────────────────────────────────────────────────────────┤
│  Socket.IO Client  │  Service Worker  │  localStorage/Cache    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVEUR (API externe)                       │
├─────────────────────────────────────────────────────────────────┤
│              https://api.tools.gavago.fr                        │
│              Socket.IO + API REST (images + rooms)              │
└─────────────────────────────────────────────────────────────────┘
```

### Patterns architecturaux

| Pattern | Implémentation | Avantage |
|---------|---------------|----------|
| **Optimistic UI** | Messages ajoutés localement avant confirmation serveur | UX fluide |
| **Hydratation SSR** | `ensureHydrated()` pour éviter les mismatches | Compatible SSR |
| **Singleton Socket** | Une seule connexion Socket.IO partagée | Performance |
| **Composables** | Logique réutilisable (Camera, Geolocation, Battery) | DRY, testable |

---

## 📁 Structure du projet

```
pwa-chat-nuxt/
├── app/
│   ├── components/
│   │   ├── NavBar.vue              # Navigation principale
│   │   ├── chat/
│   │   │   ├── CameraModal.vue     # Modal caméra intégrée
│   │   │   ├── ChatHeader.vue      # En-tête d'un salon
│   │   │   ├── ChatInput.vue       # Zone de saisie des messages
│   │   │   ├── MessageBubble.vue   # Bulle de message individuelle
│   │   │   └── MessageList.vue     # Liste scrollable des messages
│   │   ├── common/
│   │   │   └── BatteryIndicator.vue
│   │   └── reception/
│   │       ├── ProfileForm.vue     # Formulaire pseudo + photo
│   │       ├── ReceptionHeader.vue # En-tête de la réception
│   │       └── RoomList.vue        # Liste des salons
│   │
│   ├── composables/
│   │   ├── useBattery.ts          # 🔋 Battery Status API
│   │   ├── useCamera.ts           # 📷 MediaDevices API
│   │   └── useGeolocation.ts      # 📍 Geolocation API
│   │
│   ├── pages/
│   │   ├── index.vue              # 🏠 Page d'accueil
│   │   ├── reception.vue          # 📝 Configuration profil + salons
│   │   ├── gallery.vue            # 📸 Galerie des photos partagées
│   │   └── room/
│   │       └── [id].vue           # 💬 Page de chat dynamique
│   │
│   ├── stores/
│   │   ├── useChat.ts             # Store principal (Socket.IO, messages)
│   │   └── useProfile.ts          # Store profil utilisateur
│   │
│   ├── types/
│   │   └── chat.ts                # Types TypeScript
│   │
│   ├── utils/
│   │   ├── chatHelpers.ts         # Helpers pour le parsing des messages
│   │   └── storage.ts             # Wrappers localStorage/sessionStorage
│   │
│   └── __tests__/                 # Tests unitaires Vitest
│       ├── components/            # Tests des composants
│       ├── composables/           # Tests des composables
│       ├── stores/                # Tests des stores
│       ├── utils/                 # Tests des utilitaires
│       └── setup.ts               # Configuration globale des tests
│
├── e2e/
│   └── app.spec.ts                # Tests E2E Playwright
│
├── server/
│   └── api/
│       ├── rooms.get.ts           # GET /api/rooms
│       ├── upload-image.post.ts   # POST /api/upload-image (proxy)
│       └── image/
│           └── [id].get.ts        # GET /api/image/:id (proxy)
│
├── public/
│   ├── favicon.ico
│   ├── pwa-192x192.png            # Icône PWA
│   ├── pwa-512x512.png            # Icône PWA grande
│   └── maskable-512x512.png       # Icône adaptive
│
├── nuxt.config.ts                 # Configuration Nuxt + PWA
├── vitest.config.ts               # Configuration tests unitaires
├── playwright.config.ts           # Configuration tests E2E
├── Dockerfile                     # Image Docker multi-stage
├── podman-compose.yml             # Orchestration conteneurs
└── package.json
```

---

## 🌐 API Web utilisées

### 1. 📷 MediaDevices API (Caméra)

**Fichier :** `app/composables/useCamera.ts`

```typescript
// Récupération du flux vidéo de la caméra
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "user" },  // Caméra frontale de préférence
    width: { ideal: 1280 },
    height: { ideal: 1280 },
  },
});
```

**Fonctionnalités :**
- Prévisualisation en direct via `<video>`
- Capture de frame avec Canvas
- Compression JPEG (qualité 0.7) pour réduire le payload
- Nettoyage automatique des tracks à la fermeture

### 2. 📍 Geolocation API

**Fichier :** `app/composables/useGeolocation.ts`

```typescript
navigator.geolocation.getCurrentPosition(
  (pos) => {
    position.value = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
  },
  (err) => { /* Gestion des erreurs */ },
  {
    enableHighAccuracy: true,   // GPS précis
    timeout: 10000,             // 10s max
    maximumAge: 60000,          // Cache 1 min
  }
);
```

**États gérés :**
- `PERMISSION_DENIED` : L'utilisateur a refusé
- `POSITION_UNAVAILABLE` : Position introuvable
- `TIMEOUT` : Délai dépassé

### 3. 🔔 Notifications API

**Fichier :** `app/stores/useChat.ts`

```typescript
// Demande de permission
const permission = await Notification.requestPermission();

// Affichage de la notification
new Notification(`Message de ${message.author}`, {
  body: message.text || "Nouveau message",
  icon: "/pwa-192x192.png",
  badge: "/pwa-192x192.png",
  requireInteraction: true,
});

```

### 4. 🔋 Battery Status API

**Fichier :** `app/composables/useBattery.ts`

```typescript
const battery = await navigator.getBattery();

// Écoute des changements
battery.addEventListener("levelchange", updateBatteryInfo);
battery.addEventListener("chargingchange", updateBatteryInfo);

// Données exposées
level.value = Math.round(battery.level * 100);  // 0-100%
charging.value = battery.charging;               // true/false
dischargingTime.value = battery.dischargingTime; // en secondes
```

### 5. 💾 Web Storage API

**Fichier :** `app/utils/storage.ts`

```typescript
// localStorage : partagé entre tous les onglets
export function lsWrite<T>(key: string, value: T): boolean {
  localStorage.setItem(key, JSON.stringify(value));
  return true;
}

// Données persistées :
// - "rooms" : liste des salons
// - "messages" : historique des messages
// - "profile" : pseudo
```

---

## 🗄️ Stores Pinia

### useChat (Store principal)

**Fichier :** `app/stores/useChat.ts`

| State | Type | Description |
|-------|------|-------------|
| `rooms` | `Room[]` | Liste des salons de chat |
| `messages` | `Message[]` | Tous les messages (tous salons) |
| `users` | `Record<string, string>` | Mapping socketId → pseudo |
| `isConnected` | `boolean` | État de la connexion Socket.IO |
| `currentPseudo` | `string` | Pseudo de l'utilisateur actuel |
| `notificationsEnabled` | `boolean` | Notifications actives ou non |

| Action | Description |
|--------|-------------|
| `initSocket(pseudo)` | Initialise la connexion Socket.IO |
| `joinRoom(roomId, pseudo)` | Rejoint un salon de chat |
| `sendMessage(text, roomId, image?)` | Envoie un message (texte ou image) |
| `sendLocation(lat, lng, roomId)` | Partage la position GPS |
| `showNotification(message)` | Affiche une notification native |
| `ensureHydrated()` | Charge les données depuis localStorage |

### useProfile (Profil utilisateur)

**Fichier :** `app/stores/useProfile.ts`

| State | Type | Description |
|-------|------|-------------|
| `data` | `Profile` | `{ pseudo: string, photoDataUrl?: string }` |

| Action | Description |
|--------|-------------|
| `save(profile)` | Sauvegarde le profil localement |
| `getPseudo()` | Retourne le pseudo |

---

## 🧩 Composables Vue

| Composable | API Web | Description |
|------------|---------|-------------|
| `useCamera()` | MediaDevices | Gère le flux caméra, l'aperçu et la capture |
| `useGeolocation()` | Geolocation | Récupère les coordonnées GPS |
| `useBattery()` | Battery Status | Fournit le niveau de batterie et l'état de charge |

---

## 🧪 Tests

### Tests unitaires (Vitest)

**Configuration :** `vitest.config.ts`

```bash
# Lancer les tests
npm run test

# Avec couverture de code
npm run test:coverage
```

**Couverture des tests :**

| Catégorie | Fichiers testés |
|-----------|-----------------|
| **Components** | NavBar, ChatHeader, ChatInput, MessageList, MessageBubble, CameraModal, ProfileForm, ReceptionHeader, RoomList, BatteryIndicator |
| **Composables** | useCamera, useGeolocation, useBattery |
| **Stores** | useChat, useProfile |
| **Utils** | storage, chatHelpers |

### Tests E2E (Playwright)

**Configuration :** `playwright.config.ts`

```bash
# Lancer les tests E2E
npm run e2e

# Mode interactif (avec UI)
npm run e2e:ui

# Mode headed (voir le navigateur)
npm run e2e:headed
```

**Scénarios testés :**

| Suite | Tests |
|-------|-------|
| **Page Accueil** | Affichage navbar, navigation vers réception |
| **Page Réception** | Formulaire profil, saisie pseudo, liste des salons |
| **Page Chat** | Accès via URL, interface de saisie |
| **Page Galerie** | Affichage, navigation depuis navbar |
| **Navigation** | Navbar sur toutes les pages, logo ramène à l'accueil |

---

## 📱 Configuration PWA

**Fichier :** `nuxt.config.ts`

### Manifest

```typescript
pwa: {
  manifest: {
    name: "PWA Chat",
    short_name: "Chat",
    description: "Application de messagerie instantanée",
    theme_color: "#111827",
    background_color: "#111827",
    display: "standalone",  // Full screen sans barre navigateur
    start_url: "/",
    icons: [
      { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/maskable-512x512.png", sizes: "512x512", purpose: "maskable" },
    ],
  },
}
```

### Service Worker (Workbox)

```typescript
workbox: {
  runtimeCaching: [
    // Images : Cache First (30 jours)
    {
      urlPattern: ({ request }) => request.destination === "image",
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // Pages : Network First (fallback cache)
    {
      urlPattern: ({ sameOrigin, url }) =>
        sameOrigin && (url.pathname === "/" || url.pathname.startsWith("/room")),
      handler: "NetworkFirst",
      options: { cacheName: "pages" },
    },
    // Socket.IO : Network Only (pas de cache)
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/socket.io"),
      handler: "NetworkOnly",
    },
  ],
}
```

---

## 🚀 Déploiement

### Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                         (master)                             │
└───────────────────────────┬─────────────────────────────────┘
                            │ push
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                            │
│                    (deploy.yml)                              │
└───────────────────────────┬─────────────────────────────────┘
                            │ SSH
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        VPS                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Podman Container                     │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │          Node.js 20 Alpine                  │    │    │
│  │  │          Nuxt Production Build              │    │    │
│  │  │          Port 3000                          │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Dockerfile (Multi-stage build)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
RUN addgroup --system nodejs && adduser --system nuxtjs
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
USER nuxtjs
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### CI/CD (GitHub Actions)

```yaml
name: Deploy to VPS
on:
  push:
    branches: [master]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v0.1.6
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/pwa-chat-nuxt
            git fetch --all
            git reset --hard origin/master
            podman-compose down
            podman-compose up -d --build
```

---

## 💻 Installation et développement

### Prérequis

- **Node.js** 20+ 
- **npm** 9+

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd pwa-chat-nuxt

# Installer les dépendances
npm install
```

### Développement

```bash
# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Production

```bash
# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

---

## 📜 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Construit l'application pour la production |
| `npm run preview` | Prévisualise le build de production |
| `npm run test` | Lance les tests unitaires (Vitest) |
| `npm run test:run` | Lance les tests une seule fois |
| `npm run test:coverage` | Tests avec rapport de couverture |
| `npm run e2e` | Lance les tests E2E (Playwright) |
| `npm run e2e:ui` | Tests E2E avec interface graphique |
| `npm run e2e:headed` | Tests E2E avec navigateur visible |

---

## 📚 Technologies & Dépendances

### Dépendances principales

| Package | Version | Usage |
|---------|---------|-------|
| `nuxt` | ^4.1.3 | Framework Vue full-stack |
| `vue` | ^3.5.22 | Framework frontend réactif |
| `pinia` | via @pinia/nuxt | Gestion d'état |
| `socket.io-client` | ^4.8.3 | Communication temps réel |
| `vue-router` | ^4.6.3 | Routing SPA |

### Dépendances de développement

| Package | Version | Usage |
|---------|---------|-------|
| `@nuxtjs/tailwindcss` | ^6.14.0 | Intégration Tailwind CSS |
| `@vite-pwa/nuxt` | ^1.0.7 | Support PWA (Manifest + Service Worker) |
| `vitest` | ^3.2.4 | Tests unitaires |
| `@playwright/test` | ^1.57.0 | Tests E2E |
| `@vitest/coverage-v8` | ^3.2.4 | Couverture de code |
| `happy-dom` | ^20.3.4 | Environnement DOM pour tests |
| `typescript` | (via Nuxt) | Typage statique |

---

## 🔗 URLs & Événements Socket.IO

### Serveur API

- **URL** : `https://api.tools.gavago.fr`
- **Transport** : WebSocket (fallback polling)

### Événements Socket.IO

| Événement | Direction | Payload | Description |
|-----------|-----------|---------|-------------|
| `chat-join-room` | Client → Serveur | `{ pseudo, roomName }` | Rejoindre un salon |
| `chat-msg` | Bidirectionnel | `{ content, roomName, categorie }` | Envoi/réception message |
| `chat-joined-room` | Serveur → Client | `{ clients }` | Notification d'arrivée |
| `chat-disconnected` | Serveur → Client | - | Notification de départ |

### Catégories de messages

| Catégorie | Description |
|-----------|-------------|
| `MESSAGE` | Message texte classique |
| `NEW_IMAGE` | Notification d'image uploadée |
| `INFO` | Message système (join/leave) |

---

## 👨‍💻 Auteur

**Romain Gore**  
Développement Front Avancé — 2026

---

## 📄 Licence

Ce projet est réalisé dans un cadre académique.
