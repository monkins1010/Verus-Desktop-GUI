import React from 'react';
import { connect } from 'react-redux';
import {
  CreateSimplecrowdfundRender
} from './createsimplecrowdfund.render';
import {
  CREATE_SIMPLE_CROWDFUND,
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
  API_REGISTER_SIMPLE_CROWDFUND_ID,
  DEFAULT_REFERRAL_IDS,
  API_CREATE_SIMPLE_CROWDFUND,
  API_LAUNCH_SIMPLE_CROWDFUND
} from "../../../util/constants/componentConstants";
import { registerIdNameForFactory, registerId, launchSimplecrowdfund } from '../../../util/api/wallet/walletCalls';
import { newSnackbar, expireData } from '../../../actions/actionCreators';
import { conditionallyUpdateWallet } from '../../../actions/actionDispatchers';
import Store from '../../../store'

class CreateSimplecrowdfund extends React.Component {
  constructor(props) {
    super(props);
    const { activeCoin } = props
    const { name } = activeCoin

    switch (props.modalProps.modalType) {
      case API_CREATE_SIMPLE_CROWDFUND:
        props.setModalHeader(`Create Simple crowdfund on ${name} Blockchain`)
        break;
      case API_LAUNCH_SIMPLE_CROWDFUND:
          props.setModalHeader(`Launch Simple crowdfund on ${name} Blockchain called ${props.modalProps.nameCommitmentObj.namereservation.name}`)
          break;
      case API_REGISTER_SIMPLE_CROWDFUND_ID:
        props.setModalHeader(`Create ${name} ID for crowdfund of the same name: ${props.modalProps.nameCommitmentObj.namereservation.name}@`)
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
          controlAddress,
          referralId,
          txid,
          salt,
          revocationAuthority,
          recoveryAuthority,
          privateAddress,
          primaryAddress,
          extra
        } = formData;

        const _privateAddress =
          privateAddress == null || privateAddress.length === 0
            ? null
            : privateAddress;

        if (modalProps.modalType === API_CREATE_SIMPLE_CROWDFUND) {
            _txData = await registerIdNameForFactory(
              !formStep,
              chainTicker,
              name,
              (primaryAddress == null || primaryAddress.length === 0)
                ? null
                : primaryAddress,
              this.selectReferralIdentity(referralId),
              extra
            );
          } else if (modalProps.modalType === API_REGISTER_SIMPLE_CROWDFUND_ID) {
            _txData = await registerId(
              !formStep,
              chainTicker,
              name,
              txid,
              salt,
              [controlAddress], //primaryAddresses,
              1,                // minimumSignatures,
              {},               // contentmap,
              revocationAuthority,
              recoveryAuthority,
              _privateAddress,
              null,
              this.selectReferralIdentity(referralId)
            );
        } else if (modalProps.modalType === API_LAUNCH_SIMPLE_CROWDFUND) {
            _txData = await launchSimplecrowdfund(
              !formStep,
              chainTicker,
              name,
              extra 
            );        
            }

        this.props.setModalLock(false)
        if (_txData.msg === API_SUCCESS) {
          this.setState({ loadingProgress: 100 }, () => {
            if (formStep === CONFIRM_DATA) {
             if (modalProps.modalType === API_REGISTER_SIMPLE_CROWDFUND_ID) {
                this.props.dispatch(
                  newSnackbar(
                    INFO_SNACK,
                    `ID Mined onto the blockchain, please wait for ID to get confirmed.`
                  )
                );
              } else if (modalProps.modalType === API_CREATE_SIMPLE_CROWDFUND) {
                this.props.dispatch(
                  newSnackbar(
                    INFO_SNACK,
                    `Simple crowdfund ID Name committed. Please wait a few minutes for it to get confirmed`
                  )
                );
              } else if (modalProps.modalType === API_LAUNCH_SIMPLE_CROWDFUND) {
                this.props.dispatch(
                  newSnackbar(
                    SUCCESS_SNACK,
                    `Simple crowdfund Launching. Please wait up to 20 minutes for crowdfund to launch!`
                  )
                );
              } 

              // Expire transactions and balances
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_TRANSACTIONS))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_BALANCES))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_NAME_COMMITMENTS))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_IDENTITIES))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_LAUNCH_SIMPLE_CROWDFUND))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_CREATE_SIMPLE_CROWDFUND))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_REGISTER_SIMPLE_CROWDFUND_ID))
              conditionallyUpdateWallet(Store.getState(), this.props.dispatch, NATIVE, this.props.activeCoin.id, API_GET_TRANSACTIONS)
              conditionallyUpdateWallet(Store.getState(), this.props.dispatch, NATIVE, this.props.activeCoin.id, API_GET_NAME_COMMITMENTS)
            }

            this.setState({ loading: false, txData: {status: API_SUCCESS, ..._txData.result}, formStep: formStep + 1 })
          })
        } else {
          if (modalProps.modalType === API_REGISTER_SIMPLE_CROWDFUND_ID) {
            this.props.dispatch(newSnackbar(ERROR_SNACK, "Error creating ID."))
          } else if (modalProps.modalType === API_CREATE_SIMPLE_CROWDFUND) {
            this.props.dispatch(newSnackbar(ERROR_SNACK, "Error creating crowdfund."))
          } else if (modalProps.modalType === API_LAUNCH_SIMPLE_CROWDFUND) {
            this.props.dispatch(newSnackbar(ERROR_SNACK, "Error Launching crowdfund."))
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
    return CreateSimplecrowdfundRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[CREATE_SIMPLE_CROWDFUND]

  return {
    activeCoin: state.coins.activatedCoins[chainTicker],
    balances: state.ledger.balances[chainTicker],
    addresses: state.ledger.addresses[chainTicker],
    modalProps: state.modal[CREATE_SIMPLE_CROWDFUND]
  };
};

export default connect(mapStateToProps)(CreateSimplecrowdfund);
