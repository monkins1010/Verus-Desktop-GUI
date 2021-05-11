import React from 'react';
import { connect } from 'react-redux';
import { 
  DashboardRender,
} from './dashboard.render';
import Store from '../../../../../store'
import {
  NATIVE,
  API_GET_INFO,
  API_GET_MININGINFO,
  API_GET_CPU_TEMP,
} from "../../../../../util/constants/componentConstants";
import { conditionallyUpdateWallet } from '../../../../../actions/actionDispatchers';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      coinsMining: 0,
      coinsStaking: 0,
    }

    this.updateMineStakeCoins = this.updateMineStakeCoins.bind(this)
  }

  componentDidMount() {
    this.props.nativeCoins.map(coinObj => {
      conditionallyUpdateWallet(
        Store.getState(),
        this.props.dispatch,
        NATIVE,
        coinObj.id,
        API_GET_MININGINFO
      )
    })

    this.updateMineStakeCoins()
  }

  updateMineStakeCoins() {
    let coinsStaking = 0, coinsMining = coinsStaking
    const { miningInfo } = this.props
    
    Object.keys(miningInfo).map(chainTicker => {
      const { numthreads, generate, staking } = miningInfo[chainTicker]

      if (staking) coinsStaking++
      if (generate && numthreads) coinsMining++
      
      this.setState({ coinsMining, coinsStaking })
    })
  }

  componentDidUpdate(lastProps) {
    if (lastProps.miningInfo != this.props.miningInfo) {
      this.updateMineStakeCoins()
    }
  }

  render() {
    return DashboardRender.call(this);
  }
}

// Minor performance improvement when filtering activatedCoins
function mapStateToPropsFactory(initialState, ownProps) {
  return function mapStateToProps(state) {
    return {
      nativeCoins: Object.values(state.coins.activatedCoins).filter(coinObj => { return coinObj.mode === NATIVE }),
      balances: state.ledger.balances,
      cpuLoad: state.system.cpuLoad,
      cpuTemp: state.system.cpuTemp,
      sysTime: state.system.sysTime,
      cpuData: state.system.static ? state.system.static.cpu : {},
      cpuTempError: state.errors[API_GET_CPU_TEMP],
      getInfoErrors: state.errors[API_GET_INFO],
    };
  };
}

export default connect(mapStateToPropsFactory)(Dashboard);