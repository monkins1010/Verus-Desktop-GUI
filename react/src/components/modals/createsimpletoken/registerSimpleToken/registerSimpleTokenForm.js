import React from 'react';
import { connect } from 'react-redux';
import { 
    RegisterSimpleTokenFormRender
} from './registerSimpleTokenForm.render';
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

class RegisterSimpleTokenIdentityForm extends React.Component {
  constructor(props) {
    super(props);
    this.initFormData = this.initFormData.bind(this)
    
    if (props.formStep === ENTER_DATA) this.initFormData(props)

    
  }

  componentDidMount() {
    const { formStep,setContinueDisabled } = this.props

    if (formStep === ENTER_DATA) {
    setContinueDisabled(false)
    this.props.advanceFormStep_trigger()
    }

    if (formStep === CONFIRM_DATA) {
      this.props.advanceFormStep_trigger()
      setContinueDisabled(false)
      this.props.closeModal_trigger()
    }

  }

  initFormData() {
    const { chainTicker, nameCommitmentObj, addresses } = this.props
    const { txid, namereservation, controlAddress } = nameCommitmentObj
    const { salt, referral, nameid, name } = namereservation
    
    this.props.setFormData({
      chainTicker,
      name,
      txid,
      controlAddress,
      salt,
      referralId: !referral || referral.length === 0 ? null : referral,
      nameid,
      revocationId: `${namereservation.name}${
        chainTicker === "VRSC" || chainTicker === "VRSCTEST"
          ? ""
          : `.${chainTicker}`
      }@`,
      recoveryId:`${namereservation.name}${
        chainTicker === "VRSC" || chainTicker === "VRSCTEST"
          ? ""
          : `.${chainTicker}`
      }@`,
      privateAddr: addresses[chainTicker][PRIVATE_ADDRS][0].address,
     })
    }


  render() {
    return null;
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

export default connect(mapStateToProps)(RegisterSimpleTokenIdentityForm);