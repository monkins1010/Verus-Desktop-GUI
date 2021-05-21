import React from 'react';
import { connect } from 'react-redux';
import {
  CreateSimpleKickstartRender
} from './createsimpleKickstart.render';
import {
  CREATE_SIMPLE_KICKSTART,
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
  API_REGISTER_SIMPLE_KICKSTART_ID,
  DEFAULT_REFERRAL_IDS,
  API_CREATE_SIMPLE_KICKSTART,
  API_LAUNCH_SIMPLE_KICKSTART
} from "../../../util/constants/componentConstants";
import { registerIdNameForFactory, registerId, launchSimpleKickstart } from '../../../util/api/wallet/walletCalls';
import { newSnackbar, expireData } from '../../../actions/actionCreators';
import { conditionallyUpdateWallet } from '../../../actions/actionDispatchers';
import Store from '../../../store'

class CreateSimpleKickstart extends React.Component {
  constructor(props) {
    super(props);
    const { activeCoin } = props
    const { name } = activeCoin

    switch (props.modalProps.modalType) {
      case API_CREATE_SIMPLE_KICKSTART:
        props.setModalHeader(`Create Simple Kickstart on ${name} Blockchain`)
        break;
      case API_LAUNCH_SIMPLE_KICKSTART:
          props.setModalHeader(`Launch Simple Kickstart on ${name} Blockchain called ${props.modalProps.nameCommitmentObj.namereservation.name}`)
          break;
      case API_REGISTER_SIMPLE_KICKSTART_ID:
        props.setModalHeader(`Create ${name} ID for Kickstart of the same name: ${props.modalProps.nameCommitmentObj.namereservation.name}@`)
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

        if (modalProps.modalType === API_CREATE_SIMPLE_KICKSTART) {
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
          } else if (modalProps.modalType === API_REGISTER_SIMPLE_KICKSTART_ID) {
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
        } else if (modalProps.modalType === API_LAUNCH_SIMPLE_KICKSTART) {
            _txData = await launchSimpleKickstart(
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
             if (modalProps.modalType === API_REGISTER_SIMPLE_KICKSTART_ID) {
                this.props.dispatch(
                  newSnackbar(
                    INFO_SNACK,
                    `ID Mined onto the blockchain, please wait for ID to get confirmed.`
                  )
                );
              } else if (modalProps.modalType === API_CREATE_SIMPLE_KICKSTART) {
                this.props.dispatch(
                  newSnackbar(
                    INFO_SNACK,
                    `Simple Kickstart ID Name committed. Please wait a few minutes for it to get confirmed`
                  )
                );
              } else if (modalProps.modalType === API_LAUNCH_SIMPLE_KICKSTART) {
                this.props.dispatch(
                  newSnackbar(
                    SUCCESS_SNACK,
                    `Simple Kickstart Launching. Please wait up to 20 minutes for Kickstart to launch!`
                  )
                );
              } 

              // Expire transactions and balances
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_TRANSACTIONS))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_BALANCES))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_NAME_COMMITMENTS))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_GET_IDENTITIES))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_LAUNCH_SIMPLE_KICKSTART))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_CREATE_SIMPLE_KICKSTART))
              this.props.dispatch(expireData(this.props.activeCoin.id, API_REGISTER_SIMPLE_KICKSTART_ID))
              conditionallyUpdateWallet(Store.getState(), this.props.dispatch, NATIVE, this.props.activeCoin.id, API_GET_TRANSACTIONS)
              conditionallyUpdateWallet(Store.getState(), this.props.dispatch, NATIVE, this.props.activeCoin.id, API_GET_NAME_COMMITMENTS)
            }

            this.setState({ loading: false, txData: {status: API_SUCCESS, ..._txData.result}, formStep: formStep + 1 })
          })
        } else {
          if (modalProps.modalType === API_REGISTER_SIMPLE_KICKSTART_ID) {
            this.props.dispatch(newSnackbar(ERROR_SNACK, "Error creating ID."))
          } else if (modalProps.modalType === API_CREATE_SIMPLE_KICKSTART) {
            this.props.dispatch(newSnackbar(ERROR_SNACK, "Error creating Kickstart."))
          } else if (modalProps.modalType === API_LAUNCH_SIMPLE_KICKSTART) {
            this.props.dispatch(newSnackbar(ERROR_SNACK, "Error Launching Kickstart."))
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
    return CreateSimpleKickstartRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[CREATE_SIMPLE_KICKSTART]

  return {
    activeCoin: state.coins.activatedCoins[chainTicker],
    balances: state.ledger.balances[chainTicker],
    addresses: state.ledger.addresses[chainTicker],
    modalProps: state.modal[CREATE_SIMPLE_KICKSTART]
  };
};

export default connect(mapStateToProps)(CreateSimpleKickstart);
