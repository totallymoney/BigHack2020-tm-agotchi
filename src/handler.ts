import { decreaseValue, increaseValue } from "./lib/utils";
import { State, Action, Food, Drink, Activity } from "./types";
import { v4 as guid } from "uuid";

const play = (state: State, activity: Activity): State => {
  const {
    weight,
    needs: { hygiene, hunger, attention }
  } = state;
  const { intensity } = activity;
  const isActivityIntense = intensity === "Intense";
  return {
    ...state,
    weight: isActivityIntense ? decreaseValue(weight, 10) : weight,
    needs: {
      hygiene: isActivityIntense
        ? decreaseValue(hygiene, 20)
        : decreaseValue(hygiene, 10),
      hunger: isActivityIntense
        ? increaseValue(hunger, 20)
        : increaseValue(hunger, 10),
      attention: increaseValue(attention, 10)
    },
    lastUpdated: new Date().toISOString()
  };
};

const eat = (state: State, item: Food | Drink): State => {
  const { weight, needs } = state;
  const { hunger, attention } = needs;
  const { nutrition, portion } = item;
  const isHealthy = nutrition === "Healthy";

  const getPortionChangeValue = (portion) => {
    switch (portion) {
      case "Small":
        return 5;
      case "Medium":
        return 10;
      case "Large":
        return 15;
      default:
        return;
    }
  };

  return {
    ...state,
    weight: isHealthy
      ? decreaseValue(weight, getPortionChangeValue(portion))
      : increaseValue(weight, getPortionChangeValue(portion)),
    needs: {
      ...needs,
      hunger: decreaseValue(hunger, getPortionChangeValue(portion)),
      attention: increaseValue(attention, 10)
    },
    lastUpdated: new Date().toISOString()
  };
};

const neglect = (state: State) => {
  const { lastUpdated, needs } = state;
  const { attention } = needs;
  // timestamp in milliseconds of the one hour before the current time
  const neglectInterval = new Date().getTime() - 3600000;
  // has the pet been interacted with in the past hour
  const hasNeglectIntervalElapsed =
    new Date(lastUpdated).getTime() < neglectInterval;

  return {
    ...state,
    needs: {
      ...needs,
      attention: hasNeglectIntervalElapsed
        ? decreaseValue(attention, 20)
        : attention
    }
  };
};

const interact = (state: State, action: Action): State => {
  switch (action.name) {
    case "Play":
      return play(state, action.activity);
    case "Eat":
      return eat(state, action.item);
    default:
      return state;
  }
};

const initialState: State = {
  id: guid(),
  created: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  name: "Squiggle",
  age: "",
  weight: 0,
  needs: {
    hygiene: 100,
    hunger: 100,
    attention: 50
  }
};
