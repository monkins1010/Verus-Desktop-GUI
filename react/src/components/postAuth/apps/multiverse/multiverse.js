import React from 'react';
import { connect } from 'react-redux';
import {
  DASHBOARD,
  NATIVE,
  ERROR_SNACK,
  SUCCESS_SNACK,
  MID_LENGTH_ALERT,
  IS_PBAAS,
} from "../../../../util/constants/componentConstants";
import Dashboard from './dashboard/dashboard'
import {
  MultiverseCardRender,
  MultiverseTabsRender
} from './multiverse.render'
import { setMainNavigationPath, setModalNavigationPath, newSnackbar } from '../../../../actions/actionCreators'
import FormDialog from '../../../../containers/FormDialog/FormDialog'
import { getCurrency } from '../../../../util/api/wallet/walletCalls'
import { openCurrencyCard } from '../../../../actions/actionDispatchers';

const COMPONENT_MAP = {
  [DASHBOARD]: <Dashboard />,
}

class Multiverse extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currencySearchOpen: false,
      loading: false
    }
    
    this.setCards = this.setCards.bind(this)
    this.setTabs = this.setTabs.bind(this)
    this.updateSearchTerm = this.updateSearchTerm.bind(this)
    this.closeSearchModal = this.closeSearchModal.bind(this)
    this.openSearchModal = this.openSearchModal.bind(this)
    this.onCurrencySearchSubmit = this.onCurrencySearchSubmit.bind(this)
    this.setTabs()
  }

  componentDidMount() {
    //Set default navigation path to dashboard if wallet is opened without a sub-navigation location
    if (!this.props.mainPathArray[3]) 
    this.props.dispatch(setMainNavigationPath(`${this.props.mainPathArray.join('/')}/${DASHBOARD}`)) 
  }

  updateSearchTerm(term) {
    this.setState({ currencySearchTerm: term })
  }

  closeSearchModal() {
    this.setState({ currencySearchOpen: false })
  }

  openSearchModal(chain) {
    this.setState({ currencySearchOpen: true, searchChain: chain })
  }

  onCurrencySearchSubmit() {
    this.setState({loading: true}, () => {
      getCurrency(NATIVE, this.state.searchChain, this.state.currencySearchTerm)
      .then(res => {
        if (res.msg === 'success') {
          this.props.dispatch(newSnackbar(SUCCESS_SNACK, `${this.state.currencySearchTerm} found!`, MID_LENGTH_ALERT))
          openCurrencyCard(res.result, this.state.searchChain, this.props.identities[this.state.searchChain])
          this.setState({ loading: false, currencySearchOpen: false, currencySearchTerm: '' })
        } else {
          this.props.dispatch(newSnackbar(ERROR_SNACK, res.result))
          this.setState({ loading: false })
        }
      })
      .catch(err => {
        this.props.dispatch(newSnackbar(ERROR_SNACK, err.message))
        this.setState({ loading: false })
      })
    })
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
      this.setCards(this.props.activatedCoins)
    }
  }

  /**
   * Sets the wallet coin cards by mapping over the provided identity compatible coins
   * @param {Object} activatedCoins 
   */
  setCards(activatedCoins) {
    const { setCards } = this.props
    
    const updateCards = () => {
      const verusProtocolCoins = Object.values(activatedCoins).filter((coinObj) => {
        return coinObj.options.tags.includes(IS_PBAAS)
      })
  
      setCards(verusProtocolCoins.map((coinObj) => {
        return MultiverseCardRender.call(this, coinObj)
      }))
    }

    updateCards()
  }

  setTabs() {
    this.props.setTabs(MultiverseTabsRender.call(this))
  }

  render() {
    const walletApp = this.props.mainPathArray[3] ? this.props.mainPathArray[3] : null
    let component = null

    if (walletApp && COMPONENT_MAP[walletApp]) component = COMPONENT_MAP[walletApp]

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
        { component }
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
    identities: state.ledger.identities
  };
};

export default connect(mapStateToProps)(Multiverse);