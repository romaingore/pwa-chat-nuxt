import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ReceptionHeader from "~/components/reception/ReceptionHeader.vue";

// Stub pour BatteryBadge
const BatteryBadgeStub = {
    template: '<div data-testid="battery-badge">Battery</div>',
};

describe("ReceptionHeader", () => {
    const mountOptions = {
        global: {
            stubs: {
                CommonBatteryBadge: BatteryBadgeStub,
            },
        },
    };

    describe("rendu", () => {
        it("affiche le header", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            expect(wrapper.find("header").exists()).toBe(true);
        });

        it("affiche le label 'Salon de discussion'", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            expect(wrapper.text()).toContain("Salon de discussion");
        });

        it("affiche le titre principal", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            expect(wrapper.find("h1").text()).toBe("Préparez votre arrivée");
        });

        it("affiche la description", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            expect(wrapper.text()).toContain("Personnalisez votre profil");
            expect(wrapper.text()).toContain("choisissez un salon");
        });

        it("affiche le composant BatteryBadge", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            expect(wrapper.find('[data-testid="battery-badge"]').exists()).toBe(true);
        });
    });

    describe("styles", () => {
        it("le label a la classe emerald", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            const label = wrapper.find("p.text-emerald-400");
            expect(label.exists()).toBe(true);
        });

        it("le label est en majuscules avec tracking", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            const label = wrapper.find("p.uppercase");
            expect(label.exists()).toBe(true);
            expect(label.classes()).toContain("tracking-[0.3em]");
        });

        it("le titre a la bonne taille", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            const title = wrapper.find("h1");
            expect(title.classes()).toContain("text-3xl");
            expect(title.classes()).toContain("font-semibold");
        });

        it("la description a la couleur slate-400", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            const description = wrapper.find("p.text-slate-400");
            expect(description.exists()).toBe(true);
        });

        it("le header a un espacement vertical", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            const header = wrapper.find("header");
            expect(header.classes()).toContain("space-y-2");
        });

        it("le contenu est centré sur mobile", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            const header = wrapper.find("header");
            expect(header.classes()).toContain("text-center");
        });

        it("le contenu est aligné à gauche sur desktop", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            const header = wrapper.find("header");
            expect(header.classes()).toContain("lg:text-left");
        });
    });

    describe("structure", () => {
        it("a un conteneur flex pour le label et BatteryBadge", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            const flexContainer = wrapper.find(".flex.items-center.justify-between");
            expect(flexContainer.exists()).toBe(true);
        });

        it("contient 3 éléments de texte", () => {
            const wrapper = mount(ReceptionHeader, mountOptions);

            // 2 paragraphes + 1 h1
            const paragraphs = wrapper.findAll("p");
            expect(paragraphs.length).toBe(2);
            expect(wrapper.find("h1").exists()).toBe(true);
        });
    });
});
