import React from 'react';
import { connect } from 'react-redux';
import { 
    launchSimplecrowdfundFormRender
} from './launchSimplecrowdfundForm.render';
import {
  WARNING_SNACK,
  TXDATA_STATUS,
  TXDATA_ERROR,
  CONFIRM_DATA,
  ERROR_INVALID_Z_ADDR,
  NATIVE,
  ERROR_INVALID_ADDR,
  ERROR_INVALID_ID,
  ENTER_DATA,
  LONG_ALERT,
  CREATE_SIMPLE_CROWDFUND
} from "../../../../util/constants/componentConstants";
import { newSnackbar } from '../../../../actions/actionCreators';
import { checkAddrValidity } from '../../../../util/addrUtils';

class launchSimplecrowdfundForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      extra: { min_amount : 0,
        max_amount : 0,
        receiveaddress :''
        },              //TODO define more params for the crowdfund in here
      formErrors: {
        name: [],
        primaryAddress: [],
        revocationId: [],
        recoveryId: [],
        privateAddr: []
      },
      txDataDisplay: {},
      go: false
    };

    this.updateFormData = this.updateFormData.bind(this);
    //this.updateControlAddr = this.updateControlAddr.bind(this)
    this.setAndUpdateState = this.setAndUpdateState.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.updateFormErrors = this.updateFormErrors.bind(this);
    this.generateTxDataDisplay = this.generateTxDataDisplay.bind(this);
    this.initFormData = this.initFormData.bind(this);
  }

  handleRender() {
   setTimeout(() => {
      this.props.advanceFormStep_trigger()
    }, 1500);
    setTimeout(() => {
      this.props.advanceFormStep_trigger()
    }, 2500);
  }

  componentWillMount() {
    if (Object.keys(this.props.txData).length > 0) {
      this.generateTxDataDisplay();
    }
  }

  componentDidMount() {
    const { formStep, identity } = this.props

    if (formStep === ENTER_DATA) {
      this.initFormData();
    }
    
  }

  initFormData() {
   const { namereservation, extra} 
   = this.props.nameCommitmentObj;

    const {
      name
    } = namereservation;

    this.setState(
      {
        name: `${name}@`,
        extra
      },
      () => {
        this.updateFormErrors(this.updateFormData);
      }
    );
    this.handleRender();
  }

  componentDidUpdate(lastProps) {
    const { formStep, identity, setContinueDisabled } = this.props;

    if (lastProps.formStep !== formStep && formStep === ENTER_DATA) {
      setContinueDisabled(true)

      if (identity != null) {
        this.initFormData()
      }
    }

  
  }

  generateWarningSnack(warnings) {
    this.props.dispatch(newSnackbar(WARNING_SNACK, warnings[0].message, LONG_ALERT));
  }

  generateTxDataDisplay() {
    const { txData, formStep } = this.props;

    const {
      chainTicker,
      name,
      extra,
      resulttxid,
      warnings
    } = txData;

    let txDataSchema = {
      ["Status:"]: formStep === CONFIRM_DATA ? null : txData[TXDATA_STATUS],
      ["Error:"]: txData[TXDATA_ERROR],
      ["crowdfund Name:"]: name,
      ["Chain:"]: chainTicker,
      ["Transaction ID:"]: resulttxid,
      ["Allocation Address:"]: extra,
      ["Amount of crowdfunds:"]: extra   // TODO
    };

    Object.keys(txDataSchema).forEach(txDataKey => {
      if (txDataSchema[txDataKey] == null) delete txDataSchema[txDataKey];
    });

    if (formStep === CONFIRM_DATA && warnings && warnings.length > 0) {
      this.generateWarningSnack(warnings);
    }

    this.setState({ txDataDisplay: txDataSchema });
  }

  updateFormErrors(cb) {
    //TODO: Add more errors in here by checking controlAddr and referralId
    const { setContinueDisabled, activeCoin } = this.props;
    const {
      name
    } = this.state;
    let formErrors = {
      name: [],
      primaryAddress: [],
      revocationId: [],
      recoveryId: [],
      privateAddr: []
    };


    this.setState({ formErrors }, () => {
      setContinueDisabled(
        !Object.keys(this.state.formErrors).every(formInput => {
          return this.state.formErrors[formInput].length == 0;
        }) ||
          name.length === 0
      );
      if (cb != null) cb();
    });
  }

  setAndUpdateState(stateModifiers) {
    this.setState(stateModifiers, () => {
      this.updateFormErrors();
      this.updateFormData();
    });
  }

  updateInput(e) {
    this.setAndUpdateState({ [e.target.name]: e.target.value });
  }

  updateFormData() {
    const { chainTicker } = this.props
    const { name, extra } = this.state

    this.props.setFormData({
      chainTicker,
      name,
      extra
    });
  }

  render() {
    return launchSimplecrowdfundFormRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[CREATE_SIMPLE_CROWDFUND]

  return {
    identity: state.modal[CREATE_SIMPLE_CROWDFUND].identity,
    addresses: state.ledger.addresses,
    activeCoin: state.coins.activatedCoins[chainTicker],
  };
};

export default connect(mapStateToProps)(launchSimplecrowdfundForm);