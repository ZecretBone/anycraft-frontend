// export type Element = {
//   id: number;
//   slug: string;
//   name: string;
//   emoji?: string;
//   is_character: boolean;
//   image_url?: string;
//   rarity?: string;
//   difficulty?: number;
// };

export type Element = {
  id: number;
  slug: string;
  name: string;
  emoji?: string;
  is_character: boolean;
  image_url?: string;
  rarity?: string;
  difficulty?: number;
  /** always visible in Inventory even if not discovered */
  is_base_element?: boolean;   // ✅ NEW
};


export type Recipes = Record<string, { result_id: number }>;
