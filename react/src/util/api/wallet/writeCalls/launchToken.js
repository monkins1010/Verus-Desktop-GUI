import { getApiData } from '../../callCreator'
import {
  API_CREATE_SIMPLE_TOKEN,
  API_CREATE_SIMPLE_TOKEN_PREFLIGHT,
  NATIVE,
  API_LAUNCH_SIMPLE_TOKEN_PREFLIGHT,
  API_LAUNCH_SIMPLE_TOKEN
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




  export const launchSimpleToken = async (
    preflight,
    chainTicker,
    name,
    simple_addresses,
    amount
  ) => {
    try {
  
    //  var options = 96; // token paramter to launch simple token
      return await getApiData(
        NATIVE,
        preflight ? API_LAUNCH_SIMPLE_TOKEN_PREFLIGHT : API_LAUNCH_SIMPLE_TOKEN,
        {
          chainTicker,
          name,
          simple_addresses,
          amount,
          delocalize: true
        } 
      );
    } catch (e) {
      throw e
    }
  };
  

