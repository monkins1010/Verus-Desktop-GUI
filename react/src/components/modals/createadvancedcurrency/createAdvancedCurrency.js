import React from 'react';
import { connect } from 'react-redux';
import {
    CreateAdvancedCurrencyRender
} from './createAdvancedCurrency.render';
import {
  CREATE_ADVANCED_CURRENCY,
  ENTER_DATA,
  API_SUCCESS,
  ERROR_SNACK,
  API_ERROR,
  SUCCESS_SNACK,
  CONFIRM_DATA,
  API_GET_TRANSACTIONS,
  API_GET_BALANCES,
  INFO_SNACK,
  API_GET_NAME_COMMITMENTS,
  API_GET_IDENTITIES,
  MID_LENGTH_ALERT,
  NATIVE,
  DEFAULT_REFERRAL_IDS,
  API_CREATE_ADVANCED_CURRENCY
} from "../../../util/constants/componentConstants";
import { createAdvancedCurrencyFactory } from '../../../util/api/wallet/walletCalls';
import { newSnackbar, expireData } from '../../../actions/actionCreators';
import { conditionallyUpdateWallet } from '../../../actions/actionDispatchers';
import Store from '../../../store'

class CreateAdvancedCurrency extends React.Component {
  constructor(props) {
    super(props);
    const { activeCoin } = props
    const { name } = activeCoin

    switch (props.modalProps.modalType) {
      case API_CREATE_ADVANCED_CURRENCY:
        props.setModalHeader(`Create an advanced currency on ${name} Blockchain`)
        break;
      default:
        break;
    }

    this.state = {
      formStep: ENTER_DATA,
      txData: {},
      loading: false,
      loadingProgress: 0,
      formData: {},
      continueDisabled: true
    }

    this.advanceFormStep = this.advanceFormStep.bind(this)
    this.getFormData = this.getFormData.bind(this)
    this.back = this.back.bind(this)
    this.getContinueDisabled = this.getContinueDisabled.bind(this)
  }

  getFormData(formData) {
    this.setState({ formData })
  }

  getContinueDisabled(continueDisabled) {
    this.setState({ continueDisabled })
  }

  back() {
    this.setState({
      formStep: ENTER_DATA,
      txData: {},
      continueDisabled: true
    })
  }

  selectReferralIdentity(inputReferral) {
    if (inputReferral == null || inputReferral.length === 0) {
      return DEFAULT_REFERRAL_IDS[this.props.modalProps.chainTicker]
    } else return inputReferral
  }

  advanceFormStep() {
    const { modalProps, setModalLock } = this.props
    const { formStep, formData } = this.state
    let _txData

    setModalLock(true)
    this.setState({loading: true, loadingProgress: 99}, async () => {
      try {
        const {
          chainTicker,
          name,
          options,
          advanced
        } = formData;

       
        if (modalProps.modalType === API_CREATE_ADVANCED_CURRENCY) {
            _txData = await createAdvancedCurrencyFactory(
              !formStep,
              chainTicker,
              name,
              options,
              advanced
            );
          } 

        this.props.setModalLock(false)
        if (_txData.msg === API_SUCCESS) {
          this.setState({ loadingProgress: 100 }, () => {
            if (formStep === CONFIRM_DATA) {
             if (modalProps.modalType === API_CREATE_ADVANCED_CURRENCY) {
                this.props.dispatch(
                  newSnackbar(
                    INFO_SNACK,
                    `Currency Defined, please wait for currency to launch.`
                  )
                );
              } 

              // Expire transactions and balances
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_TRANSACTIONS))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_BALANCES))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_NAME_COMMITMENTS))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_IDENTITIES))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_CREATE_ADVANCED_CURRENCY))
              conditionallyUpdateWallet(Store.getState(), this.props.dispatch, NATIVE, this.props.activeCoin.id, API_GET_TRANSACTIONS)
              conditionallyUpdateWallet(Store.getState(), this.props.dispatch, NATIVE, this.props.activeCoin.id, API_GET_NAME_COMMITMENTS)
            }

            this.setState({ loading: false, txData: {status: API_SUCCESS, ..._txData.result}, formStep: formStep + 1 })
          })
        } else {
          if (modalProps.modalType === API_CREATE_ADVANCED_CURRENCY) {
            this.props.dispatch(newSnackbar(ERROR_SNACK, "Error creating Currency."))
          } 

          throw new Error(_txData.result)
        }
      } catch (e) {
        this.props.setModalLock(false)
        if (formStep === ENTER_DATA) {
          this.props.dispatch(newSnackbar(ERROR_SNACK, e.message))
          this.setState({ loading: false })
        } else {
          this.setState({ loading: false, txData: {status: API_ERROR, error: e.message}, formStep: formStep + 1 })
        }
      }
    })
  }

  render() {
    return CreateAdvancedCurrencyRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[CREATE_ADVANCED_CURRENCY]

  return {
    activeCoin: state.coins.activatedCoins[chainTicker],
    balances: state.ledger.balances[chainTicker],
    addresses: state.ledger.addresses[chainTicker],
    modalProps: state.modal[CREATE_ADVANCED_CURRENCY]
  };
};

export default connect(mapStateToProps)(CreateAdvancedCurrency);
