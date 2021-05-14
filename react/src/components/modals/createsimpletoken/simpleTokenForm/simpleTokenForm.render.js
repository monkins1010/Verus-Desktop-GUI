import React from 'react';
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import ObjectToTable from '../../../../containers/ObjectToTable/ObjectToTable'
import { ENTER_DATA, DEFAULT_REFERRAL_IDS } from '../../../../util/constants/componentConstants';
import SuggestionInput from '../../../../containers/SuggestionInput/SuggestionInput'
import { InputAdornment } from '@material-ui/core';

export const SimpleTokenFormRender = function() {
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
      { this.props.formStep === ENTER_DATA ? SimpleTokenEnterRender.call(this) : CommitNameTxDataRender.call(this) }
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

export const SimpleTokenEnterRender = function() {
  const { state, updateInput, props } = this
  const { name, referralId, formErrors, amount, simple_addresses } = state;
  const { identities, activeCoin } = props

  return (
    <React.Fragment>
      <TextField
        error={formErrors.name.length > 0}
        helperText={formErrors.name ? formErrors.name[0] : null}
        label="Enter name of Token (This will also become an Identity)"
        variant="outlined"
        onChange={updateInput}
        name="name"
        value={name}
        style={{ marginTop: 5, width: "100%" }}
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
        containerStyle={{ marginTop: 5, width: "75%" }}
      />
      <TextField
          error={formErrors.amount.length > 0}
          helperText={formErrors.amount ? formErrors.amount[0] : null}
          label="Enter amount of tokens to be created"
          value={amount}
          onChange={updateInput}
          variant="outlined"
          type="number"
          name="amount"
          style={{ marginTop: 5, minWidth: "57%" }}

       />
      <TextField
        error={formErrors.simple_addresses.length > 0}
        helperText={formErrors.simple_addresses ? formErrors.simple_addresses[0] : null}
        label="Enter comma seperated list of addresses to recieve tokens"
        variant="outlined"
        onChange={updateInput}
        name="simple_addresses"
        value={simple_addresses}
        style={{ marginTop: 5, width: "100%" }}
      />
    </React.Fragment>
  );
}


