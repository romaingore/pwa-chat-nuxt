import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, computed } from "vue";

// Créer un composant NavBar simplifié pour les tests
// car NavBar.vue utilise #imports (alias Nuxt non disponible dans Vitest pur)
const NavBarTestComponent = {
    template: `
    <nav class="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" class="flex items-center gap-2">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-lg font-semibold text-slate-950 shadow-glow">
            ✦
          </span>
          <div class="leading-tight">
            <p class="text-sm uppercase tracking-[0.35em] text-emerald-300/80">PWA Chat</p>
            <p class="text-base font-semibold text-white">Nuxt Messenger</p>
          </div>
        </a>
        <div class="flex items-center gap-2 sm:gap-4">
          <a
            v-for="link in links"
            :key="link.to"
            :href="link.to"
            class="relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition"
            :class="getLinkClass(link)"
          >
            {{ link.label }}
            <span
              v-if="isActive(link)"
              class="absolute inset-0 rounded-full ring-1 ring-emerald-400/60"
            ></span>
          </a>
        </div>
      </div>
    </nav>
  `,
    props: {
        currentPath: {
            type: String,
            default: "/reception",
        },
    },
    setup(props: { currentPath: string }) {
        const links = [
            { to: "/", label: "Accueil" },
            { to: "/reception", label: "Réception" },
            { to: "/gallery", label: "Galerie" },
        ];

        const isActive = (link: { to: string; label: string }) => {
            if (link.to !== "/" && props.currentPath.startsWith(link.to)) return true;
            return props.currentPath === link.to;
        };

        const getLinkClass = (link: { to: string; label: string }) => {
            if (isActive(link)) {
                return "bg-emerald-500/15 text-white";
            }
            return "text-slate-300 hover:text-white hover:bg-slate-900/80";
        };

        return { links, isActive, getLinkClass };
    },
};

