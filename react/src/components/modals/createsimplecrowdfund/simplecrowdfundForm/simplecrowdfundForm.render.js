import React from 'react';
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import ObjectToTable from '../../../../containers/ObjectToTable/ObjectToTable'
import { ENTER_DATA, DEFAULT_REFERRAL_IDS, INFO_SNACK } from '../../../../util/constants/componentConstants';
import SuggestionInput from '../../../../containers/SuggestionInput/SuggestionInput'
import { InputAdornment } from '@material-ui/core';

export const SimplecrowdfundFormRender = function() {
  const { formStep } = this.props
  return (
    <div
      className="col-xs-12 backround-gray"
      style={{
        width: "100%",
        height: "85%",
        display: "flex",
        justifyContent: formStep === ENTER_DATA ? "space-evenly" : "center",
        alignItems: formStep === ENTER_DATA ? "flex-start" : "unset",
        marginBottom: formStep === ENTER_DATA ? 0 : 20,
        flexDirection: "column",
        overflowY: "scroll"
      }}
    >
      { this.props.formStep === ENTER_DATA ? SimplecrowdfundEnterRender.call(this) : CommitNameTxDataRender.call(this) }
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

export const SimplecrowdfundEnterRender = function() {
  const { state, updateInput, props } = this
  const { name, referralId, formErrors, min_amount, receiveamount,  max_amount, receiveaddress, blockheight } = state;
  const { identities, activeCoin, info } = props

  let block30 = 43200 + info.blocks
  return (
    <React.Fragment>
       
      <TextField
        error={formErrors.name.length > 0}
        helperText={formErrors.name ? formErrors.name[0] : null}
        label="Enter name of crowdfund project (This will also become an Identity)"
        variant="outlined"
        onChange={updateInput}
        name="name"
        value={name}
        style={{ marginTop: 20, width: "95%" }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {activeCoin.id !== "VRSCTEST" && activeCoin.id !== "VRSC"
                ? `.${activeCoin.id}@`
                : "@"}
            </InputAdornment>
          ),
        }}
      />
      <SuggestionInput
        value={referralId}
        name="referralId"
        error={formErrors.referralId.length > 0}
        helperText={
          formErrors.referralId && formErrors.referralId.length > 0
            ? formErrors.referralId[0]
            : `Using a referral ID will discount the cost of creating your VerusID.${
                DEFAULT_REFERRAL_IDS[activeCoin.id] != null
                  ? ` If left blank, this will default to "${
                      DEFAULT_REFERRAL_IDS[activeCoin.id]
                    }".`
                  : ""
              }`
        }
        items={identities.map((id) => `${id.identity.name}@`)}
        label="Enter referral identity (optional)"
        onChange={updateInput}
        containerStyle={{ marginTop:10, width: "95%" }}
      />
      <TextField
        //  error={formErrors.amount.length > 0}
        //  helperText={formErrors.amount ? formErrors.amount[0] : null}
          label={`Enter minimum amount of ${activeCoin.id} to enable project to launch`}
          value={min_amount}
          onChange={updateInput}
          variant="outlined"
          type="number"
          name="min_amount"
          style={{ marginTop: 10, minWidth: "95%" }}

       />
      <TextField
       // error={formErrors.amount.length > 0}
      //  helperText={formErrors.amount ? formErrors.amount[0] : null}
        label={`Enter maximum amount of ${activeCoin.id} to enable project to launch`}
        value={max_amount}
        onChange={updateInput}
        variant="outlined"
        type="number"
        name="max_amount"
        style={{ marginTop: 10, minWidth: "95%" }}

      />
       <TextField
       // error={formErrors.amount.length > 0}
      //  helperText={formErrors.amount ? formErrors.amount[0] : null}
        label={`Enter the blockheight when then the crowdfund should launch`}
        value={blockheight}
        onChange={updateInput}
        variant="outlined"
        type="number"
        name="blockheight"
        style={{ marginTop: 10, minWidth: "95%", maxWidth: "95%" }}
        helperText={`For example for the project to start in 30 days time. Each block is on average 1 minute `
        + ` Therfore 30 x 24 x 60 = 43200` + ` Current blockheight is ${info.blocks}, for 30 days time start at blockheight: ${block30}`  }
      />
      
      <SuggestionInput
      //  error={formErrors.simple_addresses.length > 0}
      //  helperText={formErrors.simple_addresses ? formErrors.simple_addresses[0] : null}
        label="Enter address to receive tokens"
        items={identities.map((id) => `${id.identity.name}@`)}
        variant="outlined"
        onChange={updateInput}
        name="receiveaddress"
        value={receiveaddress}
        containerStyle={{ marginTop: 10, width: "95%" }}
      />
      <TextField
       // error={formErrors.amount.length > 0}
      //  helperText={formErrors.amount ? formErrors.amount[0] : null}
        label="Amount of Tokens to be sent to be preallocated to you"
        onChange={updateInput}
        variant="outlined"
        type="number"
        name="receiveamount"
        value={receiveamount}
        style={{ marginTop: 10, minWidth: "75%"}}
      />

    </React.Fragment>
  );
}


