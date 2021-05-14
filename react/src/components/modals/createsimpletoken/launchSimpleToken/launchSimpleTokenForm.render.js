import React from 'react';
import ObjectToTable from '../../../../containers/ObjectToTable/ObjectToTable'
import { ENTER_DATA } from '../../../../util/constants/componentConstants';


export const launchSimpleTokenFormRender = function() {
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
      { launchSimpleTokenTxDataRender.call(this) }
    </div>
  );
}

export const launchSimpleTokenTxDataRender = function() {
  return (
    <ObjectToTable 
      dataObj={ this.state.txDataDisplay }
      pagination={ false }
      paperStyle={{ width: "100%" }}
    /> 
  )
}



