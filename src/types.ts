export type Nutrition = "Healthy" | "Unhealthy";

export type Portion = "Small" | "Medium" | "Large";

export type Intensity = "Mild" | "Intense";

export interface Food {
  name: string;
  nutrition: Nutrition;
  portion: Portion;
}

export interface Drink {
  name: string;
  nutrition: Nutrition;
  portion: Portion;
}

export interface Activity {
  name: string;
  intensity: Intensity;
}

export interface PlayAction {
  name: "Play";
  activity: Activity;
}

export interface EatAction {
  name: "Eat";
  item: Food | Drink;
}

export type Action = PlayAction | EatAction;

export type Need = "Hygiene" | "Hunger" | "Attention";

export interface Needs {
  hygiene: number;
  hunger: number;
  attention: number;
}

export interface State {
  id: string;
  created: string;
  lastUpdated: string;
  name: string;
  age: string;
  weight: number;
  needs: Needs;
}
