export type Element = {
  id: number;
  slug: string;
  name: string;
  emoji?: string | null;
  is_character: boolean;
  is_base_element: boolean;
  image_url?: string | null;
  rarity?: string | null;
  difficulty?: number | null;
};

export type BaseElementsResponse = {
  ok: boolean;
  items: Element[];
};

export type CombineRequest = {
  game_code: string;
  parent_a_id: number;
  parent_b_id: number;
};

export type CombineResponse = {
  ok: boolean;
  error?: string;
  result?: Element;
};

export type ChallengesRequest = {
  game_code: string;
  discovered_character_ids: number[];
};

export type ChallengeItem = {
  id: number;
  name: string;
  image_url?: string | null;
};

export type ChallengesResponse = {
  ok: boolean;
  items: ChallengeItem[];
};
