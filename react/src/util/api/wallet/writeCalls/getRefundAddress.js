import { getApiData } from '../../callCreator'
import { API_GET_REFUND_ADDRESS } from '../../../constants/componentConstants'

/**
 * Function to create get a refund address for pbaas transactions, either creates a 
 * new one or uses the one in the config
 * @param {String} mode native
 * @param {String} chainTicker Ticker symbol for coin to fetch addresses for
 */
export const getRefundAddress = async (mode, chainTicker) => {
  const params = { chainTicker }
  let refundAddr = {}

  try {
    refundAddr = await getApiData(mode, API_GET_REFUND_ADDRESS, params)
  } catch (e) {
    throw e
  }
  
  return refundAddr
}