import React from "react";
import ReactMinimalPieChart from "react-minimal-pie-chart";
import {
  TF_SIMPLE_TOKEN
} from "../../../../../util/constants/componentConstants";

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import WalletPaper from "../../../../../containers/WalletPaper/WalletPaper";
import SimpleLoader from "../../../../../containers/SimpleLoader/SimpleLoader";


import DeleteForever from '@material-ui/icons/DeleteForever';


export const DashboardRender = function() {

  const identityChains = Object.keys(this.props.identities)

  return (
    <div
      className="col-md-8 col-lg-9"
      style={{ padding: 16, overflow: "scroll" }}
    >
      <WalletPaper
        style={{
          marginBottom: 16,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <h6
          className="card-title"
          style={{ fontSize: 16, margin: 0, width: "100%" }}
        >
          {"Create your own Coin, Token or Blockchain"}
        </h6>
      <div style={{ display: "flex", alignItems: "center",padding: 4, flexWrap: "wrap", marginTop: 10 }}>
      <button
        className="btn btn-primary"
        type="button"
        style={{
          fontSize: 14,
          backgroundColor: "rgb(49, 101, 212)",
          borderWidth: 1,
          borderColor: "rgb(49, 101, 212)",
          width : '152px'
        }}
        onClick={ () => this.openCoinfactorysimpleModal(identityChains[0])}
       >
        {"Create Simple Token"}
      </button>
              <a  style={{ marginLeft: "5px"}}>
                                 
                    {"Create a simple non fractionally backed token"}
                                 
              </a>

        </div>
        <div style={{ display: "flex", alignItems: "center",padding: 4, flexWrap: "wrap", marginTop: 10 }}>
      <button
        className="btn btn-primary"
        type="button"
        style={{
          fontSize: 14,
          backgroundColor: "rgb(49, 101, 212)",
          borderWidth: 1,
          borderColor: "rgb(49, 101, 212)",
          width : '152px'
        }}
        onClick={ () => this.openSimpleKickstartModal(identityChains[0])}
       >
        {"Create Kickstarter"}
      </button>
              <a  style={{ marginLeft: "5px"}}>
                                 
                    {"Create a kickstarter campaign to fund your project"}
                                 
              </a>
              
        </div>
        <div style={{ display: "flex", alignItems: "center",padding: 4, flexWrap: "wrap", marginTop: 10 }}>
      <button
        className="btn btn-primary"
        type="button"
        style={{
          fontSize: 14,
          backgroundColor: "rgb(49, 101, 212)",
          borderWidth: 1,
          borderColor: "rgb(49, 101, 212)",
          width : '152px'
        }}
        onClick={ () => this.openAdvancedCurrencyModal(identityChains[0])}
       >
        {"Advanced"}
      </button>
              <a  style={{ marginLeft: "5px"}}>
                                 
                    {"Create an advanced Currency or PBaaS Chain"}
                                 
              </a>
              
        </div>
     { this.state.displayNameCommitments.length > 0 ? DashboardRenderTable.call(this) : <SimpleLoader size={75} text={"Loading Blockchain..."}/> }
      </WalletPaper>

    </div>
  );
};

export const DashboardRenderTable = function() {
  return (
    <div className="table-responsive" style={{ maxHeight: 600, overflowY: "scroll",marginTop: 10 }}>
      <table className="table table-striped">
        <thead>
        <tr>
          <th scope="col">Identity</th>
          <th scope="col">Project status</th>
          <th scope="col">Project type</th>
          <th scope="col">Delete?</th>
        </tr>
        </thead>
        <tbody>
          {this.state.displayNameCommitments.map((reservationObj, index) => {
            const { namereservation, chainTicker } = reservationObj
            const { identities, transactions } = this.props
            let isUsed = false
            let isToken = false
            let isTokenLaunched = false
            let loading = false
            let isKickstart = false
            let isKickstartLaunched = false
            let failed = reservationObj.confirmations < 0 ? true : false
            
            if (identities[chainTicker] && transactions[chainTicker]) {
              if (!(identities[chainTicker].every(idObj => {
                return idObj.identity.identityaddress !== namereservation.nameid
              }))) {
                isUsed = true
              } else {
                for (let i = 0; i < transactions[chainTicker].length; i++) {
                  const tx = transactions[chainTicker][i]
  
                  if (tx.address === namereservation.nameid) {
                    const { confirmations } = tx
                    // If confirmation < 0, mark as "ready" to be used again
                    if (confirmations === 0) {
                      failed = false
                      loading = true
                      break;
                    } else if (confirmations > 0) {
                      failed = false
                      isUsed = true
                      break;
                    } else {
                      failed = true
                    }

                  }
                }
              }
            } else {
              loading = true
            }

   factory: if(reservationObj.extra){
              if(reservationObj.extra.type === "SIMPLETOKEN"){ 
                  
                   isToken = true

                  if(reservationObj.extra.tokenState === 1){
                    isTokenLaunched = true
                    break factory;
                  } else if(reservationObj.confirmations > 0 && !loading && !isUsed && !failed && !this.state.factoryIDBusy && reservationObj.extra){
                      this.openRegisterIdentityModal(reservationObj)

                  } else if(!this.state.factoryLaunchBusy && isUsed && !isTokenLaunched){
                    this.openLaunchSimpleTokenModal(reservationObj);
                    this.getFactoryIDBusy(true )
                    this.getFactoryLaunchBusy(true )
                    
                  }

                } else if(reservationObj.extra.type === "SIMPLEKICKSTART"){

                  isKickstart =  true

                  if(reservationObj.extra.tokenState === 1){
                    isKickstartLaunched = true
                    break factory;
    
                  } else if(reservationObj.confirmations > 0 && !loading && !isUsed && !failed && !this.state.factoryIDBusy && reservationObj.extra){
                     this.openRegisterIdentityModal(reservationObj)

                  } else if(!this.state.factoryLaunchBusy && isUsed  && !isKickstartLaunched){
                    this.openLaunchSimpleKickstartModal(reservationObj);
                    this.getFactoryIDBusy(true )
                    this.getFactoryLaunchBusy(true )
                  }
               } 
            }

            if(this.state.factoryIDBusy && reservationObj.txid === this.state.factorytxid && !isUsed && reservationObj.extra){ 
              loading =true
            }

            if(!reservationObj.extra)
                return null
            return (
              <tr
                key={index}
                style={{
                  alignItems: "center"
                }}
              >
                <td
                  style={{
                    color: "rgb(0,0,0)",
                    fontWeight: "bold",
                    borderTop: 0,
                  }}
                >
                  {`${namereservation.name}${
                    chainTicker === "VRSC" || chainTicker === "VRSCTEST"
                      ? ""
                      : `.${chainTicker}`
                  }@`}
                </td>
                <td style={{ borderTop: 0 }}>
                  <h3
                    className={`d-lg-flex align-items-lg-center coin-type ${
                      isTokenLaunched || isKickstartLaunched ? "green" :
                      reservationObj.confirmations == null || isUsed || loading
                        ? "native"
                        : failed
                        ? "red"
                        : reservationObj.confirmations > 0 
                        ? "green"
                        : "lite"
                    }`}
                    style={{
                      fontSize: 12,
                      padding: 1,
                      paddingTop: 1,
                      paddingBottom: 1,
                      borderWidth: 1,
                      margin: 0,
                    }}
                  >
                    {loading
                      ? "Processing... Please Wait a few minutes"
                      : isTokenLaunched
                      ? "Token Launched"
                      : isKickstartLaunched
                      ? "Kickstart Launched"
                      : isUsed
                      ? "Ready to Launch"
                      : failed
                      ? "Failed"
                      : reservationObj.confirmations != null &&
                        reservationObj.confirmations > 0
                      ? "Ready to Register ID"
                      : "Pending Name commitment..."}
                  </h3>
                </td>
                <td
                  style={{
                    color: "rgb(0,0,0)",
                    borderTop: 0,
                  }}
                >
                  {isKickstart 
                   ? "Simple Kickstart" 
                   : isToken
                   ? "Simple Token"
                   : null }
                </td>
                <td style={{ borderTop: 0 }}>
                  <Tooltip title="Untrack">
                    <IconButton
                      size="small"
                      aria-label="Untrack Name Commitment"
                      onClick={() =>
                        this.deleteNameCommitment(
                          namereservation.name,
                          chainTicker
                        )
                      }
                    >
                      <DeleteForever />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}
