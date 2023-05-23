import React from 'react';
import { connect } from 'react-redux';
import { 
  DashboardRender,
} from './dashboard.render';
import {
  NATIVE,
  API_GET_ALL_CURRENCIES,
  IS_PBAAS
} from "../../../../../util/constants/componentConstants";
import { conditionallyUpdateWallet } from '../../../../../actions/actionDispatchers';
import Store from '../../../../../store';
import { filterSubArrays } from '../../../../../util/objectUtil';
import { checkFlag } from '../../../../../util/flagUtils';
import { IS_PBAAS_FLAG, IS_TOKEN_FLAG } from '../../../../../util/constants/flags';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.getVerusProtocolCoins = this.getVerusProtocolCoins.bind(this)
    this.getLoadedCurrencyCoins = this.getLoadedCurrencyCoins.bind(this)

    this.state = {
      pbaasCoins: this.getVerusProtocolCoins(props.activatedCoins),
      loadedCurrencyCoins: this.getLoadedCurrencyCoins(props.allCurrencies)
    }

    this.updateState = this.updateState.bind(this)
  }

  getVerusProtocolCoins(activatedCoins) {
    return Object.values(activatedCoins).filter((coinObj) => {
      return coinObj.options.tags.includes(IS_PBAAS)
    })
  }

  componentDidMount() {
    this.state.pbaasCoins.map(coinObj => {
      conditionallyUpdateWallet(
        Store.getState(),
        this.props.dispatch,
        NATIVE,
        coinObj.id,
        API_GET_ALL_CURRENCIES
      )
    })
  }

  componentDidUpdate(lastProps) {
    if (
      lastProps != this.props &&
      (lastProps.allCurrencies != this.props.allCurrencies ||
        lastProps.activatedCoins != this.props.activatedCoins)
    ) {
      this.updateState();
    }
  }

  getLoadedCurrencyCoins(allCurrencies) {
    return Object.keys(allCurrencies).length
  }

  updateState() {
    this.setState({
      pbaasCoins: this.getVerusProtocolCoins(this.props.activatedCoins),
      loadedCurrencyCoins: this.getLoadedCurrencyCoins(this.props.allCurrencies)
    })
  }

  render() {
    return DashboardRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    mainPathArray: state.navigation.mainPathArray,
    activatedCoins: state.coins.activatedCoins,
    allCurrencies: state.ledger.allCurrencies,
    allBlockchains: {
      ["VRSC"]: state.ledger.allCurrencies["VRSC"]
        ? state.ledger.allCurrencies["VRSC"].filter((currency) =>
            checkFlag(currency.options, IS_PBAAS_FLAG)
          )
        : [],
    },
    info: state.ledger.info,
    localCurrencyLists: state.localCurrencyLists,
    identities: state.ledger.identities,
  };
};

export default connect(mapStateToProps)(Dashboard);