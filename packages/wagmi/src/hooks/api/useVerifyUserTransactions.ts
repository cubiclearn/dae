import { PendingTransactions } from '@dae/database'
import { useHookState } from '../useHookState'

type GetTransactionsApiResponse = {
  data: {
    transactions: PendingTransactions[]
  }
  success: boolean
}

export const UseVerifyUserTransactions = () => {
  const { isSuccess, isValidating, isLoading, isError, error, ...state } =
    useHookState()

  const verify = async () => {
    try {
      state.setLoading()
      const response = await fetch('/api/v0/user/transactions/pending', {
        method: 'GET',
      })

      if (!response.ok) {
        const responseJSON = await response.json()
        throw new Error(responseJSON.error)
      }

      const unverifiedTransaction: GetTransactionsApiResponse =
        await response.json()

      const promises = unverifiedTransaction.data.transactions.map(
        (transaction) => {
          if (transaction.action === 'CREATE_COURSE') {
            return fetch('/api/v0/course', {
              method: 'POST',
              body: JSON.stringify({
                txHash: transaction.transaction_hash,
                chainId: transaction.chain_id,
              }),
              headers: {
                'Content-type': 'application/json; charset=UTF-8',
              },
            })
          }
          if (transaction.action === 'TRANSFER_CREDENTIALS') {
            return fetch('/api/v0/user/course/credentials', {
              method: 'POST',
              body: JSON.stringify({
                txHash: transaction.transaction_hash,
                chainId: transaction.chain_id,
              }),
              headers: {
                'Content-type': 'application/json; charset=UTF-8',
              },
            })
          }
          if (transaction.action === 'BURN_CREDENTIAL') {
            return fetch(
              `/api/v0/user/course/credential?txHash=${transaction.transaction_hash}&chainId=${transaction.chain_id}`,
              {
                method: 'DELETE',
              },
            )
          }
          return null
        },
      )

      await Promise.all(promises)
      state.setSuccess()
    } catch (e: unknown) {
      state.handleError(e)
      throw e
    }
  }

  return {
    verify,
    isLoading,
    isError,
    isSuccess,
    error,
    isValidating,
  }
}
