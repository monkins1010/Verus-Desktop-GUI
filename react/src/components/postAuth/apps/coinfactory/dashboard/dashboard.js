import React from 'react';
import toast from 'react-simple-toasts';
import { connect } from 'react-redux';
import { 
  DashboardRender,
} from './dashboard.render';
import Store from '../../../../../store'
import {
  CREATE_SIMPLE_TOKEN,
  CREATE_SIMPLE_KICKSTART,
  CREATE_ADVANCED_CURRENCY,
  NATIVE,
  API_REGISTER_SIMPLE_TOKEN_ID,
  ID_POSTFIX,
  FIX_CHARACTER,
  API_GET_INFO,
  API_LAUNCH_SIMPLE_TOKEN,
  API_GET_CPU_TEMP,
  API_CREATE_SIMPLE_TOKEN,
  API_GET_IDENTITIES,
  API_CREATE_SIMPLE_KICKSTART,
  API_LAUNCH_SIMPLE_KICKSTART,
  API_CREATE_ADVANCED_CURRENCY
} from "../../../../../util/constants/componentConstants";
import { openModal } from '../../../../../actions/actionDispatchers';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      coinsStaking: 0,
      displayNameCommitments: [],
      compiledIds: [],
      nameReservationDropdownOpen: false,
      idRecoveryDropdownOpen: false,
      verifyDataDropdownOpen: false,
      signDataDropdownOpen: false,
      revokeDialogueOpen: false,
      revokeId: null,
      factoryIDBusy: false,
      factoryLaunchBusy: false,
      factorytxid: ""
    }

 
    this.compileCommits = this.compileCommits.bind(this)
    this.compileIds = this.compileIds.bind(this)
    this.openCoinfactorysimpleModal = this.openCoinfactorysimpleModal.bind(this)
    this.openRegisterIdentityModal = this.openRegisterIdentityModal.bind(this)
    this.openId = this.openId.bind(this)
    this.getFactoryIDBusy = this.getFactoryIDBusy.bind(this)
    this.getFactoryLaunchBusy = this.getFactoryLaunchBusy.bind(this)
  }

  componentDidMount() {

    this.compileIds()

    this.compileCommits()
  }

  openId(chainTicker, idIndex) {
    this.props.dispatch(
      setMainNavigationPath(
        `${getPathParent(
          this.props.mainPathArray
        )}/${idIndex}${FIX_CHARACTER}${chainTicker}${FIX_CHARACTER}${ID_POSTFIX}`
      )
    );
  }

  getFactoryIDBusy(factoryIDBusy) {
    this.setState({ factoryIDBusy })
  }

  getFactoryLaunchBusy(factoryLaunchBusy) {
    this.setState({ factoryLaunchBusy })
  }

  componentDidUpdate(lastProps) {
    if (this.props != lastProps) {
      this.compileIds()
      this.compileCommits()
    }
  }

  compileIds() {
    const { identities } = this.props
    let compiledIds = []

    Object.keys(identities).map(chainTicker => {
      if (identities[chainTicker]) {
        identities[chainTicker].map((id, index) => {
          compiledIds.push({...id, chainTicker, index})
        })
      }
    })

    this.setState({ compiledIds })
  }

  //************SImple Token**************

  openCoinfactorysimpleModal(chainTicker, commitmentData = null) {
    if(chainTicker || !this.factoryIDBusy)
    {
      openModal(CREATE_SIMPLE_TOKEN, { modalType: API_CREATE_SIMPLE_TOKEN, chainTicker, commitmentData })
    }
  }

  openRegisterIdentityModal(nameCommitmentObj) {
    if(!this.factoryIDBusy){
      this.getFactoryIDBusy(true)
      this.setState({ factorytxid: nameCommitmentObj.txid }) 
      openModal(CREATE_SIMPLE_TOKEN, { modalType: API_REGISTER_SIMPLE_TOKEN_ID, chainTicker: nameCommitmentObj.chainTicker, nameCommitmentObj })
  
    }
  }

  openLaunchSimpleTokenModal(nameCommitmentObj) {
    if(this.factoryIDBusy && !this.factoryLaunchBusy)
    this.setState({ factoryLaunchBusy: true })
      openModal(CREATE_SIMPLE_TOKEN, { modalType: API_LAUNCH_SIMPLE_TOKEN, chainTicker: nameCommitmentObj.chainTicker, nameCommitmentObj })
  }

  //************SImple Kick start**************

  openSimpleKickstartModal(chainTicker, commitmentData = null) {
    if(chainTicker || !this.factoryIDBusy)
    {
      openModal(CREATE_SIMPLE_KICKSTART, { modalType: API_CREATE_SIMPLE_KICKSTART, chainTicker, commitmentData })
    }
  }

  openLaunchSimpleKickstartModal(nameCommitmentObj) {
    if(this.factoryIDBusy && !this.factoryLaunchBusy)
    this.setState({ factoryLaunchBusy: true })
      openModal(CREATE_SIMPLE_KICKSTART, { modalType: API_LAUNCH_SIMPLE_KICKSTART, chainTicker: nameCommitmentObj.chainTicker, nameCommitmentObj })
  }

  //************Advnaced definecurrency**************

  openAdvancedCurrencyModal(chainTicker, commitmentData = null) {

      openModal(CREATE_ADVANCED_CURRENCY, { modalType: API_CREATE_ADVANCED_CURRENCY, chainTicker, commitmentData })
    
  }

  compileCommits() {
    const { nameCommitments, transactions } = this.props
    let compiledCommits = []

    Object.keys(nameCommitments).map(chainTicker => {
      if (nameCommitments[chainTicker]) {
        nameCommitments[chainTicker].map(nameCommit => {
          let confirmations = null

          if (transactions[chainTicker]) {
            transactions[chainTicker].map(tx => {
              if (tx.txid === nameCommit.txid) {
                confirmations = tx.confirmations
              }
            })
          }

          compiledCommits.push({...nameCommit, chainTicker, confirmations})
        })
      }
    })

    this.setState({ displayNameCommitments: compiledCommits })
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
      identities: state.ledger.identities,
      cpuTemp: state.system.cpuTemp,
      sysTime: state.system.sysTime,
      cpuData: state.system.static ? state.system.static.cpu : {},
      cpuTempError: state.errors[API_GET_CPU_TEMP],
      getInfoErrors: state.errors[API_GET_INFO],
      nameCommitments: state.ledger.nameCommitments,
      transactions: state.ledger.transactions,
      mainPathArray: state.navigation.mainPathArray,
      activatedCoins: state.coins.activatedCoins,
      identityErrors: state.errors[API_GET_IDENTITIES],
      activeUser: state.users.activeUser
    };
  };
}

export default connect(mapStateToPropsFactory)(Dashboard);