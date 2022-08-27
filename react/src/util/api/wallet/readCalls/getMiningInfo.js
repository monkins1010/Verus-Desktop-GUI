import { getApiData } from '../../callCreator'
import { API_GET_MININGINFO } from '../../../constants/componentConstants'

/**
 * Function to get mining info for specific mode (native only)
 * @param {String} mode native
 * @param {String} chainTicker Ticker symbol for coin to fetch info for
 */
export const getMiningInfo = async (mode, chainTicker, includeBridgekeeper = false) => {
  const params = {chainTicker, includeBridgekeeper}
  let miningInfo = {}

  try {
    miningInfo = await getApiData(mode, API_GET_MININGINFO, params)
  } catch (e) {
    throw e
  }
  
  return miningInfo
}