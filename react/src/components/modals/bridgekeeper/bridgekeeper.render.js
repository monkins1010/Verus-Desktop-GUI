import React from "react";
import { CONFIRM_DATA, API_SUCCESS, SEND_RESULT } from "../../../util/constants/componentConstants";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import SimpleLoader from "../../../containers/SimpleLoader/SimpleLoader";

export const BridgekeeperRender = function () {
  const { startBridgekeeper, getBridgekeeperInfo, state, back, props, updateInput, setConfFile } =
    this;
  const { loading, continueDisabled, formStep, txData, logData, ethKey, infuraNode } = state;
  const { closeModal } = props;

  return (
    <div style={{ width: "100%", paddingLeft: 35, paddingRight: 35 }}>
      <TextField
        error={false}
        label="Enter Ethereum Private Key"
        variant="outlined"
        onChange={updateInput}
        placeholder="0x..........."
        name="ethKey"
        value={ethKey}
        style={{ marginTop: 5, width: "100%" }}
      />
      <TextField
        error={false}
        label="Enter infura Endpoint"
        variant="outlined"
        placeholder="https://goerli.infura.io/v3/......"
        onChange={updateInput}
        name="infuraNode"
        value={infuraNode}
        style={{ marginTop: 10, width: "100%" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Button
          variant="outlined"
          onClick={setConfFile}
          disabled={false}
          size="large"
          color="primary"
          style={{ marginTop: 10 }}
        >
          {"Save Settings"}
        </Button>
        <Button
          variant="outlined"
          onClick={getBridgekeeperInfo}
          disabled={false}
          size="large"
          color="primary"
          style={{ marginTop: 10 }}
        >
          {"Status"}
        </Button>
      </div>
      <pre class="prettyprint" id="log">
        {logData}
      </pre>
    </div>
  );
};

export const BridgekeeperFormRender = function () {
  const { state, props, getFormData, getContinueDisabled } = this;
  const { modalProps } = props;

  return null;
};
