import { defineStore } from "pinia";
import { lsRead, lsWrite } from "~/utils/storage";
import type { Profile } from "~/types/chat";

export const useProfile = defineStore("profile", {
  state: () => ({
    data: lsRead<Profile>("profile", { pseudo: "" }),
  }),
  actions: {
    save(profile: Profile) {
      this.data = profile;
      lsWrite("profile", this.data);
    },
  },
});
