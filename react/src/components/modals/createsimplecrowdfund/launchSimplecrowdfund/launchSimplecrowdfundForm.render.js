import React from 'react';
import TextField from "@material-ui/core/TextField";
import ObjectToTable from '../../../../containers/ObjectToTable/ObjectToTable'
import { ENTER_DATA } from '../../../../util/constants/componentConstants';

export const launchSimplecrowdfundFormRender = function() {
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
        overflowY: "scroll",
      }}
    >
      {this.props.formStep === ENTER_DATA
        ? UpdateIdentityFormEnterRender.call(this)
        : UpdateIdentityTxDataRender.call(this)}
    </div>
  );
}

export const UpdateIdentityTxDataRender = function() {
  return (
    <ObjectToTable 
      dataObj={ this.state.txDataDisplay }
      pagination={ false }
      paperStyle={{ width: "100%" }}
    /> 
  )
}

export const UpdateIdentityFormEnterRender = function() {
  const { state, updateInput, props } = this
  const {
    name,
    extra,
    formErrors
  } = state;
  const { identity } = props
  const textIdentifier = identity == null ? 'this identity' : name

  return (
    <React.Fragment>
        <p>
          Ready to Launch the crowdfund to the specified address, note this costs 200.0004 VRSC.  
       </p>
     
      <TextField
        label="Name of crowdfund"
        variant="outlined"
        onChange={updateInput}
        name="name"
        value={name}
        style={{ marginTop: 5, width: "100%" }}
      />
    </React.Fragment>
  );
}


