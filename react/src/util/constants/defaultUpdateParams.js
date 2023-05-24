import Config from '../../config'
import { 
  ALWAYS_ACTIVATED, 
  NEVER_ACTIVATED, 
  IS_ZCASH,
  IS_PBAAS_ROOT,
  API_GET_ADDRESSES,
  API_GET_BALANCES,
  API_GET_BLOCKREWARD,
  API_GET_INFO,
  API_GET_MININGINFO,
  API_GET_TRANSACTIONS,
  API_GET_ZOPERATIONSTATUSES,
  API_GET_FIATPRICE,
  CHAIN_POSTFIX,
  FIX_CHARACTER,
  API_GET_IDENTITIES,
  API_GET_ALL_CURRENCIES,
  API_GET_CURRENCY_DATA_MAP,
  IS_VERUS,
  API_GET_NAME_COMMITMENTS,
  API_GET_CPU_TEMP,
  API_GET_CPU_LOAD,
  API_GET_SYS_TIME,
  API_GET_CURRENTSUPPLY,
  API_GET_RESERVE_TRANSFERS,
  IS_PBAAS
} from './componentConstants'

const PASSIVE_MODE_MULTIPLIER = 20
const TIMEOUT_MULTIPLIER =
  Config.general != null && Config.general.native.passiveMode ? PASSIVE_MODE_MULTIPLIER : 1;

/**
 * This object holds all the settings for deciding the timing and frequency of system data updates,
 * including things like cpu temperature, load, and system time
 */
export const DEFAULT_SYSTEM_UPDATE_PARAMS = {
  [API_GET_CPU_TEMP]: {
    tracking_info: {
      busy: false,
      location_restrictions: ['@post_auth/apps/mining/dashboard']
    },
    interval_info: {
      interval_id: null,
      interval: 10000
    }
  },
  [API_GET_CPU_LOAD]: {
    tracking_info: {
      busy: false,
      location_restrictions: ['@post_auth/apps/mining/dashboard']
    },
    interval_info: {
      interval_id: null,
      interval: 10000
    }
  },
  [API_GET_SYS_TIME]: {
    tracking_info: {
      busy: false,
      location_restrictions: []
    },
    interval_info: {
      interval_id: null,
      interval: 30000
    }
  },
}

/**
 * The constant parameter object that holds all settings for deciding the timing and frequency of how certain coin modes
 * call their API to get their data.
 * @param {String} ticker The coin to get update parameters for (for location restrictions)
 */
