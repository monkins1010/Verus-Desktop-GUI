import { getApiData } from '../../callCreator'
import {
  API_CREATE_SIMPLE_TOKEN,
  API_CREATE_SIMPLE_TOKEN_PREFLIGHT,
  NATIVE,
  API_LAUNCH_SIMPLE_TOKEN_PREFLIGHT,
  API_LAUNCH_SIMPLE_TOKEN_CALL
} from "../../../constants/componentConstants";

export const registerIdNameForSimpleToken = async (
  preflight,
  chainTicker,
  name,
  primaryAddress,
  referralId,
  simple_addresses,
  amount
) => {
  try {

    var tmp_null = null;
    return await getApiData(
      NATIVE,
      preflight ? API_CREATE_SIMPLE_TOKEN_PREFLIGHT : API_CREATE_SIMPLE_TOKEN,
      primaryAddress != null ? {
        chainTicker,
        name,
        referralId,
        primaryAddress,
        simple_addresses,
        amount,
        delocalize: true
      } : {
        chainTicker,
        name,
        referralId,
        tmp_null,
        simple_addresses,
        amount,
        delocalize: true
      }
    );
  } catch (e) {
    throw e
  }
};



/**
 * Creates a name commitment for a Verus ID for use with the launch token
 * @param {String} preflight Whether or not to actually register the ID name or just return data to confirm
 * @param {String} chainTicker The chain to create the name commitment on
 * @param {String} name The name to create a commitment for 
 * @param {String} referralId The refferal id that can be used for a creation discount
 */
export const launchSimpleToken = async (
    preflight,
    chainTicker,
    name,
    txid,
    salt,
    primaryaddresses,
    minimumsignatures,
    contentmap,
    revocationauthority,
    recoveryauthority,
    privateaddress,
    idFee,
    referral
  ) => {
    try {
      return await getApiData(
        NATIVE,
        preflight ? API_LAUNCH_SIMPLE_TOKEN_PREFLIGHT : API_LAUNCH_SIMPLE_TOKEN_CALL,
        {
          chainTicker,
          name,
          txid,
          salt,
          primaryaddresses,
          minimumsignatures,
          contentmap,
          revocationauthority,
          recoveryauthority,
          privateaddress,
          idFee,
          referral
        }
      );
    } catch (e) {
      throw e
    }
  };