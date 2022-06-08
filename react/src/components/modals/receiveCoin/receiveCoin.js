import React from 'react';
import { connect } from 'react-redux';
import { 
  ReceiveCoinRender
} from './receiveCoin.render';
import {
  RECEIVE_COIN,
  Z_ONLY,
  PUBLIC_ADDRS,
  PRIVATE_ADDRS,
  SAPLING_ADDR,
  NATIVE,
  IS_ZCASH,
  COPY_PRIVKEY,
  COPY_PUBKEY,
  GENERATE_QR,
  SPROUT_ADDR,
  API_GET_ADDRESSES,
  ERROR_SNACK,
  SUCCESS_SNACK,
  MID_LENGTH_ALERT,
  PRIVATE_BALANCE,
  API_SUCCESS,
  API_ABORTED,
  REVEAL_PRIVKEY
} from "../../../util/constants/componentConstants";
import { expireData, newSnackbar } from '../../../actions/actionCreators'
import { conditionallyUpdateWallet } from '../../../actions/actionDispatchers'
import { getPrivkey, getPubkey, createAddress } from '../../../util/api/wallet/walletCalls'
import Store from '../../../store'

class ReceiveCoin extends React.Component {
  constructor(props) {
    super(props);
    this.setAddrMode = this.setAddrMode.bind(this)
    this.filterAddresses = this.filterAddresses.bind(this)
    this.setInput = this.setInput.bind(this)
    this.generateAddressOptions = this.generateAddressOptions.bind(this)
    this.getKey = this.getKey.bind(this)
    this.selectAddressOption = this.selectAddressOption.bind(this)
    this.getNewAddress = this.getNewAddress.bind(this)
    this.scrollToBottomAddress = this.scrollToBottomAddress.bind(this)
    this.toggleAddressQr = this.toggleAddressQr.bind(this)
    this.clearAddrSearch = this.clearAddrSearch.bind(this)
    this.updateModalButtons = this.updateModalButtons.bind(this)

    this.isIdentity = props.modalProps.identity != null

    if (this.isIdentity) {
      this.idZAddrs = props.modalProps.identity.addresses[PRIVATE_ADDRS]
      this.idIAddrs = props.modalProps.identity.addresses[PUBLIC_ADDRS]
      this.idAddrs = {
        [PUBLIC_ADDRS]: this.idIAddrs,
        [PRIVATE_ADDRS]: this.idZAddrs
      }
    }

    this.state = {
      selectedMode:
        props.modalProps.balanceTag === PRIVATE_BALANCE
          ? PRIVATE_ADDRS
          : PUBLIC_ADDRS,
      addresses: this.isIdentity
        ? this.idAddrs
        : props.addresses
        ? props.addresses
        : {
            [PUBLIC_ADDRS]: [],
            [PRIVATE_ADDRS]: [],
          },
      addressSearchTerm: "",
      balanceCurr: props.selectedCurrency,
      qrAddress: null,
      showingPrivkey: false,
      showZeroBalances:
        props.activeCoin.mode !== NATIVE ||
        this.isIdentity ||
        props.config.general.native.defaultShowEmptyAddrs,
    };

    this.supportedTypes = {
      [PUBLIC_ADDRS]:
        this.isIdentity || !props.activeCoin.options.tags.includes(Z_ONLY),
      [PRIVATE_ADDRS]:
        (this.isIdentity && this.idZAddrs.length > 0) ||
        (!this.isIdentity && props.activeCoin.mode === NATIVE &&
          props.activeCoin.options.tags.includes(IS_ZCASH))
    };

    props.setModalHeader("Manage my addresses")
    props.setModalIcon('assets/images/icons/modal_icons/my-addresses-icon.svg')
    this.updateModalButtons(props)
  }

