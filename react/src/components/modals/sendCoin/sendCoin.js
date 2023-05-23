import React from 'react';
import { connect } from 'react-redux';
import { 
  SendCoinRender
} from './sendCoin.render';
import {
  SEND_COIN,
  ENTER_DATA,
  NATIVE,
  ETH,
  ELECTRUM,
  API_SUCCESS,
  ERROR_SNACK,
  API_ERROR,
  SUCCESS_SNACK,
  CONFIRM_DATA,
  API_GET_TRANSACTIONS,
  API_GET_BALANCES,
  API_GET_ZOPERATIONSTATUSES,
  Z_SEND,
  INFO_SNACK,
  INTEREST_BALANCE,
  MID_LENGTH_ALERT,
  WARNING_SNACK,
  SEND_CURRENCY,
  ERC20,
} from "../../../util/constants/componentConstants";
import {
  sendNative,
  sendEth,
  sendElectrum,
  getCurrency,
  sendErc20,
} from "../../../util/api/wallet/walletCalls";
import { newSnackbar, expireData } from '../../../actions/actionCreators';
import { checkFlag } from '../../../util/flagUtils';
import { IS_GATEWAY_FLAG } from '../../../util/constants/flags';
import { checkAddrValidity } from '../../../util/addrUtils';

class SendCoin extends React.Component {
  constructor(props) {
    super(props);

    props.setModalHeader(
      props.modalProps &&
        props.modalProps.balanceTag &&
        props.modalProps.balanceTag === INTEREST_BALANCE
        ? "Claim Interest"
        : props.modalProps.currencyInfo &&
          props.modalProps.currencyInfo.currency.name !==
            props.modalProps.chainTicker
        ? "Send Currency"
        : "Send Coin"
    );

    this.state = {
      formStep: ENTER_DATA,
      txData: {},
      loading: false,
      loadingProgress: 0,
      formData: {},
      continueDisabled: true,
      selectedSourceIndex: 0,
      selectedDestinationIndex: 0,
      currencyMap: {},
      loadingCurrencyMap: false
    };

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
      formData: {}
    })
  }

  advanceFormStep() {
    const { activeCoin, modalProps } = this.props
    const { mode } = activeCoin
    const { formStep, formData, loadingProgress, txData } = this.state
    let _txData

    this.props.setModalLock(true)
    this.setState({loading: true, loadingProgress: 99}, async () => {      
      // Fake loading
      const loadingTickInterval = setInterval(() => {
        this.setState({ loadingProgress: loadingProgress + ((99 - loadingProgress) / (Math.random() * (9 - 8) + 9)) })
      }, 500)

      try {
        const {
          chainTicker,
          toAddress,
          amount,
          balance,
          fromAddress,
          customFee,
          memo,
          fromCurrencyInfo,
          mint,
          currencyId
        } = formData;
  
        switch (mode) {
          case NATIVE:            
            _txData = await sendNative(
              !formStep,
              chainTicker,
              toAddress,
              Number(amount),
              Number(balance),
              mint ? currencyId : fromAddress,
              Number(customFee),
              memo != null && memo.length > 0 ? memo : undefined,
              {
                currency: fromCurrencyInfo != null ? fromCurrencyInfo.currency.name : undefined,
                mintnew: mint,
                exportto:
                  fromCurrencyInfo != null &&
                  ((fromCurrencyInfo.currency.nativecurrencyid != null &&
                    fromCurrencyInfo.currency.nativecurrencyid.type === 9) ||
                    fromCurrencyInfo.currency.currencyid ===
                      "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV") &&
                  checkAddrValidity(toAddress, ETH, "ETH") // TODO: Generalize
                    ? "iCtawpxUiCc2sEupt7Z4u8SDAncGZpgSKm" // vETH
                    : undefined,
              }
            );
            break;
          case ETH:  
            _txData = await sendEth(!formStep, chainTicker, toAddress, Number(amount));
            break;
          case ERC20:  
            _txData = await sendErc20(!formStep, chainTicker, toAddress, Number(amount));
            break;
          case ELECTRUM:  
            _txData = await sendElectrum(
              !formStep,
              chainTicker,
              toAddress,
              Number(amount),
              Number(customFee),
              txData.feePerByte
            );
            break;
        }
  
        clearInterval(loadingTickInterval)
        this.props.setModalLock(false)
        if (_txData.msg === API_SUCCESS) {
          this.setState({ loadingProgress: 100 }, () => {
            if (formStep === CONFIRM_DATA) {
              if (_txData.result.cliCmd === Z_SEND || _txData.result.cliCmd === SEND_CURRENCY) {
                this.props.dispatch(newSnackbar(INFO_SNACK, "Transaction posted! Track its status in the pending transaction log of your wallet."))
              } else {
                this.props.dispatch(newSnackbar(SUCCESS_SNACK, "Transaction sent successfully!"))
              }
              

              // Expire transactions and balances
              this.props.dispatch(expireData(chainTicker, API_GET_TRANSACTIONS))

              const expireBalancesAndOperations = () => {
                this.props.dispatch(expireData(chainTicker, API_GET_BALANCES))
                this.props.dispatch(expireData(chainTicker, API_GET_ZOPERATIONSTATUSES))
              }
              
              expireBalancesAndOperations()
              setTimeout(() => expireBalancesAndOperations(), 5000)
              setTimeout(() => expireBalancesAndOperations(), 10000)
              setTimeout(() => expireBalancesAndOperations(), 15000)
            }

            this.setState({ loading: false, txData: {status: API_SUCCESS, ..._txData.result}, formStep: formStep + 1 })
          })
        } else {
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
    return SendCoinRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[SEND_COIN]

  return {
    activeCoin: state.coins.activatedCoins[chainTicker],
    balances: state.ledger.balances[chainTicker],
    addresses: state.ledger.addresses[chainTicker],
    modalProps: state.modal[SEND_COIN]
  };
};

export default connect(mapStateToProps)(SendCoin);