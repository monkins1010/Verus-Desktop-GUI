import React from 'react';
import { connect } from 'react-redux';
import {
  DASHBOARD,
  NATIVE,
  ERROR_SNACK,
  IS_PBAAS,
  FIX_CHARACTER,
  PBAAS_POSTFIX,
} from "../../../../util/constants/componentConstants";
import Dashboard from './dashboard/dashboard'
import {
  MultiverseCardRender,
  MultiverseTabsRender
} from './multiverse.render'
import { setMainNavigationPath, newSnackbar } from '../../../../actions/actionCreators'
import FormDialog from '../../../../containers/FormDialog/FormDialog'
import { getCurrency } from '../../../../util/api/wallet/walletCalls'
import { openCurrencyCard } from '../../../../actions/actionDispatchers';
import PbaasChain from './pbaasChain/pbaasChain';
import { getLastLocation, getPathParent } from '../../../../util/navigationUtils';
import { useStringAsKey } from '../../../../util/objectUtil';

class Multiverse extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currencySearchOpen: false,
      loading: false,
      validCoins: []
    };

    this.setCards = this.setCards.bind(this);
    this.setTabs = this.setTabs.bind(this);
    this.updateSearchTerm = this.updateSearchTerm.bind(this);
    this.closeSearchModal = this.closeSearchModal.bind(this);
    this.openSearchModal = this.openSearchModal.bind(this);
    this.onCurrencySearchSubmit = this.onCurrencySearchSubmit.bind(this);
    this.displayCurrencyInfo = this.displayCurrencyInfo.bind(this);
    this.getValidCoins = this.getValidCoins.bind(this)
    this.openDashboard = this.openDashboard.bind(this)
    this.setTabs();
  }

  componentDidMount() {    
    if (!this.props.mainPathArray[3]) {
      this.getValidCoins(this.props.activatedCoins, () => {
        const lastLocation = getLastLocation(
          useStringAsKey(
            this.props.mainTraversalHistory,
            this.props.mainPathArray.join(".")
          )
        );
  
        const lastCoin =
          lastLocation != null &&
          lastLocation.length > 0 &&
          lastLocation[0].includes(`${FIX_CHARACTER}${PBAAS_POSTFIX}`)
            ? lastLocation[0].split(FIX_CHARACTER)[0]
            : null;
  
        this.props.dispatch(setMainNavigationPath(`${this.props.mainPathArray.join('/')}/${
          lastCoin != null && this.state.validCoins.includes(lastCoin) ? lastLocation[0] : DASHBOARD
        }`)) 
      })
    }
  }

  updateSearchTerm(term) {
    this.setState({ currencySearchTerm: term });
  }

  closeSearchModal() {
    this.setState({ currencySearchOpen: false });
  }

  openSearchModal(chain) {
    this.setState({ currencySearchOpen: true, searchChain: chain });
  }

  openDashboard() {
    this.props.dispatch(setMainNavigationPath(`${getPathParent(this.props.mainPathArray)}/${DASHBOARD}`))
  }

  openCoin(wallet) {
    this.props.dispatch(
      setMainNavigationPath(
        `${getPathParent(
          this.props.mainPathArray
        )}/${wallet}${FIX_CHARACTER}${PBAAS_POSTFIX}`
      )
    )
  }

  getValidCoins(activatedCoins, cb) {
    this.setState({ validCoins: Object.keys(activatedCoins).filter((chainTicker) => {
      return activatedCoins[chainTicker].mode === NATIVE
    })}, () => cb())
  }

  onCurrencySearchSubmit() {
    this.setState({ loading: true }, () => {
      this.displayCurrencyInfo(this.state.currencySearchTerm);
    });
  }

  displayCurrencyInfo(currency) {
    getCurrency(NATIVE, this.state.searchChain, currency)
      .then((res) => {
        if (res.msg === "success") {
          openCurrencyCard(
            res.result,
            this.state.searchChain,
            this.props.identities[this.state.searchChain]
          );
          this.setState({ loading: false, currencySearchOpen: false, currencySearchTerm: "" });
        } else {
          this.props.dispatch(newSnackbar(ERROR_SNACK, res.result));
          this.setState({ loading: false });
        }
      })
      .catch((err) => {
        this.props.dispatch(newSnackbar(ERROR_SNACK, err.message));
        this.setState({ loading: false });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (
      Object.keys(nextProps.activatedCoins).length <
        Object.keys(this.props.activatedCoins).length ||
      nextProps.mainPathArray != this.props.mainPathArray
    ) {
      this.setCards(nextProps.activatedCoins);
    }
  }

  componentDidUpdate(lastProps) {
    if (lastProps != this.props) {
      this.setCards(this.props.activatedCoins);
    }
  }

  /**
   * Sets the wallet coin cards by mapping over the provided identity compatible coins
   * @param {Object} activatedCoins
   */
  setCards(activatedCoins) {
    const { setCards } = this.props;

    const updateCards = () => {
      const verusProtocolCoins = Object.values(activatedCoins).filter((coinObj) => {
        return coinObj.mode === NATIVE && coinObj.options.tags.includes(IS_PBAAS);
      });

      setCards(
        verusProtocolCoins.map((coinObj) => {
          return MultiverseCardRender.call(this, coinObj);
        })
      );
    };

    updateCards();
  }

  setTabs() {
    this.props.setTabs(MultiverseTabsRender.call(this));
  }

  render() {
    const walletApp = this.props.mainPathArray[3] ? this.props.mainPathArray[3] : null
    let mainComponent

    if (walletApp) {
      if (walletApp === DASHBOARD) mainComponent = <Dashboard />;
      else {
        const pathDestination = walletApp.split(FIX_CHARACTER);

        if (pathDestination.length > 1 && pathDestination[1] === PBAAS_POSTFIX) {
          mainComponent = <PbaasChain coin={pathDestination[0]} />;
        }
      }
    }

    return (
      <React.Fragment>
        <FormDialog
          open={this.state.currencySearchOpen}
          title={`Search Currencies`}
          value={this.state.currencySearchTerm}
          onChange={this.updateSearchTerm}
          onCancel={this.closeSearchModal}
          onSubmit={this.onCurrencySearchSubmit}
          disabled={this.state.loading}
        />
        {mainComponent}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mainPathArray: state.navigation.mainPathArray,
    activatedCoins: state.coins.activatedCoins,
    fiatPrices: state.ledger.fiatPrices,
    fiatCurrency: state.settings.config.general.main.fiatCurrency,
    activeUser: state.users.activeUser,
    allCurrencies: state.ledger.allCurrencies,
    identities: state.ledger.identities,
    mainTraversalHistory: state.navigation.mainTraversalHistory
  };
};

export default connect(mapStateToProps)(Multiverse);