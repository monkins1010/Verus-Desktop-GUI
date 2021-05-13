import React from 'react';
import { connect } from 'react-redux';
import {
  DASHBOARD,
  NATIVE,
  MINING_POSTFIX,
  MS_MERGE_MINING_STAKING,
  MS_MINING_STAKING,
  MS_MINING,
  MS_STAKING,
  MS_MERGE_MINING,
  MS_OFF,
  MS_IDLE,
  ERROR_SNACK,
  MID_LENGTH_ALERT,
  API_GET_MININGINFO,
  MINING_FUNCTIONS,
  API_ERROR,
  FIX_CHARACTER,
  CREATE_SIMPLE_TOKEN
} from "../../../../util/constants/componentConstants";
import Dashboard from './dashboard/dashboard'
import MiningWallet from './miningWallet/miningWallet'
import {
  CoinfactoryTabsRender
} from './coinfactory.render'
import Store from '../../../../store'
import {
  setMainNavigationPath,
  expireData,
  newSnackbar,
  startLoadingMiningFunctions,
  finishLoadingMiningFunctions,
} from "../../../../actions/actionCreators";
import { getPathParent, getLastLocation } from '../../../../util/navigationUtils'
import { stopStaking, startStaking, stopMining, startMining } from '../../../../util/api/wallet/walletCalls';
import { conditionallyUpdateWallet } from '../../../../actions/actionDispatchers';
import { useStringAsKey } from '../../../../util/objectUtil';

