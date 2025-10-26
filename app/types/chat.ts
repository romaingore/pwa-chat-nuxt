export type Profile = {
  pseudo: string;
  photoDataUrl?: string;
};

export type Room = {
  id: string;
  name: string;
  joined: boolean;
};

export type Message = {
  id: string;
  roomId: string;
  author: string;
  text?: string;
  photoDataUrl?: string;
  ts: number;
};
