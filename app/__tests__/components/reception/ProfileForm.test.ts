import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ProfileForm from "~/components/reception/ProfileForm.vue";

describe("ProfileForm", () => {
  const defaultProps = {
    modelValue: "",
    notificationsEnabled: false,
    notificationStatus: "default",
  };

  describe("rendu", () => {
    it("affiche le formulaire avec le titre", () => {
      const wrapper = mount(ProfileForm, { props: defaultProps });

      expect(wrapper.find("h2").text()).toBe("Mon profil");
    });

    it("affiche le champ de saisie du pseudo", () => {
      const wrapper = mount(ProfileForm, { props: defaultProps });

      const input = wrapper.find('input[placeholder*="pseudo"]');
      expect(input.exists()).toBe(true);
    });

    it("affiche la valeur du pseudo passée en prop", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, modelValue: "TestUser" },
      });

      const input = wrapper.find("input");
      expect(input.element.value).toBe("TestUser");
    });
  });

  describe("validation du pseudo", () => {
    it("affiche un avertissement si le pseudo est vide", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, modelValue: "" },
      });

      expect(wrapper.text()).toContain("Entrez un pseudo pour rejoindre");
    });

    it("affiche une erreur si le pseudo a moins de 2 caractères", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, modelValue: "A" },
      });

      expect(wrapper.text()).toContain("au moins 2 caractères");
    });

    it("n'affiche pas d'erreur si le pseudo est vide (pas encore saisi)", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, modelValue: "" },
      });

      expect(wrapper.text()).not.toContain("au moins 2 caractères");
    });

    it("affiche le message de succès si le pseudo est valide", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, modelValue: "Bob" },
      });

      expect(wrapper.text()).toContain("Profil prêt");
    });

    it("applique les classes d'erreur sur l'input si pseudo invalide", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, modelValue: "A" },
      });

      const input = wrapper.find("input");
      expect(input.classes()).toContain("border-red-500");
    });

    it("applique les classes normales sur l'input si pseudo valide", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, modelValue: "Bob" },
      });

      const input = wrapper.find("input");
      expect(input.classes()).toContain("border-slate-800");
    });
  });

  describe("événements", () => {
    it("émet update:modelValue quand on tape dans l'input", async () => {
      const wrapper = mount(ProfileForm, { props: defaultProps });

      const input = wrapper.find("input");
      await input.setValue("Test");

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual(["Test"]);
    });

    it("émet save quand on tape dans l'input", async () => {
      const wrapper = mount(ProfileForm, { props: defaultProps });

      const input = wrapper.find("input");
      await input.trigger("input");

      expect(wrapper.emitted("save")).toBeTruthy();
    });

    it("émet save quand on soumet le formulaire", async () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, modelValue: "Test" },
      });

      await wrapper.find("form").trigger("submit");

      expect(wrapper.emitted("save")).toBeTruthy();
    });
  });

  describe("notifications", () => {
    it("affiche l'icône de notifications désactivées par défaut", () => {
      const wrapper = mount(ProfileForm, { props: defaultProps });

      expect(wrapper.text()).toContain("🔕");
      expect(wrapper.text()).toContain("Notifications désactivées");
    });

    it("affiche l'icône de notifications activées", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, notificationsEnabled: true },
      });

      expect(wrapper.text()).toContain("🔔");
      expect(wrapper.text()).toContain("Notifications activées");
    });

    it("affiche le bouton Activer si notifications non activées", () => {
      const wrapper = mount(ProfileForm, { props: defaultProps });

      const buttons = wrapper.findAll("button");
      const activerButton = buttons.find((b) => b.text() === "Activer");
      expect(activerButton).toBeTruthy();
    });

    it("affiche le bouton Tester si notifications activées", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, notificationsEnabled: true },
      });

      const buttons = wrapper.findAll("button");
      const testerButton = buttons.find((b) => b.text() === "Tester");
      expect(testerButton).toBeTruthy();
    });

    it("émet toggleNotifications au clic sur Activer", async () => {
      const wrapper = mount(ProfileForm, { props: defaultProps });

      const buttons = wrapper.findAll("button");
      const activerButton = buttons.find((b) => b.text() === "Activer");
      await activerButton!.trigger("click");

      expect(wrapper.emitted("toggleNotifications")).toBeTruthy();
    });

    it("émet testNotification au clic sur Tester", async () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, notificationsEnabled: true },
      });

      const buttons = wrapper.findAll("button");
      const testerButton = buttons.find((b) => b.text() === "Tester");
      await testerButton!.trigger("click");

      expect(wrapper.emitted("testNotification")).toBeTruthy();
    });

    it("affiche le message pour notifications non supportées", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, notificationStatus: "unsupported" },
      });

      expect(wrapper.text()).toContain("Non supportées par ce navigateur");
    });

    it("affiche le message pour notifications bloquées", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, notificationStatus: "denied" },
      });

      expect(wrapper.text()).toContain("Bloquées dans les paramètres");
    });

    it("cache le bouton Activer si notifications non supportées", () => {
      const wrapper = mount(ProfileForm, {
        props: { ...defaultProps, notificationStatus: "unsupported" },
      });

      const buttons = wrapper.findAll("button");
      const activerButton = buttons.find((b) => b.text() === "Activer");
      expect(activerButton).toBeFalsy();
    });
  });
});
