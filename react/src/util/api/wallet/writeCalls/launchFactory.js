import { getApiData } from '../../callCreator'
import {
  API_CREATE_SIMPLE_TOKEN,
  API_CREATE_SIMPLE_TOKEN_PREFLIGHT,
  NATIVE,
  API_LAUNCH_SIMPLE_TOKEN_PREFLIGHT,
  API_LAUNCH_SIMPLE_TOKEN,
  API_LAUNCH_SIMPLE_KICKSTART,
  API_LAUNCH_SIMPLE_KICKSTART_PREFLIGHT
} from "../../../constants/componentConstants";

export const registerIdNameForFactory = async (
  preflight,
  chainTicker,
  name,
  primaryAddress,
  referralId,
  extra
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
        extra,
        delocalize: true
      } : {
        chainTicker,
        name,
        referralId,
        tmp_null,
        extra,
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
  

  export const launchSimpleKickstart = async (
    preflight,
    chainTicker,
    name,
    extra
  ) => {
    try {
  
    //  var options = 96; // token paramter to launch simple token
      return await getApiData(
        NATIVE,
        preflight ? API_LAUNCH_SIMPLE_KICKSTART_PREFLIGHT : API_LAUNCH_SIMPLE_KICKSTART,
        {
          chainTicker,
          name,
          extra,
          delocalize: true
        } 
      );
    } catch (e) {
      throw e
    }
  };