import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChatInput from "~/components/chat/ChatInput.vue";

describe("ChatInput", () => {
  const defaultProps = {
    isLoadingGeo: false,
  };

  describe("rendu", () => {
    it("affiche le champ de saisie", () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const input = wrapper.find('input[type="text"]');
      expect(input.exists()).toBe(true);
      expect(input.attributes("placeholder")).toContain("Écrivez votre message");
    });

    it("affiche le bouton caméra", () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const buttons = wrapper.findAll('button[type="button"]');
      const cameraButton = buttons.find((b) => b.text().includes("📸"));
      expect(cameraButton).toBeTruthy();
    });

    it("affiche le bouton localisation", () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const buttons = wrapper.findAll('button[type="button"]');
      const locationButton = buttons.find((b) => b.text().includes("📍"));
      expect(locationButton).toBeTruthy();
    });

    it("affiche le bouton envoyer", () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists()).toBe(true);
      expect(submitButton.text()).toBe("Envoyer");
    });
  });

  describe("saisie de message", () => {
    it("permet de taper un message", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const input = wrapper.find("input");
      await input.setValue("Mon message");

      expect(input.element.value).toBe("Mon message");
    });
  });

  describe("envoi de message", () => {
    it("émet send avec le texte au submit", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const input = wrapper.find("input");
      await input.setValue("Hello World");
      await wrapper.find("form").trigger("submit");

      expect(wrapper.emitted("send")).toBeTruthy();
      expect(wrapper.emitted("send")![0]).toEqual(["Hello World"]);
    });

    it("vide le champ après envoi", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const input = wrapper.find("input");
      await input.setValue("Hello");
      await wrapper.find("form").trigger("submit");

      expect(input.element.value).toBe("");
    });

    it("n'émet pas send si le message est vide", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      await wrapper.find("form").trigger("submit");

      expect(wrapper.emitted("send")).toBeFalsy();
    });

    it("n'émet pas send si le message ne contient que des espaces", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const input = wrapper.find("input");
      await input.setValue("   ");
      await wrapper.find("form").trigger("submit");

      expect(wrapper.emitted("send")).toBeFalsy();
    });

    it("trim le message avant envoi", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const input = wrapper.find("input");
      await input.setValue("  Hello World  ");
      await wrapper.find("form").trigger("submit");

      expect(wrapper.emitted("send")![0]).toEqual(["Hello World"]);
    });
  });

  describe("bouton envoyer", () => {
    it("est désactivé si le message est vide", () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.attributes("disabled")).toBeDefined();
    });

    it("est activé si le message n'est pas vide", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const input = wrapper.find("input");
      await input.setValue("Test");

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.attributes("disabled")).toBeUndefined();
    });

    it("est désactivé si le message ne contient que des espaces", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const input = wrapper.find("input");
      await input.setValue("   ");

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.attributes("disabled")).toBeDefined();
    });
  });

  describe("bouton caméra", () => {
    it("émet toggleCamera au clic", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const buttons = wrapper.findAll('button[type="button"]');
      const cameraButton = buttons.find((b) => b.text().includes("📸"));
      await cameraButton!.trigger("click");

      expect(wrapper.emitted("toggleCamera")).toBeTruthy();
    });

    it("a le bon title", () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const buttons = wrapper.findAll('button[type="button"]');
      const cameraButton = buttons.find((b) => b.text().includes("📸"));
      expect(cameraButton!.attributes("title")).toBe("Prendre une photo");
    });
  });

  describe("bouton localisation", () => {
    it("émet shareLocation au clic", async () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const buttons = wrapper.findAll('button[type="button"]');
      const locationButton = buttons.find(
        (b) => b.text().includes("📍") || b.text().includes("⏳")
      );
      await locationButton!.trigger("click");

      expect(wrapper.emitted("shareLocation")).toBeTruthy();
    });

    it("a le bon title", () => {
      const wrapper = mount(ChatInput, { props: defaultProps });

      const buttons = wrapper.findAll('button[type="button"]');
      const locationButton = buttons.find((b) => b.text().includes("📍"));
      expect(locationButton!.attributes("title")).toBe("Partager ma position");
    });

    it("affiche l'icône sablier pendant le chargement", () => {
      const wrapper = mount(ChatInput, {
        props: { isLoadingGeo: true },
      });

      const buttons = wrapper.findAll('button[type="button"]');
      const locationButton = buttons.find((b) => b.text().includes("⏳"));
      expect(locationButton).toBeTruthy();
    });

    it("est désactivé pendant le chargement", () => {
      const wrapper = mount(ChatInput, {
        props: { isLoadingGeo: true },
      });

      const buttons = wrapper.findAll('button[type="button"]');
      const locationButton = buttons.find((b) => b.text().includes("⏳"));
      expect(locationButton!.attributes("disabled")).toBeDefined();
    });

    it("n'est pas désactivé quand pas en chargement", () => {
      const wrapper = mount(ChatInput, {
        props: { isLoadingGeo: false },
      });

      const buttons = wrapper.findAll('button[type="button"]');
      const locationButton = buttons.find((b) => b.text().includes("📍"));
      expect(locationButton!.attributes("disabled")).toBeUndefined();
    });
  });
});
