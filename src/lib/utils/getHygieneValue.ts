import { State } from "../../types"

export const getHygieneValue = ({ needs: { hygiene } }: State): number =>
  hygiene
