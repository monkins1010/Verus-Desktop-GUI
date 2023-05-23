import Config from '../../config'
import translate from '../../translate/translate'
import React from 'react';

/**
 * This function will return true if the inputted chain
 * isn't on the reserved chain name list in the config 
 * or (optionally) is 'VRSC' or 'VRSCTEST'
 * @param {String} chain A blockchain ticker
 * @param {Boolean} includeVrsc (Optional) return true if chain is 'VRSC' or 'VRSCTEST'
 */
export const isPbaasChain = (chain, includeVrsc = false) => {
  return includeVrsc ? 
      chain === 'VRSC' || Config.general.main.reservedChains.indexOf(chain) === -1
    :
      Config.general.main.reservedChains.indexOf(chain) === -1
}

/**
 * This function will return the status string of a PBaaS chain
 * given it's activation height, the current reserve blockheight, 
 * it's minimum preconvert value maximum preconvert value
 * and it's initial supply. All values are expected in satoshis.
 * 
 * @param {Number} currentHeight The reserve chain's current blockheight 
 * @param {Number} activationHeight The chains set activation height
 * @param {Number} minPreconvert (Optional) The minimum preconvert value if the chain has a public premine (in Sats)
 * @param {Number} maxPreconvert (Optional) The maximum preconvert value if the chain has a public premine (in Sats)
 * @param {Number} initialSupply (Optional) The chain's initial supply (in Sats)
 * @param {Number} priceInReserve (Optional) The chain's price in its reserve currency (if it is a reserve currency) 
 */
export const getChainStatus = (currentHeight, activationHeight, minPreconvert, maxPreconvert, initialSupply, priceInReserve) => {
  let chainStatus = {
    state: null,
    age: currentHeight - activationHeight,
    startblock: activationHeight,
    icon: null,
    openForSend: false,
    price: priceInReserve
  }
  let labeltype = "info"
 
  if (!currentHeight) {
    chainStatus.state = 'SYNCING'
    labeltype = "info"
  } else if (activationHeight < currentHeight) {
    if (initialSupply < minPreconvert) {
      chainStatus.state = 'FAILED'
      labeltype = "danger"
    } else {
      chainStatus.state = 'RUNNING'
      labeltype = "success"
      chainStatus.openForSend = priceInReserve && priceInReserve > 0
    }
  } else if (minPreconvert > 0 || maxPreconvert > 0) {
    if (initialSupply >= maxPreconvert) {
      chainStatus.state = 'FULLY_FUNDED'
      labeltype = "success"
    } else {
      chainStatus.state = 'PRE_CONVERT'
      labeltype = "info"
      chainStatus.openForSend = true
    }
  } else {
    chainStatus.state = 'PRE_LAUNCH'
    labeltype = "info"
  }

  chainStatus.icon = <span className={`label label-${labeltype} text-center`}><span>{ translate(`PBAAS.${chainStatus.state}`) }</span></span>
  return chainStatus
}