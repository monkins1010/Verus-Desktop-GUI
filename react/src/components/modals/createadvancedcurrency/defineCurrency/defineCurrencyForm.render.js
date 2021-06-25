import React from 'react';
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import ObjectToTable from '../../../../containers/ObjectToTable/ObjectToTable'
import { ENTER_DATA, DEFAULT_REFERRAL_IDS, INFO_SNACK } from '../../../../util/constants/componentConstants';
import SuggestionInput from '../../../../containers/SuggestionInput/SuggestionInput'
import { InputAdornment } from '@material-ui/core';


const item_descriptions = [
  "Enter ID registration Price",
  "Enter how many levels ID referrals go back in reward",
  "Enter Notaries e.g Bob@, jim@",
  "unique notary signatures required to confirm an auto-notarization if = 3",
  "Default VRSC notarization reward total for first billing",
  "Number of blocks in each billing period",
  "If 2, currency can be minted by whoever controls the ID",
  "VRSC block must be notarized into block 1 of PBaaS chain, default curheight + 100",
  "Chain is considered inactive after this block height, and  a new one may be started",
  "Reserve currencies backing this chain in equal amounts",
  "If present, must be same size as currencies. pre-launch conversion ratio overrides",
  "Must be same size as currencies. minimum in each currency to launch",
  "Maximum in each currency allowed",
  "Initial contribution in each currency",
  "Reserve currencies less than 100%, discount on final price at launch",
  "Supply after conversion of contributions, before preallocation",
  "Identities and % of  pre-converted amounts from each reserve currency",
  "List of identities and amounts from pre-allocation",
  "Native initial block rewards in each period",
  "Reward decay for each era",
  "Halving period for each era",
  "Ending block of each era",
  "Up to 2 nodes that can be used to  connect to the blockchain",
  "Rewards payment and identity",
  "Name of gateway conveter currency",
  "Gateway currency issuance",
  "Gateway currency initial supply",
  "Gateway currency initial contributions"
];

export const DefineCurrencyFormRender = function() {
  const { formStep } = this.props
  return (
    <div
      className="col-xs-12 backround-gray"
      style={{
        width: "100%",
        height: "85%",
        justifyContent: formStep === ENTER_DATA ? "space-evenly" : "center",
        alignItems: formStep === ENTER_DATA ? "flex-start" : "unset",
        marginBottom: formStep === ENTER_DATA ? 0 : 20,
        marginTop: formStep === ENTER_DATA ? 0 : 20,
        flexDirection: "column",
        overflowY: "scroll"
      }}
    >
      { this.props.formStep === ENTER_DATA ? DefineCurrencyFormEnterRender.call(this) : CommitNameTxDataRender.call(this) }
    </div>
  );
}

export const CommitNameTxDataRender = function() {
  return (
    <ObjectToTable 
      dataObj={ this.state.txDataDisplay }
      pagination={ false }
      paperStyle={{ width: "100%" }}
    /> 
  )
}



export const DefineCurrencyFormEnterRender = function() {
  const { state, updateInput, updateInputAdvanced, props } = this
  const { name, formErrors } = state;
  const { identities, activeCoin, info } = props


  return (
    <React.Fragment>
       
       <SuggestionInput
        error={formErrors.name.length > 0}
        helperText={formErrors.name ? formErrors.name[0] : null}
        label="Choose the name of Currency or PBaaS Chain"
        items={identities.map((id) => `${id.identity.name}`)}
        variant="outlined"
        onChange={updateInput}
        name="name"
        value={name}
        containerStyle={{ marginTop: 10, width: "95%" }}
      />
      <div className="col-xs-12 margin-top-20 backround-gray" style={{display : 'inline-block', padding: '5px'}}>
        {this.createCheckboxes()}
      </div>


      { Object.keys(this.state.advanced).map((a,i) =>{
       return (
        <div style={{ width: "100%", paddingLeft: 35, paddingRight: 35 }}> 
        
        <TextField 
          label={a+ ": " + item_descriptions[i]} 
          name={a} 
          value={this.state.advanced[a]} 
          variant="outlined"
          onChange={updateInputAdvanced} 
          style={{ marginTop: 10, width: "95%" }}  /> 
          </div>
          )
      }) 
          }

    </React.Fragment>
  );
}


