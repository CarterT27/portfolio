export type WorkingOn = {
  title: string;
  note?: string;
  url?: string;
};
export type Listening = {
  title: string;
  by: string;
  note?: string;
  url?: string;
};
export type Playing = { title: string; note?: string; url?: string };
export type Home = {
  name: string;
  description: string;
  bio: { default: string[]; long: string[] };
  workingOn: WorkingOn[];
  thinking: string[];
  listening: Listening[];
  playing: Playing[];
  elsewhere: { name: string; url: string }[];
};
