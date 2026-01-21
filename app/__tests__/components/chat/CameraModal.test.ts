import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import CameraModal from "~/components/chat/CameraModal.vue";

// Mock du composable useCamera
const mockCapture = vi.fn();
const mockStartPreview = vi.fn();
const mockStopPreview = vi.fn();
const mockVideoEl = { value: null };

vi.mock("~/composables/useCamera", () => ({
    useCamera: () => ({
        videoEl: mockVideoEl,
        startPreview: mockStartPreview,
        stopPreview: mockStopPreview,
        capture: mockCapture,
        isPreviewing: { value: false },
    }),
}));

describe("CameraModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCapture.mockResolvedValue("data:image/jpeg;base64,captured123");
    });

    describe("rendu", () => {
        it("affiche le conteneur principal", () => {
            const wrapper = mount(CameraModal);

            expect(wrapper.find(".relative").exists()).toBe(true);
        });

        it("affiche l'élément video", () => {
            const wrapper = mount(CameraModal);

            const video = wrapper.find("video");
            expect(video.exists()).toBe(true);
        });

        it("l'élément video a les attributs corrects", () => {
            const wrapper = mount(CameraModal);

            const video = wrapper.find("video");
            expect(video.attributes("autoplay")).toBeDefined();
            expect(video.attributes("playsinline")).toBeDefined();
            expect(video.attributes("muted")).toBeDefined();
        });

        it("affiche le bouton Annuler", () => {
            const wrapper = mount(CameraModal);

            const buttons = wrapper.findAll("button");
            const cancelButton = buttons.find((b) => b.text() === "Annuler");
            expect(cancelButton).toBeTruthy();
        });

        it("affiche le bouton Capturer", () => {
            const wrapper = mount(CameraModal);

            const buttons = wrapper.findAll("button");
            const captureButton = buttons.find((b) => b.text() === "Capturer");
            expect(captureButton).toBeTruthy();
        });
    });

    describe("styles", () => {
        it("le bouton Annuler a les styles corrects", () => {
            const wrapper = mount(CameraModal);

            const buttons = wrapper.findAll("button");
            const cancelButton = buttons.find((b) => b.text() === "Annuler");
            expect(cancelButton!.classes()).toContain("bg-slate-800");
        });

        it("le bouton Capturer a les styles corrects", () => {
            const wrapper = mount(CameraModal);

            const buttons = wrapper.findAll("button");
            const captureButton = buttons.find((b) => b.text() === "Capturer");
            expect(captureButton!.classes()).toContain("bg-emerald-500");
        });

        it("le modal a les styles de positionnement", () => {
            const wrapper = mount(CameraModal);

            const modal = wrapper.find(".absolute");
            expect(modal.classes()).toContain("bottom-20");
            expect(modal.classes()).toContain("z-20");
        });
    });

    describe("lifecycle", () => {
        it("appelle startPreview au montage", () => {
            mount(CameraModal);

            expect(mockStartPreview).toHaveBeenCalled();
        });
    });

    describe("événements", () => {
        it("émet close au clic sur Annuler", async () => {
            const wrapper = mount(CameraModal);

            const buttons = wrapper.findAll("button");
            const cancelButton = buttons.find((b) => b.text() === "Annuler");
            await cancelButton!.trigger("click");

            expect(wrapper.emitted("close")).toBeTruthy();
        });

        it("appelle capture au clic sur Capturer", async () => {
            const wrapper = mount(CameraModal);

            const buttons = wrapper.findAll("button");
            const captureButton = buttons.find((b) => b.text() === "Capturer");
            await captureButton!.trigger("click");

            expect(mockCapture).toHaveBeenCalled();
        });

        it("émet capture avec la photo après capture réussie", async () => {
            mockCapture.mockResolvedValue("data:image/jpeg;base64,test123");

            const wrapper = mount(CameraModal);

            const buttons = wrapper.findAll("button");
            const captureButton = buttons.find((b) => b.text() === "Capturer");
            await captureButton!.trigger("click");

            // Attendre que la promesse soit résolue
            await vi.waitFor(() => {
                expect(wrapper.emitted("capture")).toBeTruthy();
            });
            expect(wrapper.emitted("capture")![0]).toEqual([
                "data:image/jpeg;base64,test123",
            ]);
        });

        it("n'émet pas capture si le résultat est null", async () => {
            mockCapture.mockResolvedValue(null);

            const wrapper = mount(CameraModal);

            const buttons = wrapper.findAll("button");
            const captureButton = buttons.find((b) => b.text() === "Capturer");
            await captureButton!.trigger("click");

            // Attendre un peu pour s'assurer que l'événement n'est pas émis
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(wrapper.emitted("capture")).toBeFalsy();
        });
    });

    describe("structure du modal", () => {
        it("contient un conteneur pour la vidéo avec background noir", () => {
            const wrapper = mount(CameraModal);

            const videoContainer = wrapper.find(".bg-black");
            expect(videoContainer.exists()).toBe(true);
        });

        it("la vidéo a le format carré (aspect-square)", () => {
            const wrapper = mount(CameraModal);

            const video = wrapper.find("video");
            expect(video.classes()).toContain("aspect-square");
        });

        it("les boutons sont dans un conteneur flex", () => {
            const wrapper = mount(CameraModal);

            const buttonContainer = wrapper.find(".flex.justify-between");
            expect(buttonContainer.exists()).toBe(true);
        });
    });
});