  async componentDidMount() {
    if (!this.isIdentity) {
      const stateSnapshot = Store.getState()
      const { supportedTypes, props, state } = this
      const { dispatch, activeCoin, config } = props
      const { addresses } = state
      const { mode, id } = activeCoin
  
      const updateResult = await conditionallyUpdateWallet(stateSnapshot, dispatch, mode, id, API_GET_ADDRESSES)
  
      if ((updateResult === API_SUCCESS || updateResult === API_ABORTED) &&
        supportedTypes[PRIVATE_ADDRS] && 
        !config.coin.native.excludePrivateAddrs[id] && 
        addresses[PUBLIC_ADDRS].length > 0 &&
        addresses[PRIVATE_ADDRS].length === 0) {
        this.getNewAddress(PRIVATE_ADDRS, true)
      }
    }
  }

  componentDidUpdate(lastProps, lastState) {
    if (
      lastState.selectedMode !== this.state.selectedMode ||
      lastState.qrAddress !== this.state.qrAddress
    )
      this.updateModalButtons(this.props);
  }

  componentWillUnmount() {
    this.props.setModalIcon(null)
  }

  updateModalButtons(props) {
    let modalButtons = []

    if (this.supportedTypes[PUBLIC_ADDRS]) {
      modalButtons.push({
        onClick: () => this.setAddrMode(PUBLIC_ADDRS),
        isActive: this.state.selectedMode === PUBLIC_ADDRS,
        label: "Public",
        isDisabled: this.state.qrAddress
      })
    }

    if (this.supportedTypes[PRIVATE_ADDRS]) {
      modalButtons.push({
        onClick: () => this.setAddrMode(PRIVATE_ADDRS),
        isActive: this.state.selectedMode === PRIVATE_ADDRS,
        label: "Private",
        isDisabled: this.state.qrAddress
      })
    }

    props.setModalButtons(modalButtons);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.isIdentity) {
      if (nextProps.addresses != this.props.addresses) {
        if (this.state.addressSearchTerm.length > 0) {
          this.filterAddresses(nextProps.addresses)
        } else {
          this.setState({ addresses: nextProps.addresses })
        }
      }
    }
  }

  scrollToBottomAddress() {
    this.table.scrollToRow(this.state.addresses[this.state.selectedMode].length - 1);
  }

  toggleAddressQr(address, privKey = false) {
    this.setState({
      qrAddress: this.state.qrAddress ? null : address,
      showingPrivkey: privKey ? !this.state.showingPrivkey : false,
    });
  }

  filterAddresses(addresses) {
    const { addressSearchTerm } = this.state
    const term = addressSearchTerm.toLowerCase()
    
    const newPrivate = addresses[PRIVATE_ADDRS].filter((addr) => {
      const tag = addr.tag.toLowerCase()

      if (tag.includes(term) || term.includes(tag)) return true
      if (addr.balances != null && addr.balances.native.toString().includes(term)) return true
      if (addr.address.toLowerCase().includes(term)) return true
    })

    const newPublic = addresses[PUBLIC_ADDRS].filter((addr) => {
      const tag = addr.tag.toLowerCase()

      if (tag.includes(term) || term.includes(tag)) return true
      if (addr.balances != null && addr.balances.native.toString().includes(term)) return true
      if (addr.balances != null && Object.keys(addr.balances.reserve).includes(term)) return true
      if (addr.address.toLowerCase().includes(term)) return true
    })

    this.setState({addresses: {
      [PUBLIC_ADDRS]: newPublic,
      [PRIVATE_ADDRS]: newPrivate
    }})
  }

  clearAddrSearch() {
    this.setState({
      addresses: this.props.addresses,
      addressSearchTerm: ''
    })
  }

  getKey(address, keyType) {
    const { mode, id } = this.props.activeCoin

    if (keyType === COPY_PRIVKEY) {
      getPrivkey(mode, id, address)
      .then((res) => {
        if (res.msg === 'error') throw new Error(res.result)
        else {
          this.props.dispatch(newSnackbar(SUCCESS_SNACK, "Private key copied, keep it safe.", MID_LENGTH_ALERT))
          navigator.clipboard.writeText(res.result)
        }
      })
      .catch(e => {
        this.props.dispatch(newSnackbar(ERROR_SNACK, e.message))
        console.error(e.message)
      })
    } else if (keyType === COPY_PUBKEY) {
      getPubkey(mode, id, address)
      .then((res) => {
        if (res.msg === 'error') throw new Error(res.result)
        else {
          this.props.dispatch(newSnackbar(SUCCESS_SNACK, "Public key copied!", MID_LENGTH_ALERT))
          navigator.clipboard.writeText(res.result)
        }
      })
      .catch(e => {
        this.props.dispatch(newSnackbar(ERROR_SNACK, e.message))
        console.error(e.message)
      })
    } else if (keyType === REVEAL_PRIVKEY) {
      getPrivkey(mode, id, address)
      .then((res) => {
        if (res.msg === 'error') throw new Error(res.result)
        else {
          this.toggleAddressQr(res.result, true)
        }
      })
      .catch(e => {
        this.props.dispatch(newSnackbar(ERROR_SNACK, e.message))
        console.error(e.message)
      })
    }
  }

  generateAddressOptions(address) {
    let addressOptions = [GENERATE_QR]

    if (
      (address[0] === "i" || address.includes("@")) &&
      this.props.activeCoin.mode === NATIVE
    ) {
      return addressOptions;
    }
      
    addressOptions.push(REVEAL_PRIVKEY);
    addressOptions.push(COPY_PRIVKEY);
      
    if (this.props.activeCoin.mode === NATIVE) {
      if (address[0] !== 'z') addressOptions.push(COPY_PUBKEY)
    } 

    return addressOptions
  }

  selectAddressOption(address, addrOption) {
    if (
      addrOption === COPY_PUBKEY ||
      addrOption === COPY_PRIVKEY ||
      addrOption === REVEAL_PRIVKEY
    ) {
      this.getKey(address, addrOption);
    } else if (addrOption === GENERATE_QR) {
      this.toggleAddressQr(address);
    }
  }

  setAddrMode(mode) {
    this.setState({
      selectedMode: mode
    });
  }

  setInput(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  getNewAddress(type, muteSuccess) {
    const { mode, id } = this.props.activeCoin

    createAddress(mode, id, type === PRIVATE_ADDRS)
    .then(res => {
      if (res.msg === 'success') {
        const address = res.result
        //Generate new address obj and add to state to avoid table re-render
        const addressObj = {
          address: address,
          balances: {native: 0, reserve: {}},
          tag: type === PUBLIC_ADDRS ? PUBLIC_ADDRS : (address[1] === 's' ? SAPLING_ADDR : SPROUT_ADDR)
        }

        this.props.dispatch(expireData(id, API_GET_ADDRESSES))
        this.setState({
          addresses: {...this.state.addresses, [type]: [...this.state.addresses[type], addressObj]},
          addressSearchTerm: '',
          selectedMode: muteSuccess ? this.state.selectedMode : type
        }, () => {
          if (!muteSuccess) {
            this.props.dispatch(newSnackbar(SUCCESS_SNACK, `Address ${address} created!`))
            this.scrollToBottomAddress()
          }
        })
      } else {
        throw new Error(res.result)
      }
    })
    .catch(e => {
      this.props.dispatch(newSnackbar(ERROR_SNACK, e.message))
      console.error(e.message)
    })
  }

  render() {
    return ReceiveCoinRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[RECEIVE_COIN]

  return {
    activeCoin: state.coins.activatedCoins[chainTicker],
    addresses: state.ledger.addresses[chainTicker],
    includePrivate: !state.settings.config.coin.native.excludePrivateAddrs[chainTicker],
    balances: state.ledger.balances[chainTicker],
    modalProps: state.modal[RECEIVE_COIN],
    config: state.settings.config,
    whitelist: state.localCurrencyLists.whitelists[chainTicker] || [],
    selectedCurrency: state.users.activeUser.selectedCurrencyMap[chainTicker] || chainTicker
  };
};

export default connect(mapStateToProps)(ReceiveCoin);