export type Profile = {
  pseudo: string;

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
  location?: {
    lat: number;
    lng: number;
  };
  ts: number;
};