class Coinfactory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nativeCoins: [],
      miningStates: {}
    }

    this.miningStateDescs = {
      [MS_IDLE]: "Loading...",
      [MS_OFF]: "Mining/Staking Off",
      [MS_STAKING]: "Staking",
      [MS_MINING]: "Mining",
      [MS_MINING_STAKING]: "Mining & Staking",
      [MS_MERGE_MINING]: "Merge Mining",
      [MS_MERGE_MINING_STAKING]: "Merge Mining & Staking"
    }
    
    this.setCards = this.setCards.bind(this)
    this.setTabs = this.setTabs.bind(this)
    this.openDashboard = this.openDashboard.bind(this)
    this.getNativeCoins = this.getNativeCoins.bind(this)
    this.openCoin = this.openCoin.bind(this)
    this.handleThreadChange = this.handleThreadChange.bind(this)
    this.toggleStaking = this.toggleStaking.bind(this)
    this.setTabs()
  }

  componentDidMount() {
    if (!this.props.mainPathArray[3]) {
      this.getNativeCoins(this.props.activatedCoins, () => {
        const lastLocation = getLastLocation(
          useStringAsKey(
            this.props.mainTraversalHistory,
            this.props.mainPathArray.join(".")
          )
        );
  
        const lastCoin =
          lastLocation != null &&
          lastLocation.length > 0 &&
          lastLocation[0].includes(`${FIX_CHARACTER}${MINING_POSTFIX}`)
            ? lastLocation[0].split(FIX_CHARACTER)[0]
            : null;
  
        this.props.dispatch(setMainNavigationPath(`${this.props.mainPathArray.join('/')}/${
          lastCoin != null && this.state.nativeCoins.includes(lastCoin) ? lastLocation[0] : DASHBOARD
        }`)) 
      })
    }
    
   
  }

  async toggleStaking(chainTicker) {
    const { miningInfo, dispatch } = this.props

    if (miningInfo[chainTicker]) {
      try {
        this.props.dispatch(startLoadingMiningFunctions(chainTicker))
        
        // Try to dispatch call to stop or start staking
        if (miningInfo[chainTicker].staking) {
          await stopStaking(NATIVE, chainTicker)
        } else {
          await startStaking(NATIVE, chainTicker)
        }

        // If successful, expire mining data and update all other expired data
        dispatch(expireData(chainTicker, API_GET_MININGINFO))
        if (
          (await conditionallyUpdateWallet(
            Store.getState(),
            dispatch,
            NATIVE,
            chainTicker,
            API_GET_MININGINFO
          )) === API_ERROR
        ) {
          throw new Error("Failed to update mining status.")
        } else this.props.dispatch(finishLoadingMiningFunctions(chainTicker))

      } catch (e) {
        // If failed, cancel loading
        this.props.dispatch(finishLoadingMiningFunctions(chainTicker))
        dispatch(newSnackbar(ERROR_SNACK, e.message, MID_LENGTH_ALERT))
      }
    }
  }

  // Dispatch call to stop or start mining, then expire and update mining data
  async handleThreadChange(event, chainTicker) {
    const newThreads = event.target.value
    const { dispatch, miningInfo } = this.props

    if (
      miningInfo[chainTicker] &&
      (newThreads !== miningInfo[chainTicker].numthreads || 
      (!miningInfo[chainTicker].generate && newThreads > 0))
    ) {
      try {
        this.props.dispatch(startLoadingMiningFunctions(chainTicker));

        // Try to dispatch call to stop or start mining
        if (newThreads === 0) {
          await stopMining(NATIVE, chainTicker);
        } else {
          await startMining(NATIVE, chainTicker, newThreads);
        }

        // If successful, expire mining data and update all other expired data
        dispatch(expireData(chainTicker, API_GET_MININGINFO));
        if (
          (await conditionallyUpdateWallet(
            Store.getState(),
            dispatch,
            NATIVE,
            chainTicker,
            API_GET_MININGINFO
          )) === API_ERROR
        ) {
          throw new Error("Failed to update mining status.");
        } else this.props.dispatch(finishLoadingMiningFunctions(chainTicker));
      } catch (e) {
        // If failed, cancel loading
        this.props.dispatch(finishLoadingMiningFunctions(chainTicker));
        dispatch(newSnackbar(ERROR_SNACK, e.message, MID_LENGTH_ALERT));
      }
    }
  }


  // Calculates the native coins given the current activated coins
  // and activates the callback function once the state has been changed
  getNativeCoins(activatedCoins, cb) {
    this.setState({ nativeCoins: Object.keys(activatedCoins).filter((chainTicker) => {
      return activatedCoins[chainTicker].mode === NATIVE
    })}, () => cb())
  }

  /**
   * Sets the mining coin cards by mapping over the provided coins activated in native mode
   * @param {Object} activatedCoins 
   */
  setCards(activatedCoins) {
    this.getNativeCoins(activatedCoins, () => {
      this.props.setCards(this.state.nativeCoins.map((chainTicker) => {
        return null
      }))
    })
  }



  openDashboard() {
    this.props.dispatch(setMainNavigationPath(`${getPathParent(this.props.mainPathArray)}/${DASHBOARD}`))
  }

  setTabs() {
    this.props.setTabs(CoinfactoryTabsRender.call(this))
  }

  openCoin(wallet) {
    this.props.dispatch(
      setMainNavigationPath(
        `${getPathParent(
          this.props.mainPathArray
        )}/${wallet}${FIX_CHARACTER}${MINING_POSTFIX}`
      )
    );
  }

  render() {
    const walletApp = this.props.mainPathArray[3] ? this.props.mainPathArray[3] : null

    if (walletApp) {
      if (walletApp === DASHBOARD)
        return (
          <Dashboard
            miningStates={this.state.miningStates}
            nativeCoins={this.state.nativeCoins}
            miningStateDescs={this.miningStateDescs}
            openCoin={this.openCoin}
            handleThreadChange={this.handleThreadChange}
            toggleStaking={this.toggleStaking}
            loadingCoins={this.props.loading}
            miningInfo={this.props.miningInfo}
            miningInfoErrors={this.props.miningInfoErrors}
          />
        );
      else {
        const pathDestination = walletApp.split(FIX_CHARACTER);

        if (pathDestination.length > 1 && pathDestination[1] === MINING_POSTFIX)
          return (
            <MiningWallet
              miningState={
                this.state.miningStates[pathDestination[0]] == null
                  ? MS_IDLE
                  : this.state.miningStates[pathDestination[0]]
              }
              coin={pathDestination[0]}
              loading={this.props.loading[pathDestination[0]]}
              handleThreadChange={this.handleThreadChange}
              toggleStaking={this.toggleStaking}
              miningInfo={this.props.miningInfo[pathDestination[0]]}
              miningInfoErrors={this.props.miningInfoErrors[pathDestination[0]]}
            />
          );
      }
    }

    return null
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[CREATE_SIMPLE_TOKEN]
  return {
    mainPathArray: state.navigation.mainPathArray,
    activatedCoins: state.coins.activatedCoins,
    miningInfo: state.ledger.miningInfo,
    miningInfoErrors: state.errors[API_GET_MININGINFO],
    loading: state.loading[MINING_FUNCTIONS],
    mainTraversalHistory: state.navigation.mainTraversalHistory,
    activeCoin: state.coins.activatedCoins[chainTicker],
    balances: state.ledger.balances[chainTicker],
    addresses: state.ledger.addresses[chainTicker],
    modalProps: state.modal[CREATE_SIMPLE_TOKEN]
  };
};

export default connect(mapStateToProps)(Coinfactory);