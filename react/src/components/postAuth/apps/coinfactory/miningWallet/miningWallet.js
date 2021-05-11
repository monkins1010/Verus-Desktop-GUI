import React from 'react';
import { connect } from 'react-redux';
import { 
  MiningWalletRender,
} from './miningWallet.render';
import {
  setModalNavigationPath,
  setModalParams,
  newSnackbar,
  setConfig,
} from "../../../../../actions/actionCreators";
import {
  ADD_COIN,
  SELECT_COIN,
  API_GET_CURRENTSUPPLY,
  SHIELDCOINBASE,
  WARNING_SNACK,
  MID_LENGTH_ALERT,
} from "../../../../../util/constants/componentConstants";
import Store from '../../../../../store';
import { saveConfig } from '../../../../../util/api/settings/configData';


class MiningWallet extends React.Component {
  constructor(props) {
    super(props);

    this.STAKING_BOOKLET = "staking";
    this.MINING_BOOKLET = "mining";

    this.state = {
      coinsMining: 0,
      coinsStaking: 0,

      // Loading states
      [this.STAKING_BOOKLET]: false,
      [this.MINING_BOOKLET]: false,
    };

    this.openShieldCoinbaseModal = this.openShieldCoinbaseModal.bind(this);
    this.toggleBooklet = this.toggleBooklet.bind(this);
  }

  toggleBooklet(booklet) {
    this.setState({ [booklet]: true }, async () => {
      const reduxState = Store.getState();
      const { config } = reduxState.settings;
      const configKey =
        booklet === this.MINING_BOOKLET
          ? "openMiningBooklets"
          : "openStakingBooklets";

      let error = false;
      const newConfig = {
        ...config,
        display: {
          ...config.display,
          mining: {
            ...config.display.mining,
            wallet: {
              ...config.display.mining.wallet,
              [configKey]: [
                {
                  ...config.display.mining.wallet[configKey][0],
                  [this.props.coin]: config.display.mining.wallet[configKey][0][
                    this.props.coin
                  ]
                    ? false
                    : true,
                },
              ],
            },
          },
        },
      };

      Store.dispatch(setConfig(newConfig));

      try {
        await saveConfig(newConfig);
      } catch (e) {
        console.error(e);
        Store.dispatch(
          newSnackbar(
            WARNING_SNACK,
            "Couldn't save mining wallet display state, the menu you just opened/closed likely wont stay that way if you close Verus-Desktop.",
            MID_LENGTH_ALERT
          )
        );
      }

      this.setState({
        [booklet]: false,
      });
    });
  }

  openShieldCoinbaseModal() {
    this.props.dispatch(
      setModalParams(SHIELDCOINBASE, { chainTicker: this.props.coin })
    );
    this.props.dispatch(setModalNavigationPath(SHIELDCOINBASE));
  }

  render() {
    return MiningWalletRender.call(this);
  }
}

function mapStateToProps(state, ownProps) {
  const { coin } = ownProps

  return {
    coinObj: state.coins.activatedCoins[coin],
    balances: state.ledger.balances[coin],
    info: state.ledger.info[coin],
    addresses: state.ledger.addresses[coin],
    currentSupply: state.ledger.currentSupply[coin],
    cpuData: state.system.static ? state.system.static.cpu : {},
    currentSupplyError: state.errors[API_GET_CURRENTSUPPLY],
    blockReward: state.ledger.blockReward[coin],
    transactions: state.ledger.transactions[coin],
    fiatPrice: state.ledger.fiatPrices[coin],
    fiatCurrency: state.settings.config.general.main.fiatCurrency,
    stakingBookletOpen: state.settings.config.display.mining.wallet.openStakingBooklets[0][coin] || false,
    miningBookletOpen: state.settings.config.display.mining.wallet.openMiningBooklets[0][coin] || false,
    multiverseNameMap: state.ledger.multiverseNameMap[coin]
  };
};

export default connect(mapStateToProps)(MiningWallet);