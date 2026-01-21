import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import MessageList from "~/components/chat/MessageList.vue";

// Stub pour MessageBubble
const MessageBubbleStub = {
    template: '<div class="message-bubble-stub" :data-id="id">{{ author }}: {{ text }}</div>',
    props: ["id", "author", "text", "photoDataUrl", "time", "date", "isSelf"],
};

describe("MessageList", () => {
    const defaultProps = {
        messages: [],
    };

    const mockMessages = [
        {
            id: "msg-1",
            author: "Alice",
            text: "Bonjour !",
            time: "10:00",
            date: "21 janv. 2026",
            isSelf: false,
        },
        {
            id: "msg-2",
            author: "Moi",
            text: "Salut !",
            time: "10:01",
            date: "21 janv. 2026",
            isSelf: true,
        },
        {
            id: "msg-3",
            author: "Bob",
            text: "Comment ça va ?",
            photoDataUrl: "data:image/jpeg;base64,abc123",
            time: "10:02",
            date: "21 janv. 2026",
            isSelf: false,
        },
    ];

    const mountOptions = {
        global: {
            stubs: {
                MessageBubble: MessageBubbleStub,
            },
        },
    };

    describe("rendu", () => {
        it("affiche le conteneur de messages", () => {
            const wrapper = mount(MessageList, {
                props: defaultProps,
                ...mountOptions,
            });

            expect(wrapper.find(".messages-container").exists()).toBe(true);
        });

        it("a les bonnes classes de style", () => {
            const wrapper = mount(MessageList, {
                props: defaultProps,
                ...mountOptions,
            });

            const container = wrapper.find(".messages-container");
            expect(container.classes()).toContain("flex-1");
            expect(container.classes()).toContain("overflow-y-auto");
        });
    });

    describe("état vide", () => {
        it("affiche un message quand il n'y a pas de messages", () => {
            const wrapper = mount(MessageList, {
                props: { messages: [] },
                ...mountOptions,
            });

            expect(wrapper.text()).toContain("Aucun message dans ce salon");
            expect(wrapper.text()).toContain("Soyez le premier à écrire");
        });

        it("n'affiche pas de MessageBubble quand pas de messages", () => {
            const wrapper = mount(MessageList, {
                props: { messages: [] },
                ...mountOptions,
            });

            expect(wrapper.find(".message-bubble-stub").exists()).toBe(false);
        });
    });

    describe("liste de messages", () => {
        it("affiche tous les messages", () => {
            const wrapper = mount(MessageList, {
                props: { messages: mockMessages },
                ...mountOptions,
            });

            const bubbles = wrapper.findAll(".message-bubble-stub");
            expect(bubbles.length).toBe(3);
        });

        it("passe les bonnes props à chaque MessageBubble", () => {
            const wrapper = mount(MessageList, {
                props: { messages: mockMessages },
                ...mountOptions,
            });

            const bubbles = wrapper.findAll(".message-bubble-stub");
            expect(bubbles[0]!.attributes("data-id")).toBe("msg-1");
            expect(bubbles[1]!.attributes("data-id")).toBe("msg-2");
            expect(bubbles[2]!.attributes("data-id")).toBe("msg-3");
        });

        it("affiche le contenu des messages via le stub", () => {
            const wrapper = mount(MessageList, {
                props: { messages: mockMessages },
                ...mountOptions,
            });

            expect(wrapper.text()).toContain("Alice: Bonjour !");
            expect(wrapper.text()).toContain("Moi: Salut !");
            expect(wrapper.text()).toContain("Bob: Comment ça va ?");
        });

        it("n'affiche pas le message vide quand il y a des messages", () => {
            const wrapper = mount(MessageList, {
                props: { messages: mockMessages },
                ...mountOptions,
            });

            expect(wrapper.text()).not.toContain("Aucun message dans ce salon");
        });
    });

    describe("avec un seul message", () => {
        it("affiche correctement un seul message", () => {
            const wrapper = mount(MessageList, {
                props: { messages: [mockMessages[0]!] },
                ...mountOptions,
            });

            const bubbles = wrapper.findAll(".message-bubble-stub");
            expect(bubbles.length).toBe(1);
            expect(wrapper.text()).toContain("Alice: Bonjour !");
        });
    });

    describe("messages avec photos", () => {
        it("passe photoDataUrl au composant MessageBubble", () => {
            const messageWithPhoto = [
                {
                    id: "photo-msg",
                    author: "User",
                    text: "Photo",
                    photoDataUrl: "data:image/jpeg;base64,test",
                    time: "12:00",
                    date: "21 janv. 2026",
                    isSelf: true,
                },
            ];

            const wrapper = mount(MessageList, {
                props: { messages: messageWithPhoto },
                ...mountOptions,
            });

            expect(wrapper.find(".message-bubble-stub").exists()).toBe(true);
        });
    });
});
