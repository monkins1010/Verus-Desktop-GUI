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
  ERROR_CURRENCY_NAME_REQUIRED,
  ERROR_CROWDFUND_NAME_REQUIRED,
  ERROR_INVALID_ID,
  ENTER_DATA,
  LONG_ALERT,
  ERROR_INVALID_ADDR
} from "../../../../util/constants/componentConstants";
import { newSnackbar } from '../../../../actions/actionCreators';
import { checkPublicAddress } from '../../../../util/addrUtils';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

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
      addrList: addressListFormatted,
      name: '',
      options: null,
      advanced:{
        idregistrationprice: null,
        idReferalLevels: null,
        notariesforchain: null,
        minnotariesconfirm: null,
        notarizationreward: null,
        billingperiod: null,
        proofprotocol: null,
        startblock: null,
        endblock: null,
        currencies: null,
        conversions: null,
        minpreconversion: null,
        maxpreconversion: null,
        initialcontributions: null,
        prelaunchdiscount: null,
        initialsupply: null,
        prelaunchcarveouts: null,
        preallocations: null,
        reward: null,
        decay: null,
        halving: null,
        eraend: null,
        nodes: null,
        nodeidentity: null,
        gatewayconvertername: null,
        gatewayconverterissuance: null,
        gatewayinitialsupply: null,
        gatewayinitialcontributions: null}
      ,
      checked: [null,null,null,null,null,null,null,null,null,null,null],
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
    this.setAndUpdateStateAdvanced = this.setAndUpdateStateAdvanced.bind(this)
    this.setAndUpdateChecked = this.setAndUpdateChecked.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.updateInputAdvanced = this.updateInputAdvanced.bind(this)
    this.updateChecked = this.updateChecked.bind(this)
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


  createCheckbox = (label,i) => (
    <FormControlLabel
    control={<Checkbox checked={this.state.checked[i]} onChange={this.updateChecked} name={i} color="primary"/>}
    label={`${label}`}
  />
  )
  createCheckboxes = () => (
    <FormGroup row>
   {items.map(this.createCheckbox)}
    </FormGroup>
  )


  generateTxDataDisplay() {
    const { txData, formStep, formData } = this.props
    const {advanced, options} = formData
    const { namereservation, name, chainTicker } = txData

    

    let txDataSchema = {
      ["Status:"]: formStep === CONFIRM_DATA ? null : txData[TXDATA_STATUS],
      ["Error:"]: txData[TXDATA_ERROR],
      ["Chain:"]: chainTicker,
      ["Name of currency to be created:"]: name,
      ["Options:"]: options,
      ["Name Address:"]: namereservation ? namereservation.nameid : null,
      ["Referral ID:"]: namereservation && namereservation.referral && namereservation.referral.length > 0 ? namereservation.referral : null,
      
    };

    for (const key in advanced) {

      txDataSchema[key]= advanced[key]  ; 
    }

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
      formErrors.name.push(ERROR_CURRENCY_NAME_REQUIRED)
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
  
  setAndUpdateChecked(stateModifiers) {
    var key = Object.keys(stateModifiers)[0];
    var array = [...this.state.checked];
    array[parseInt(key,10)] = stateModifiers[key];

    var total =0;

    array.forEach((key, index) => {
      total += key == true ? Math.pow(2,index) : 0;
    });


    this.setState({checked: array, options: total }, () => {
      this.updateFormErrors()
      this.updateFormData()
    })
  }

  setAndUpdateStateAdvanced(stateModifiers) {
    var key = Object.keys(stateModifiers)[0];
    this.setState({advanced: {...this.state.advanced, [key]:stateModifiers[key]} }, () => {
      this.updateFormErrors()
      this.updateFormData()
    })
  }

  updateChecked(e, value = false) {
    this.setAndUpdateChecked({
      [e.target.name]:
        value === false ? e.target.checked : value == null ? "" : value,
    });
  }

  updateInput(e, value = false) {
    this.setAndUpdateState({
      [e.target.name]:
        value === false ? e.target.value : value == null ? "" : value,
    });
  }

  updateInputAdvanced(e, value = false) {
    this.setAndUpdateStateAdvanced({
      [e.target.name]:
        value === false ? e.target.value : value == null ? "" : value,
    });
  }

  updateFormData() {
    const { chainTicker } = this.props
    const { name, options, advanced } = this.state

    this.props.setFormData({
      chainTicker,
      name,
      options, 
      advanced
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