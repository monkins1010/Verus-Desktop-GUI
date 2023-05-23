import { getMiningInfo } from '../../../../util/api/wallet/walletCalls'
import { NATIVE } from '../../../../util/constants/componentConstants'
import { SET_COIN_MININGINFO, ERROR_COIN_MININGINFO } from '../../../../util/constants/storeType'

/**
 * Fetches the appropriate data from the store for the specified mode's mining info
 * update and dispatches a mining info update or error action to the store. Returns
 * a boolean indicating whether errors occured or not.
 * @param {Object} state Reference to redux store state
 * @param {Function} dispatch Redux action dispatch function
 * @param {String} mode native
 * @param {String} chainTicker Chain ticker id for chain to fetch mining info for
 */
export const updateMiningInfo = async (state, dispatch, mode, chainTicker) => {
  let miningInfoAction = {chainTicker}
  let wasSuccess = true

  if (mode === NATIVE) {
    try {
      const apiResult = await getMiningInfo(mode, chainTicker, chainTicker === "VRSC")
      if (apiResult.msg === 'success') {
        miningInfoAction = {...miningInfoAction, type: SET_COIN_MININGINFO, miningInfo: apiResult.result}
      } else {
        miningInfoAction = {...miningInfoAction, type: ERROR_COIN_MININGINFO, result: apiResult.result}
        wasSuccess = false
      }
    } catch (e) {
      throw e
    }
  } else {
    throw new Error(`"${mode}" is not a supported chain mode for updateMiningInfo, expected native.`)
  }

  dispatch(miningInfoAction)
  return wasSuccess
}