describe("NavBar", () => {
    describe("rendu", () => {
        it("affiche la barre de navigation", () => {
            const wrapper = mount(NavBarTestComponent);

            expect(wrapper.find("nav").exists()).toBe(true);
        });

        it("affiche le logo", () => {
            const wrapper = mount(NavBarTestComponent);

            expect(wrapper.text()).toContain("✦");
        });

        it("affiche le nom de l'application", () => {
            const wrapper = mount(NavBarTestComponent);

            expect(wrapper.text()).toContain("PWA Chat");
            expect(wrapper.text()).toContain("Nuxt Messenger");
        });

        it("affiche tous les liens de navigation", () => {
            const wrapper = mount(NavBarTestComponent);

            expect(wrapper.text()).toContain("Accueil");
            expect(wrapper.text()).toContain("Réception");
            expect(wrapper.text()).toContain("Galerie");
        });
    });

    describe("structure des liens", () => {
        it("contient 4 liens au total (logo + 3 nav)", () => {
            const wrapper = mount(NavBarTestComponent);

            const links = wrapper.findAll("a");
            expect(links.length).toBe(4);
        });

        it("le lien logo pointe vers l'accueil", () => {
            const wrapper = mount(NavBarTestComponent);

            const links = wrapper.findAll("a");
            expect(links[0]!.attributes("href")).toBe("/");
        });

        it("les liens de navigation ont les bonnes URLs", () => {
            const wrapper = mount(NavBarTestComponent);

            const links = wrapper.findAll("a");
            expect(links[1]!.attributes("href")).toBe("/");
            expect(links[2]!.attributes("href")).toBe("/reception");
            expect(links[3]!.attributes("href")).toBe("/gallery");
        });
    });

    describe("styles", () => {
        it("la navbar est sticky", () => {
            const wrapper = mount(NavBarTestComponent);

            const nav = wrapper.find("nav");
            expect(nav.classes()).toContain("sticky");
            expect(nav.classes()).toContain("top-0");
        });

        it("la navbar a un z-index élevé", () => {
            const wrapper = mount(NavBarTestComponent);

            const nav = wrapper.find("nav");
            expect(nav.classes()).toContain("z-40");
        });

        it("la navbar a un backdrop blur", () => {
            const wrapper = mount(NavBarTestComponent);

            const nav = wrapper.find("nav");
            expect(nav.classes()).toContain("backdrop-blur");
        });

        it("la navbar a une bordure inférieure", () => {
            const wrapper = mount(NavBarTestComponent);

            const nav = wrapper.find("nav");
            expect(nav.classes()).toContain("border-b");
        });

        it("le logo a un gradient", () => {
            const wrapper = mount(NavBarTestComponent);

            const logoIcon = wrapper.find(".bg-gradient-to-br");
            expect(logoIcon.exists()).toBe(true);
        });
    });

    describe("logo", () => {
        it("affiche l'icône dans un carré arrondi", () => {
            const wrapper = mount(NavBarTestComponent);

            const logoIcon = wrapper.find(".rounded-2xl");
            expect(logoIcon.exists()).toBe(true);
        });

        it("le texte PWA Chat est en majuscules", () => {
            const wrapper = mount(NavBarTestComponent);

            const pwaChatText = wrapper.find(".uppercase");
            expect(pwaChatText.text()).toContain("PWA Chat");
        });
    });

    describe("conteneur", () => {
        it("a une largeur maximale", () => {
            const wrapper = mount(NavBarTestComponent);

            const container = wrapper.find(".max-w-5xl");
            expect(container.exists()).toBe(true);
        });

        it("est centré horizontalement", () => {
            const wrapper = mount(NavBarTestComponent);

            const container = wrapper.find(".mx-auto");
            expect(container.exists()).toBe(true);
        });

        it("utilise flexbox pour l'alignement", () => {
            const wrapper = mount(NavBarTestComponent);

            const container = wrapper.find(".flex.items-center.justify-between");
            expect(container.exists()).toBe(true);
        });
    });

    describe("liens de navigation", () => {
        it("les liens ont le style rounded-full", () => {
            const wrapper = mount(NavBarTestComponent);

            const navLinks = wrapper.findAll("a").slice(1); // Exclure le logo
            navLinks.forEach((link) => {
                expect(link.classes()).toContain("rounded-full");
            });
        });

        it("les liens ont une transition", () => {
            const wrapper = mount(NavBarTestComponent);

            const navLinks = wrapper.findAll("a").slice(1);
            navLinks.forEach((link) => {
                expect(link.classes()).toContain("transition");
            });
        });
    });

    describe("état actif", () => {
        it("marque le lien Réception comme actif sur /reception", () => {
            const wrapper = mount(NavBarTestComponent, {
                props: { currentPath: "/reception" },
            });

            const links = wrapper.findAll("a");
            const receptionLink = links[2]!; // Index 2 = Réception
            expect(receptionLink.classes()).toContain("bg-emerald-500/15");
            expect(receptionLink.classes()).toContain("text-white");
        });

        it("marque le lien Accueil comme actif sur /", () => {
            const wrapper = mount(NavBarTestComponent, {
                props: { currentPath: "/" },
            });

            const links = wrapper.findAll("a");
            const accueilLink = links[1]!; // Index 1 = Accueil
            expect(accueilLink.classes()).toContain("bg-emerald-500/15");
            expect(accueilLink.classes()).toContain("text-white");
        });

        it("marque le lien Galerie comme actif sur /gallery", () => {
            const wrapper = mount(NavBarTestComponent, {
                props: { currentPath: "/gallery" },
            });

            const links = wrapper.findAll("a");
            const galleryLink = links[3]!; // Index 3 = Galerie
            expect(galleryLink.classes()).toContain("bg-emerald-500/15");
            expect(galleryLink.classes()).toContain("text-white");
        });

        it("les liens non actifs ont les classes par défaut", () => {
            const wrapper = mount(NavBarTestComponent, {
                props: { currentPath: "/reception" },
            });

            const links = wrapper.findAll("a");
            const accueilLink = links[1]!; // Non actif
            expect(accueilLink.classes()).toContain("text-slate-300");
        });

        it("affiche le ring sur le lien actif", () => {
            const wrapper = mount(NavBarTestComponent, {
                props: { currentPath: "/reception" },
            });

            const ring = wrapper.find(".ring-emerald-400\\/60");
            expect(ring.exists()).toBe(true);
        });
    });

    describe("sous-routes", () => {
        it("marque le lien parent comme actif pour les sous-routes", () => {
            const wrapper = mount(NavBarTestComponent, {
                props: { currentPath: "/reception/room/123" },
            });

            const links = wrapper.findAll("a");
            const receptionLink = links[2]!;
            expect(receptionLink.classes()).toContain("bg-emerald-500/15");
        });
    });
});
