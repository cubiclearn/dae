import { gql } from 'graphql-request'
import { type Strategy } from '@snapshot-labs/snapshot.js/dist/voting/types'
import { type ProposalType } from '@snapshot-labs/snapshot.js/dist/sign/types'

export type Space = {
  id: string
  name: string
}

export const SPACE_QUERY = gql`
  query Space($spaceId: String!) {
    space(
      id: $spaceId,
    ) {
      id
      name
      about
      network
      symbol
      strategies {
        name
        network
        params
      }
    }
  }
`

export type SPACE_QUERY = {
  space: {
    id: string
    name: string
    about: string
    network: string
    symbol: string
    strategies: Strategy[]
  }
}

export const PROPOSALS_QUERY = gql`
  query Proposals($spaceId: String!, $state: String){
    proposals (
      where: {
        space: $spaceId,
        state: $state
      },
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      title
      end
      state
      author
      network
      space {
        id
        name
      }
    }
}
`

export type PROPOSALS_QUERY = {
  proposals: {
    id: string
    title: string
    end: number
    state: string
    author: string
    network: string
    space: Space
  }[]
}

export const PROPOSAL_QUERY = gql`
  query Proposal($proposalId: String!) {
    proposal(id: $proposalId) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      scores
      scores_by_strategy
      scores_total
      author
      type
      network
      space {
        id
        name
      }
    }
  }
`

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
  author: string
  type: ProposalType
  network: string
  space: Space
}

export type PROPOSAL_QUERY = {
  proposal: Proposal
}

export const PROPOSAL_VOTES_QUERY = gql`
  query Votes($proposalId: String!) {
    votes (
      where: {
        proposal: $proposalId
      }
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      voter
      proposal {
        id
      }
      choice
      space {
        id
        name
      }
    }
  }
`

export type PROPOSAL_VOTES_QUERY = {
  votes: {
    id: string
    voter: string
    choice: number
    proposal: {
      id: string
    }
    space: Space
  }[]
}

export const USER_VOTES_QUERY = gql`
  query Votes($proposalId: String!, $userAddress:String!) {
    votes (
      first: 1
      where: {
        proposal: $proposalId
        voter: $userAddress
      }
    ) {
      id
      choice
      proposal {
        id
      }
    }
  }
`

export type USER_VOTES_QUERY = {
  votes: {
    id: string
    choice: number
    proposal: {
      id: string
    }
  }[]
}

export const USER_VOTING_POWER_QUERY = gql`
  query VotingPower($proposalId: String!, $userAddress:String!, $spaceId:String!) {
    vp (
      voter: $userAddress
      space: $spaceId
      proposal: $proposalId
    ) {
      vp
    }
  }
`

export type USER_VOTING_POWER_QUERY = {
  vp: { vp: number }
}
