import { APIGatewayEvent, Handler } from "aws-lambda"
import Repository from "./services/repository"
import { decreaseValue, increaseValue } from "./lib/utils"
import { State, Action, Food, Drink, Activity } from "./types"
import { food } from "./data/food"
import { drinks } from "./data/drinks"
import { activities } from "./data/activities"

const play = (state: State, activity: Activity): State => {
  const {
    weight,
    needs: { hygiene, hunger, attention },
  } = state
  const { intensity } = activity
  const isActivityIntense = intensity === "Intense"
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
      attention: increaseValue(attention, 10),
    },
    lastUpdated: new Date().toISOString(),
  }
}

const eat = (state: State, item: Food | Drink): State => {
  const { weight, needs } = state
  const { hunger, attention } = needs
  const { nutrition, portion } = item
  const isHealthy = nutrition === "Healthy"

  const getPortionChangeValue = (portion) => {
    switch (portion) {
      case "Small":
        return 5
      case "Medium":
        return 10
      case "Large":
        return 15
      default:
        return
    }
  }

  return {
    ...state,
    weight: isHealthy
      ? decreaseValue(weight, getPortionChangeValue(portion))
      : increaseValue(weight, getPortionChangeValue(portion)),
    needs: {
      ...needs,
      hunger: decreaseValue(hunger, getPortionChangeValue(portion)),
      attention: increaseValue(attention, 10),
    },
    lastUpdated: new Date().toISOString(),
  }
}

const neglect = (state: State): State => {
  const { lastUpdated, needs } = state
  const { attention } = needs
  // timestamp in milliseconds of the one hour before the current time
  const neglectInterval = new Date().getTime() - 3600000
  // has the pet been interacted with in the past hour
  const hasNeglectIntervalElapsed =
    new Date(lastUpdated).getTime() < neglectInterval

  return {
    ...state,
    needs: {
      ...needs,
      attention: hasNeglectIntervalElapsed
        ? decreaseValue(attention, 20)
        : attention,
    },
  }
}

const interact = (state: State, action: Action): State => {
  switch (action.name) {
    case "Play":
      return play(state, action.activity)
    case "Eat":
      return eat(state, action.item)
    default:
      return state
  }
}

const initialState: State = {
  id: "Squiggle",
  created: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  name: "Squiggle",
  age: "",
  weight: 0,
  needs: {
    hygiene: 100,
    hunger: 100,
    attention: 50,
  },
}

const repository = new Repository()

export const respond = (message: any, statusCode: number): any => {
  return {
    statusCode,
    body: JSON.stringify(message),
    headers: {
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  }
}

// update the pet status in tm-agotchi table
export const updateStatus: Handler = async (event: APIGatewayEvent) => {
  const state = await repository.get("Squiggle")
  const body = JSON.parse(event.body)
  const { eat, play } = body

  let newState
  let message
  if (eat) {
    const [item] = food.concat(drinks).filter((i) => i.name === eat)
    if (item) {
      newState = interact(state, { name: "Eat", item })
      message = `chomp chomp. ${state.name} devoured that!`
    }
    newState = state
    message = `${state.name} doesn't like that!`
  }
  if (play) {
    const [activity] = activities.filter((a) => a.name === play)
    if (activity) {
      newState = interact(state, { name: "Play", activity })
      message = `${state.name} really enjoyed that activity with you!`
    }
    newState = state
    message = `${state.name} doesn't know how!`
  }
  try {
    await repository.put(newState)
    return respond(message, 201)
  } catch (err) {
    return respond(err, 400)
  }
}

// get the pet status from tm-agotchi table
export const getStatus: Handler = async () => {
  try {
    // get from dynamoDB
    const status = await repository.get("Squiggle")
    return respond(status, 200)
  } catch (err) {
    return respond(err, 404)
  }
}
