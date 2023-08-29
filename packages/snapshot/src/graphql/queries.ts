import { gql } from '@apollo/client'

export const FOLLOWS_QUERY = gql`
  query Follows($follower: String!, $spaceId: String) {
    follows(
      first: 10,
      where: {
        follower: $follower,
        space: $spaceId
      }
    ) {
      follower
      space {
        id
      }
      created
    }
  }
`

export const PROPOSALS_QUERY = gql`
  query Proposals($spaceId: String!, $state: String){
    proposals (
      first: 5,
      skip: 0,
      where: {
        space: $spaceId,
        state: $state
      },
      orderBy: "created",
      orderDirection: desc
    ) {
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
      scores_updated
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
      scores_updated
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

export const PROPOSAL_VOTES_QUERY = gql`
  query Votes($proposalId: String!) {
    votes (
      first: 1000
      skip: 0
      where: {
        proposal: $proposalId
      }
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      voter
      vp
      vp_by_strategy
      vp_state
      created
      proposal {
        id
      }
      choice
      space {
        id
      }
    }
  }
`
export const USER_VOTE_QUERY = gql`
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
