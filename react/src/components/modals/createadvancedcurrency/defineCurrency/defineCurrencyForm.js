import React from 'react';
import { connect } from 'react-redux';
import { 
    DefineCurrencyFormRender
} from './defineCurrencyForm.render';
import {
  PUBLIC_ADDRS,
  WARNING_SNACK,
  TXDATA_STATUS,
  TXDATA_ERROR,
  TXDATA_TXID,
  CONFIRM_DATA,
  CREATE_IDENTITY,
  CREATE_ADVANCED_CURRENCY,
  ERROR_NAME_REQUIRED,
  ERROR_KICKSTART_NAME_REQUIRED,
  ERROR_INVALID_ID,
  ENTER_DATA,
  LONG_ALERT,
  ERROR_INVALID_ADDR
} from "../../../../util/constants/componentConstants";
import { newSnackbar } from '../../../../actions/actionCreators';
import { checkPublicAddress } from '../../../../util/addrUtils';

const items = [
    'Fractional',
    'ID Restricted',
    'ID Staking',
    'ID Referals',
    'ID Referals Reruired',
    'Token',
    'Can be reserve',
    'Fees as Reserve',
    'Gateway',
    'Is PBaaS',
    'Is PBaaS convertor'
  ];

class DefineCurrencyForm extends React.Component {
  constructor(props) {
    super(props);
    // TODO: Let the user create an ID with more then one address
    const { addresses, chainTicker } = props

    const initAddresslist = () => {
      let addressList =
        addresses[chainTicker] == null
          ? []
          : addresses[chainTicker][PUBLIC_ADDRS].filter(
              (addr) => addr.tag === PUBLIC_ADDRS
            ).map((addressObj) => {
              return {
                label: `${addressObj.address} (${addressObj.balances.native} ${chainTicker})`,
                address: addressObj.address,
                balance: addressObj.balances.native,
              };
            });

      return addressList
    }

    const addressListFormatted = initAddresslist()



    this.state = {
      optionsisChecked: [false,false,false,false,false,false,false,false,false,false,false],
      addrList: addressListFormatted,
      name: '',
      referralId: '',
      primaryAddress: '',
      min_amount : 0,
      max_amount : 0,
      receiveaddress : '', //TODO define more params for the kickstarter in here
      blockheight: 0,
      receiveamount: 0,
      formErrors: {
        referralId: [],
        name: [],
        primaryAddress: '',
        extra: []
      },
      txDataDisplay: {}
    }

    this.updateFormData = this.updateFormData.bind(this)
    this.setAndUpdateState = this.setAndUpdateState.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.updateFormErrors = this.updateFormErrors.bind(this)
    this.generateTxDataDisplay = this.generateTxDataDisplay.bind(this)
  }

  componentDidMount() {
    if (Object.keys(this.props.txData).length > 0) {
      this.generateTxDataDisplay()
    }

    if (this.props.commitmentData != null) {
      const { name, referralId } = this.props.commitmentData

      this.setAndUpdateState({ name, referralId: referralId == null ? '' : referralId })
    }
  }

  componentDidUpdate(lastProps) {
    const { formStep, setContinueDisabled } = this.props
    
    if (lastProps.formStep !== formStep && formStep === ENTER_DATA) {
      setContinueDisabled(true)
      this.updateFormData()
    }
  }

  generateWarningSnack(warnings) {    
    this.props.dispatch(newSnackbar(WARNING_SNACK, warnings[0].message, LONG_ALERT))
  }


  createCheckbox = label => (
    <label style={{ marginRight: 10}}>
        <input
        type="checkbox"
        value={label}
        style={{ marginRight: 3}}
        />
        {label}
    </label>
  )
  createCheckboxes = () => (
    items.map(this.createCheckbox)
  )


  generateTxDataDisplay() {
    const { txData, formStep, formData } = this.props

    const { namereservation, controlAddress } = txData

    const {min_amount, receiveamount,  max_amount, receiveaddress, blockheight} = formData.extra

    let txDataSchema = {
      ["Status:"]: formStep === CONFIRM_DATA ? null : txData[TXDATA_STATUS],
      ["Error:"]: txData[TXDATA_ERROR],
      ["Chain:"]: txData.coin,
      ["Transaction ID:"]: txData[TXDATA_TXID],
      ["Control Address:"]: controlAddress,
      ["Name of Kickstart to be created:"]: namereservation ? namereservation.name : null,
      ["Name Address:"]: namereservation ? namereservation.nameid : null,
      ["Referral ID:"]: namereservation && namereservation.referral && namereservation.referral.length > 0 ? namereservation.referral : null,
      ["Minimum amount before Kickstart Launches:"]: min_amount,
      ["Maximum amount for Kickstart Launch:"]: max_amount,
      ["Blockheight Project to launch at"]: blockheight,
      ["Addresses Kickstarts issued to:"]: receiveaddress,
      ["Kickstart pre-allocation amount "]: receiveamount


    };

    Object.keys(txDataSchema).forEach(txDataKey => {
      if (txDataSchema[txDataKey] == null) delete txDataSchema[txDataKey]
    })

    if (formStep === CONFIRM_DATA && txData.warnings && txData.warnings.length > 0) {
      this.generateWarningSnack(txData.warnings)
    }

    this.setState({ txDataDisplay: txDataSchema })
  }

  updateFormErrors() {
    //TODO: Add more errors in here by checking referralId
    const { setContinueDisabled, activeCoin } = this.props
    const { referralId, name, primaryAddress, extra } = this.state
    let formErrors = {
      referralId: [],
      name: [],
      primaryAddress: [],
      extra: []
    }

    if (name != null && name.length == 0) {
      formErrors.name.push(ERROR_KICKSTART_NAME_REQUIRED)
    }  

    if (
      referralId != null &&
      referralId.length > 0 &&
      referralId[referralId.length - 1] !== "@" &&
      referralId[0] !== "i"
    ) {
      formErrors.referralId.push(ERROR_INVALID_ID);
    }

    if (
      primaryAddress != null &&
      primaryAddress.length > 0 &&
      !checkPublicAddress(primaryAddress, activeCoin.id)
    ) {
      formErrors.primaryAddress.push(ERROR_INVALID_ADDR);
    }

    this.setState({ formErrors }, () => {
      setContinueDisabled(!Object.keys(this.state.formErrors).every((formInput) => {
        return (this.state.formErrors[formInput].length == 0)
      }) || name.length === 0 )  //TODO
    })
  }

  setAndUpdateState(stateModifiers) {
    this.setState(stateModifiers, () => {
      this.updateFormErrors()
      this.updateFormData()
    })
  }

  updateInput(e, value = false) {
    this.setAndUpdateState({
      [e.target.name]:
        value === false ? e.target.value : value == null ? "" : value,
    });
  }

  updateFormData() {
    const { chainTicker } = this.props
    const { name, referralId, primaryAddress, min_amount, receiveamount,  max_amount, receiveaddress, blockheight } = this.state

    this.props.setFormData({
      chainTicker,
      name,
      referralId,
      primaryAddress,
      extra :{ min_amount, receiveamount,  max_amount, receiveaddress, blockheight, tokenState: 0, type: "SIMPLEKICKSTART"}
    });
  }

  render() {
    return DefineCurrencyFormRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[CREATE_ADVANCED_CURRENCY]

  return {
    addresses: state.ledger.addresses,
    activeCoin: state.coins.activatedCoins[chainTicker],
    identities: state.ledger.identities[chainTicker],
    info: state.ledger.info[chainTicker],
  };
};

export default connect(mapStateToProps)(DefineCurrencyForm);