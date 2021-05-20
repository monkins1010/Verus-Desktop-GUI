import React from 'react';
import toast from 'react-simple-toasts';
import { connect } from 'react-redux';
import { 
  DashboardRender,
} from './dashboard.render';
import Store from '../../../../../store'
import {
  CREATE_IDENTITY,
  CREATE_SIMPLE_TOKEN,
  API_REGISTER_ID_NAME,
  NATIVE,
  API_REGISTER_SIMPLE_TOKEN_ID,
  ID_POSTFIX,
  FIX_CHARACTER,
  API_GET_INFO,
  API_LAUNCH_SIMPLE_TOKEN,
  API_GET_MININGINFO,
  API_GET_CPU_TEMP,
  API_CREATE_SIMPLE_TOKEN,
  API_GET_IDENTITIES
} from "../../../../../util/constants/componentConstants";
import { conditionallyUpdateWallet, openModal } from '../../../../../actions/actionDispatchers';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      coinsMining: 0,
      coinsStaking: 0,
      tokenname: '',
      tokensupply: '',
      tokenaddresses: '',
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
    this.getFactoryBusy = this.getFactoryBusy.bind(this)
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

  getFactoryBusy(factoryIDBusy) {
    this.setState({ factoryIDBusy })
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


  openCoinfactorysimpleModal(chainTicker, commitmentData = null) {
    if(!chainTicker)
    toast("Chain not selected from tab menu on left");
    else
    {
      //Open create simple token modal
      openModal(CREATE_SIMPLE_TOKEN, { modalType: API_CREATE_SIMPLE_TOKEN, chainTicker, commitmentData })
    }
  }

  openRegisterIdentityModal(nameCommitmentObj) {
    if(!this.factoryIDBusy){
      this.getFactoryBusy(true)
      this.setState({ factorytxid: nameCommitmentObj.txid }) 
      openModal(CREATE_SIMPLE_TOKEN, { modalType: API_REGISTER_SIMPLE_TOKEN_ID, chainTicker: nameCommitmentObj.chainTicker, nameCommitmentObj })
  
    }
  }

  openLaunchSimpleTokenModal(nameCommitmentObj) {
    if(this.factoryIDBusy && !this.factoryLaunchBusy)
    this.setState({ factoryLaunchBusy: true })
      openModal(CREATE_SIMPLE_TOKEN, { modalType: API_LAUNCH_SIMPLE_TOKEN, chainTicker: nameCommitmentObj.chainTicker, nameCommitmentObj })
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