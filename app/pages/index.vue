<template>
  <section
    class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
  >
    <div
      class="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
    ></div>
    <div
      class="absolute -right-24 top-40 h-80 w-80 rounded-full bg-teal-400/10 blur-[120px]"
    ></div>

    <div
      class="relative mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16 sm:py-24"
    >
      <div class="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div class="space-y-6">
          <p class="text-sm uppercase tracking-[0.4em] text-emerald-300/80">
            Expérience temps réel
          </p>
          <h1 class="text-3xl font-semibold leading-tight sm:text-5xl">
            Discutez, capturez et retrouvez vos messages où que vous soyez.
          </h1>
          <p class="max-w-xl text-base text-slate-300 sm:text-lg">
            PWA Chat combine le meilleur du offline et du online. Personnalisez
            votre profil, échangez en direct grâce à Socket.IO et conservez vos
            souvenirs dans une galerie accessible même sans réseau.
          </p>

          <div class="flex flex-wrap gap-3">
            <NuxtLink
              to="/reception"
              class="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              🚀 Rejoindre la réception
            </NuxtLink>
            <NuxtLink
              to="/gallery"
              class="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-white"
            >
              📸 Voir la galerie
            </NuxtLink>
          </div>
        </div>

        <div
          class="relative rounded-3xl border border-slate-800/60 bg-slate-950/40 p-6 shadow-xl shadow-slate-950/40 backdrop-blur"
        >
          <div
            class="absolute -top-10 right-10 h-20 w-20 rounded-full bg-emerald-500/20 blur-2xl"
          ></div>
          <div class="space-y-5">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase tracking-[0.3em] text-slate-400"
                >Statut</span
              >
              <span
                class="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300"
              >
                <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                Connecté
              </span>
            </div>
            <div class="space-y-4">
              <div
                class="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4"
              >
                <p class="text-sm text-slate-400">Profil</p>
                <p class="mt-1 text-lg font-semibold text-white">
                  Synchro offline/online
                </p>
              </div>
              <div
                class="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4"
              >
                <p class="text-sm text-slate-400">Chat</p>
                <p class="mt-1 text-lg font-semibold text-white">
                  Socket.IO temps réel
                </p>
              </div>
              <div
                class="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4"
              >
                <p class="text-sm text-slate-400">Galerie</p>
                <p class="mt-1 text-lg font-semibold text-white">
                  Snapshots hors-ligne
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="space-y-10">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 class="text-2xl font-semibold text-white">
            Ce qui rend PWA Chat unique
          </h2>
          <p class="text-sm text-slate-400">
            Pensé pour les connexions instables, optimisé pour les conversations
            instantanées.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <article
            class="h-full rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 shadow-lg shadow-slate-950/30"
          >
            <div
              class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl"
            >
              🔌
            </div>
            <h3 class="text-lg font-semibold text-white">
              Mode hors-ligne fiable
            </h3>
            <p class="mt-2 text-sm text-slate-400">
              Conservez votre profil, l’historique de vos salons et vos clichés
              sans dépendre du réseau.
            </p>
          </article>

          <article
            class="h-full rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 shadow-lg shadow-slate-950/30"
          >
            <div
              class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl"
            >
              ⚡️
            </div>
            <h3 class="text-lg font-semibold text-white">Temps réel fluide</h3>
            <p class="mt-2 text-sm text-slate-400">
              Socket.IO assure des messages instantanés, avec synchronisation
              automatique au retour du réseau.
            </p>
          </article>

          <article
            class="h-full rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 shadow-lg shadow-slate-950/30"
          >
            <div
              class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl"
            >
              🛠️
            </div>
            <h3 class="text-lg font-semibold text-white">Stack moderne</h3>
            <p class="mt-2 text-sm text-slate-400">
              Nuxt 4, Pinia, TypeScript et @vite-pwa : une base robuste pour
              l’évolution du projet.
            </p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>
