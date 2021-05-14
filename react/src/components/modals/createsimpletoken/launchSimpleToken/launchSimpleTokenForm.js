import React from 'react';
import { connect } from 'react-redux';
import { 
    launchSimpleTokenFormRender
} from './launchSimpleTokenForm.render';
import {
  WARNING_SNACK,
  TXDATA_STATUS,
  TXDATA_ERROR,
  CONFIRM_DATA,
  CREATE_SIMPLE_TOKEN,
  ERROR_INVALID_Z_ADDR,
  ENTER_DATA,
  ERROR_INVALID_ID,
  PRIVATE_ADDRS,
  LONG_ALERT
} from "../../../../util/constants/componentConstants";
import { newSnackbar } from '../../../../actions/actionCreators';

class LaunchSimpleTokenForm extends React.Component {
  constructor(props) {
    super(props);
    this.initFormData = this.initFormData.bind(this)
    if (props.formStep === ENTER_DATA) this.initFormData(props)

    // TODO: Let the user create an ID with more then one address
    const { addresses, chainTicker } = props

    const initAddresslist = () => {
      let addressList = addresses[chainTicker] == null ? [] : addresses[chainTicker][PRIVATE_ADDRS].map(addressObj => {
        return {
          label: `${addressObj.address} (${addressObj.balances.native} ${chainTicker})`,
          address: addressObj.address,
          balance: addressObj.balances.native
        }
      })

      return addressList
    }

    const addressListFormatted = initAddresslist()

    this.state = {
      addrList: addressListFormatted,
      revocationId: '',
      recoveryId: '',
      privateAddr: '',
      formErrors: {
        revocationId: [],
        recoveryId: [],
        privateAddr: [],
      },
      txDataDisplay: {}
    }

    this.updateFormData = this.updateFormData.bind(this)
    //this.updateControlAddr = this.updateControlAddr.bind(this)
    this.setAndUpdateState = this.setAndUpdateState.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.generateTxDataDisplay = this.generateTxDataDisplay.bind(this)


  }

  componentWillMount() {
    if (Object.keys(this.props.txData).length > 0) {
      this.generateTxDataDisplay()
    }
  }

  componentDidUpdate(lastProps) {
    const { formStep } = this.props
    
    if (lastProps.formStep !== formStep && formStep === ENTER_DATA) {
      this.initFormData(this.props)
      this.updateFormData()
    }
  }

  initFormData(props) {
    const { chainTicker, nameCommitmentObj, setContinueDisabled } = props
    const { txid, namereservation, controlAddress } = nameCommitmentObj
    const { salt, referral, nameid, name } = namereservation

    props.setFormData({
      chainTicker,
      name,
      txid,
      controlAddress,
      salt,
      referralId: !referral || referral.length === 0 ? null : referral,
      nameid,
    })
  }

  /*updateControlAddr(value) {
    this.setAndUpdateState({ controlAddr: value })
  }*/

  generateWarningSnack(warnings) {    
    this.props.dispatch(newSnackbar(WARNING_SNACK, warnings[0].message, LONG_ALERT))
  }


  generateTxDataDisplay() {
    const { txData, formStep } = this.props

    const {
      privateaddress,
      recoveryauthority,
      revocationauthority,
      primaryaddress,
      resulttxid,
      name,
      chainTicker,
      warnings
    } = txData;

    let txDataSchema = {
      ["Status:"]: formStep === CONFIRM_DATA ? null : txData[TXDATA_STATUS],
      ["Error:"]: txData[TXDATA_ERROR],
      ["Est. Cost:"]: txData[TXDATA_ERROR] ? null : (txData.referral ? `80 ${chainTicker}` : `100 ${chainTicker}`),
      ["Referral:"]: txData.referral,
      ["Name:"]: name,
      ["Chain:"]: chainTicker,
      ["Transaction ID:"]: resulttxid,
      ["Primary Address:"]: primaryaddress,
      ["Revocation ID:"]: revocationauthority,
      ["Recovery ID:"]: recoveryauthority,
      ["Private Address:"]: privateaddress
    };

    Object.keys(txDataSchema).forEach(txDataKey => {
      if (txDataSchema[txDataKey] == null) delete txDataSchema[txDataKey]
    })

    if (formStep === CONFIRM_DATA && warnings && warnings.length > 0) {
      this.generateWarningSnack(warnings)
    }

    this.setState({ txDataDisplay: txDataSchema })
  }

 

  setAndUpdateState(stateModifiers) {
    this.setState(stateModifiers, () => {
      this.updateFormData()
    })
  }

  updateInput(e) {    
    this.setAndUpdateState({ [e.target.name]: e.target.value })
  }

  updateFormData() {
    const { revocationId, recoveryId, privateAddr } = this.state;

    this.props.setFormData({
      ...this.props.formData,
      revocationAuthority: revocationId,
      recoveryAuthority: recoveryId,
      privateAddress: privateAddr
    });
  }

  render() {
    return launchSimpleTokenFormRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[CREATE_SIMPLE_TOKEN]

  return {
    addresses: state.ledger.addresses,
    activeCoin: state.coins.activatedCoins[chainTicker],
    identities: state.ledger.identities[chainTicker]
  };
};

export default connect(mapStateToProps)(LaunchSimpleTokenForm);