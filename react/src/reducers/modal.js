/*
  This reducer contains temporary information that is to be used specifically by
  modals, and is usually dispatched from the main navigation path.
*/

import { 
  SET_MODAL_PARAMS
} from '../util/constants/storeType'
import {
  SEND_COIN,
  RECEIVE_COIN,
  CREATE_IDENTITY,
  SHIELDCOINBASE,
  CREATE_SIMPLE_TOKEN
} from "../util/constants/componentConstants";

export const modal = (state = {
  [SEND_COIN]: {
    chainTicker: null,
    balanceTag: null,
    fund: false,
    isMessage: false
  },
  [SHIELDCOINBASE]: {
    chainTicker: null,
  },
  [RECEIVE_COIN]: {
    chainTicker: null,
  },
  [CREATE_IDENTITY]: {
    chainTicker: null,
    nameReservation: null,
    modalType: null
  },
  [CREATE_SIMPLE_TOKEN]: {
    chainTicker: null,
    nameReservation: null,
    modalType: null
  }
}, action) => {
  switch (action.type) {
    case SET_MODAL_PARAMS:
      return {
        ...state,
        [action.modal]: action.params
      }
    default:
      return state;
  }
}