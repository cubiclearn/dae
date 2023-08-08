import { ProposalType } from '@snapshot-labs/snapshot.js/dist/sign/types'

export type Proposal = {
  id: string
  title: string
  body: string
  choices: string[]
  start: number
  end: number
  snapshot: string
  state: string
  scores: number[]
  scores_by_strategy: number[][]
  scores_total: number
  scores_updated: number
  author: string
  type: ProposalType
  network: string
  space: {
    id: string
    name: string
    __typename: string
  }
  __typename: string
}
