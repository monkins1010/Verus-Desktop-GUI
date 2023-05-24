import { loadUsers, saveUsers } from "../api/users/userData";
import { getNewUser } from "../../actions/actionCreators";
import { equalizeProperties } from "../objectUtil";
import { ELECTRUM, NATIVE, ETH, ERC20, IS_PBAAS, IS_PBAAS_ROOT } from "./componentConstants";
import { saveLocalBlacklist, saveLocalWhitelist } from "../api/currencies/localCurrencyData";

// Describes the changes that take place during certain versions
export const UPDATE_LOG_HISTORY = {
  ["1.0.5"]: {
    breaking: false,
    desc: "Add IS_PBAAS flag to VRSC and remove it from VRSCTEST."
  },
  ["0.7.2-10"]: {
    breaking: true,
    desc:
      "Add startupOptions field to the user object.",
  },
  ["0.7.1"]: {
    breaking: true,
    desc:
      'Move tags field in every coinObj from the main object to the "options" property|' +
      "Add selectedCurrencyMap property to users",
  },
};

// Contains the functions to execute on upgrades, all update functions must be idempotent
export const UPDATE_FUNCTIONS = {
  ["1.0.5"]: async () => {
    try {
      let loadedUsers = await loadUsers()
  
      for (let userId in loadedUsers) {
        // Add property to userObjs
        let equalizedUser = equalizeProperties(
          getNewUser(),
          loadedUsers[userId],
          (stringKey) => {
            const propertyArr = stringKey.split('.')
            return (
              propertyArr.length > 1 &&
              (propertyArr[0] == "startCoins" ||
                propertyArr[0] == "lastCoins")
            );
          }
        )

        let totalCoins = {
          ...equalizedUser.result.lastCoins,
          ...equalizedUser.result.startCoins
        }

        // Change coinObjs
        for (let chainTicker in totalCoins) {
          if (chainTicker === "VRSC") {
            equalizedUser.changed = true;

            if (!totalCoins[chainTicker].options.tags.includes(IS_PBAAS)) {
              totalCoins[chainTicker].options.tags = [...totalCoins[chainTicker].options.tags, IS_PBAAS]
            }

            if (!totalCoins[chainTicker].options.tags.includes(IS_PBAAS_ROOT)) {
              totalCoins[chainTicker].options.tags = [...totalCoins[chainTicker].options.tags, IS_PBAAS_ROOT]
            }
          } else if (chainTicker === "VRSCTEST") {
            equalizedUser.changed = true;

            if (totalCoins[chainTicker].options.tags.includes(IS_PBAAS)) {
              totalCoins[chainTicker].options.tags = totalCoins[chainTicker].options.tags.filter(x => x !== IS_PBAAS)
            }

            if (totalCoins[chainTicker].options.tags.includes(IS_PBAAS_ROOT)) {
              totalCoins[chainTicker].options.tags = totalCoins[chainTicker].options.tags.filter(x => x !== IS_PBAAS_ROOT)
            }
          }

          if (equalizedUser.result.lastCoins[chainTicker] != null) {
            equalizedUser.result.lastCoins[chainTicker] = totalCoins[chainTicker]
          }

          if (equalizedUser.result.startCoins[chainTicker] != null) {
            equalizedUser.result.startCoins[chainTicker] = totalCoins[chainTicker]
          }
        }
  
        if (equalizedUser.changed) {
          loadedUsers[userId] = equalizedUser.result
        }
      }
      
      await saveUsers(loadedUsers)
    } catch (e) {
      throw e
    }
  },
  ["0.7.2-10"]: async () => {
    try {
      let loadedUsers = await loadUsers()
  
      for (let userId in loadedUsers) {
        // Add property to userObjs
        let replacementUser

        // Add startupOptions key to user
        if (loadedUsers[userId].startupOptions == null) {
          replacementUser = {changed: true, result: {...loadedUsers[userId]}}

          replacementUser.result.startupOptions = {
            [NATIVE]: {},
            [ELECTRUM]: {},
            [ETH]: {},
            [ERC20]: {}
          }
        } else replacementUser = {changed: false, result: loadedUsers[userId]}

        // Reset navigation locations due to change in coin postfix seperator
        replacementUser.changed = true
        replacementUser.result.startLocation = "post_auth/apps/wallet/dashboard"
        replacementUser.result.lastNavigationLocation = "post_auth/apps/wallet/dashboard"

        let totalCoins = {
          ...replacementUser.result.lastCoins,
          ...replacementUser.result.startCoins
        }

        // Replace ETH mode with ERC20 mode for ERC20 coins
        for (let chainTicker in totalCoins) {
          if (
            totalCoins[chainTicker].available_modes[ETH] === true &&
            totalCoins[chainTicker].id !== "ETH" && 
            totalCoins[chainTicker].mode === ETH
          ) {
            replacementUser.changed = true;
            totalCoins[chainTicker].available_modes[ERC20] = true;
            totalCoins[chainTicker].available_modes[ETH] = false;
            totalCoins[chainTicker].mode = ERC20;
          }

          if (replacementUser.result.lastCoins[chainTicker] != null) {
            replacementUser.result.lastCoins[chainTicker] = totalCoins[chainTicker]
          }

          if (replacementUser.result.startCoins[chainTicker] != null) {
            replacementUser.result.startCoins[chainTicker] = totalCoins[chainTicker]
          }
        }
  
        if (replacementUser.changed) {
          loadedUsers[userId] = replacementUser.result
        }
      }
     
      await saveUsers(loadedUsers)
      await saveLocalBlacklist({})
      await saveLocalWhitelist({})
    } catch (e) {
      throw e
    }
  },
  ["0.7.1"]: async () => {
    try {
      let loadedUsers = await loadUsers()
  
      for (let userId in loadedUsers) {
        // Add property to userObjs
        let equalizedUser = equalizeProperties(
          getNewUser(),
          loadedUsers[userId],
          (stringKey) => {
            const propertyArr = stringKey.split('.')
            return (
              propertyArr.length > 1 &&
              (propertyArr[0] == "startCoins" ||
                propertyArr[0] == "lastCoins" ||
                propertyArr[0] == "selectedCurrencyMap")
            );
          }
        )

        let totalCoins = {
          ...equalizedUser.result.lastCoins,
          ...equalizedUser.result.startCoins
        }

        // Change coinObjs
        for (let chainTicker in totalCoins) {
          if (totalCoins[chainTicker].tags != null && totalCoins[chainTicker].options.tags == null) {
            equalizedUser.changed = true
            totalCoins[chainTicker].options.tags = totalCoins[chainTicker].tags
          }

          if (equalizedUser.result.lastCoins[chainTicker] != null) {
            equalizedUser.result.lastCoins[chainTicker] = totalCoins[chainTicker]
          }

          if (equalizedUser.result.startCoins[chainTicker] != null) {
            equalizedUser.result.startCoins[chainTicker] = totalCoins[chainTicker]
          }
        }
  
        if (equalizedUser.changed) {
          loadedUsers[userId] = equalizedUser.result
        }
      }
     
      await saveUsers(loadedUsers)
    } catch (e) {
      throw e
    }
  }
}