export const DEFAULT_COIN_UPDATE_PARAMS = (ticker) => ({
  native: {
    [API_GET_INFO]: {
      // Restrictions specify if this interval should only be added to certain types of coins, e.g. 'is_pbaas' for only pbaas chains,
      // or 'VRSC' for only VRSC
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: true,
          busy: false,
          // Location restrictions are the specific app navigation locations from which this interval will actually cause an API call.
          // Leave blank for all locations
          location_restrictions: [],

          // Location and type restrictions specify a restriction that will allow this update to be called if 
          // a location is active && the coin type is the type specified. Format is [location, type], e.g. [@post_auth/apps/mining/dashboard, IS_PBAAS]
          location_and_type_restrictions: [],
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: ALWAYS_ACTIVATED,
          update_expired_interval: 5000
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: ALWAYS_ACTIVATED,
          update_expired_interval: 10000
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_TRANSACTIONS]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [`@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`],
          location_and_type_restrictions: [/*['@post_auth/apps/mining/dashboard', IS_PBAAS], */['@post_auth/apps/', IS_VERUS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [`@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`],
          location_and_type_restrictions: [/*['@post_auth/apps/mining/dashboard', IS_PBAAS], */['@post_auth/apps/', IS_VERUS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      }
    },

    [API_GET_RESERVE_TRANSFERS]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [[`@post_auth`, IS_PBAAS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [[`@post_auth`, IS_PBAAS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      }
    },

    [API_GET_IDENTITIES]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [['@post_auth', IS_VERUS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [['@post_auth', IS_VERUS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      }
    },

    [API_GET_ALL_CURRENCIES]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [['@post_auth/apps/multiverse/', IS_PBAAS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [['@post_auth/apps/multiverse/', IS_PBAAS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      }
    },

    [API_GET_CURRENCY_DATA_MAP]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [['@post_auth', IS_PBAAS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 120000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [['@post_auth', IS_PBAAS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 120000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      }
    },

    //TODO: Make less frequent, it is only fetched from a file after all
    [API_GET_NAME_COMMITMENTS]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [['@post_auth', IS_VERUS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: [['@post_auth', IS_VERUS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      }
    },

    [API_GET_MININGINFO]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: ['@post_auth/apps/mining', '@post_auth/apps/multiverse'],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: ['@post_auth/apps/mining', '@post_auth/apps/multiverse'],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 15000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_CURRENTSUPPLY]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: ['@post_auth/apps/mining', '@post_auth/apps/multiverse'],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: ['@post_auth/apps/mining', '@post_auth/apps/multiverse'],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_BLOCKREWARD]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: ['@post_auth/apps/mining', '@post_auth/apps/multiverse'],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: ['@post_auth/apps/mining', '@post_auth/apps/multiverse'],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_ADDRESSES]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_BALANCES]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_FIATPRICE]: {
      restrictions: [], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*'@post_auth/apps/wallet'*/],
          location_and_type_restrictions: [[`@post_auth`, IS_PBAAS, true], [`@post_auth`, IS_PBAAS_ROOT, false]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*'@post_auth/apps/wallet'*/],
          location_and_type_restrictions: [[`@post_auth`, IS_PBAAS, true], [`@post_auth`, IS_PBAAS_ROOT, false]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_ZOPERATIONSTATUSES]: {
      restrictions: [IS_ZCASH], 
      pre_data: {
        tracking_info: {
          needs_update: false,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED
        }
      },
      syncing: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [`@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`],
          location_and_type_restrictions: [['@post_auth/apps/verus_id', IS_VERUS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      },
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [`@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`],
          location_and_type_restrictions: [['@post_auth/apps/verus_id', IS_VERUS]]
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
          update_expired_interval: 10000,
        }
      }
    },

    // [API_GET_DEFINEDCHAINS]: {
    //   restrictions: [IS_PBAAS_ROOT], 
    //   pre_data: {
    //     tracking_info: {
    //       needs_update: false,
    //       busy: false,
    //       location_restrictions: [],
    //       location_and_type_restrictions: []
    //     },
    //     interval_info: {
    //       expire_id: null,
    //       update_expired_id: null,
    //       expire_oncomplete: null,
    //       update_expired_oncomplete: null,
    //       expire_timeout: NEVER_ACTIVATED,
    //       update_expired_interval: NEVER_ACTIVATED
    //     }
    //   },
    //   syncing: {
    //     tracking_info: {
    //       needs_update: true,
    //       busy: false,
    //       location_restrictions: ['@post_auth/apps/pbaas/discover'],
    //       location_and_type_restrictions: []
    //     },
    //     interval_info: {
    //       expire_id: null,
    //       update_expired_id: null,
    //       expire_oncomplete: null,
    //       update_expired_oncomplete: null,
    //       expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
    //       update_expired_interval: 10000
    //     }
    //   },
    //   post_sync: {
    //     tracking_info: {
    //       needs_update: true,
    //       busy: false,
    //       location_restrictions: [/*'@post_auth/apps/pbaas/discover'*/],
    //       location_and_type_restrictions: []
    //     },
    //     interval_info: {
    //       expire_id: null,
    //       update_expired_id: null,
    //       expire_oncomplete: null,
    //       update_expired_oncomplete: null,
    //       expire_timeout: 30000 * TIMEOUT_MULTIPLIER,
    //       update_expired_interval: 10000
    //     }
    //   }
    // },
  },
  
  //Electrum and eth have no syncing or pre_data phases
  electrum: {
    [API_GET_INFO]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED,
        }
      }
    },

    [API_GET_TRANSACTIONS]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*`@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`*/],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000,
          update_expired_interval: 10000,
        }
      }
    },

    [API_GET_BALANCES]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_ADDRESSES]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*`receive_coin@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`*/],
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_FIATPRICE]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*'@post_auth/apps/wallet'*/],
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000,
          update_expired_interval: 10000
        }
      }
    },
  },

  eth: {
    [API_GET_INFO]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED,
        }
      }
    },

    [API_GET_TRANSACTIONS]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*`@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`*/],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000,
          update_expired_interval: 5000,
        }
      }
    },

    [API_GET_BALANCES]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000,
          update_expired_interval: 5000
        }
      }
    },

    [API_GET_ADDRESSES]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*`receive_coin@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`*/],
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_FIATPRICE]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*'@post_auth/apps/wallet'*/],
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000,
          update_expired_interval: 10000
        }
      }
    },
  },

  erc20: {
    [API_GET_INFO]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: NEVER_ACTIVATED,
          update_expired_interval: NEVER_ACTIVATED,
        }
      }
    },

    [API_GET_TRANSACTIONS]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*`@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`*/],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 60000,
          update_expired_interval: 5000,
        }
      }
    },

    [API_GET_BALANCES]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [],
          location_and_type_restrictions: []
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000,
          update_expired_interval: 5000
        }
      }
    },

    [API_GET_ADDRESSES]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*`receive_coin@post_auth/apps/wallet/${ticker}${FIX_CHARACTER}${CHAIN_POSTFIX}`*/],
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000,
          update_expired_interval: 10000
        }
      }
    },

    [API_GET_FIATPRICE]: {
      restrictions: [], 
      post_sync: {
        tracking_info: {
          needs_update: true,
          busy: false,
          location_restrictions: [/*'@post_auth/apps/wallet'*/],
        },
        interval_info: {
          expire_id: null,
          update_expired_id: null,
          expire_oncomplete: null,
          update_expired_oncomplete: null,
          expire_timeout: 30000,
          update_expired_interval: 10000
        }
      }
    },
  },
})