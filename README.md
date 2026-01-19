# PWA Chat Nuxt

Application de messagerie instantanée Progressive Web App (PWA) construite avec Nuxt 4, Vue 3 et Socket.IO.

## Fonctionnalites

- **Chat en temps reel** : Communication instantanee via Socket.IO
- **Mode hors ligne** : Les messages et photos sont conserves localement (localStorage)
- **Camera integree** : Capture et envoi de photos directement depuis l'application
- **Notifications push** : Alertes pour les nouveaux messages avec vibration
- **PWA installable** : Fonctionne comme une application native sur mobile et desktop

## Structure du projet

```
app/
├── components/
│   └── NavBar.vue          # Barre de navigation
├── composables/
│   └── useCamera.ts        # Gestion de la camera
├── pages/
│   ├── index.vue           # Page d'accueil
│   ├── reception.vue       # Configuration du profil + selection des salons
│   ├── gallery.vue         # Galerie des photos partagees
│   └── room/[id].vue       # Salon de discussion
├── stores/
│   ├── useChat.ts          # Store Pinia : messages, rooms, Socket.IO
│   └── useProfile.ts       # Store Pinia : profil utilisateur
├── types/
│   └── chat.ts             # Types TypeScript
└── utils/
    └── storage.ts          # Utilitaires localStorage
```

## Installation

```bash
npm install
```

## Developpement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Production

```bash
npm run build
npm run preview
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil avec presentation des fonctionnalites |
| `/reception` | Configuration du pseudo et photo de profil, selection du salon |
| `/room/:id` | Salon de chat (general ou random) |
| `/gallery` | Galerie des photos partagees avec filtrage |

## Technologies

- **Nuxt 4** - Framework Vue.js
- **Vue 3** - Framework JavaScript
- **Pinia** - Gestion d'etat
- **Socket.IO** - Communication temps reel
- **Tailwind CSS** - Styles
- **Vite PWA** - Support PWA et Service Worker

## Architecture

### Stores

**useChat** : Gere la connexion Socket.IO, les messages et les salons
- `initSocket(pseudo)` : Connexion au serveur
- `joinRoom(roomId, pseudo)` : Rejoindre un salon
- `sendMessage(text, roomId, image?)` : Envoyer un message
- `byRoom(roomId)` : Recuperer les messages d'un salon
- `requestNotificationPermission()` : Demander la permission pour les notifications
- `checkNotificationStatus()` : Verifier l'etat des permissions
- `showNotification(message)` : Afficher une notification

**useProfile** : Gere le profil utilisateur
- `save(profile)` : Sauvegarder pseudo et photo
- `getPseudo()` : Recuperer le pseudo

### Composables

**useCamera** : Gestion de la camera
- `startPreview()` : Demarrer l'apercu video
- `capture()` : Capturer une photo
- `stopPreview()` : Arreter l'apercu

## Serveur

L'application se connecte au serveur Socket.IO : `https://api.tools.gavago.fr`

### Evenements Socket.IO

| Evenement | Direction | Description |
|-----------|-----------|-------------|
| `chat-join-room` | Client -> Serveur | Rejoindre un salon |
| `chat-msg` | Bidirectionnel | Envoi/reception de message |
| `chat-joined-room` | Serveur -> Client | Notification d'arrivee |
| `chat-disconnected` | Serveur -> Client | Notification de depart |

## Notifications

L'application supporte les notifications push natives :

- **Activation** : Depuis la page Reception, cliquez sur "Activer" dans la section Notifications
- **Declenchement** : Une notification est envoyee quand un autre utilisateur envoie un message
- **Vibration** : L'appareil vibre (si supporte) lors de la reception d'un message
- **Etats possibles** :
  - `granted` : Notifications activees
  - `denied` : Bloquees par l'utilisateur (modifiable dans les parametres du navigateur)
  - `default` : Pas encore demande
  - `unsupported` : Navigateur non compatible

## PWA

L'application est configuree comme PWA avec :
- Manifest pour l'installation
- Service Worker avec cache (images, pages)
- Icones 192x192, 512x512 et maskable
- Mode standalone
