import { State } from "../../types"

export const getHungerValue = ({ needs: { hunger } }: State): number => hunger
