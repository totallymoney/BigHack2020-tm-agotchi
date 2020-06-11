import { State } from "../../types"

export const getAttentionValue = ({ needs: { attention } }: State): number =>
  attention
