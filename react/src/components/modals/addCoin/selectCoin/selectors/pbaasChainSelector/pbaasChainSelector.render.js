import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React from "react";
import { CHAIN_FALLBACK_IMAGE, NATIVE } from "../../../../../../util/constants/componentConstants";

export const PbaasChainSelectorRender = function() {
  return Object.values(this.props.activatedCoins).some(
    (coinObj) => coinObj.id === "VRSC" && coinObj.mode === NATIVE
  )
    ? PbaasCoinSelectorRender.call(this)
    : PbaasChainInactiveRender.call(this);
}

export const PbaasChainInactiveRender = function() {
  return (
    <React.Fragment>
      <i className="fas fa-rocket" style={{ fontSize: 80, color: "#959595" }} />
      <div
        style={{
          marginTop: 30,
          textAlign: "center",
          paddingRight: 24,
          paddingLeft: 24
        }}
      >
        {
          "At the moment, you can only add, convert, and use Verus PBaaS (Public Blockchains as a Service) chains on the Verus Network in native mode."
        }
      </div>
      <div className="d-flex d-sm-flex justify-content-center justify-content-sm-center">
        <button
          className="btn btn-primary"
          type="button"
          onClick={this.addVrsc}
          style={{
            fontSize: 14,
            backgroundColor: "rgb(49, 101, 212)",
            borderWidth: 1,
            borderColor: "rgb(49, 101, 212)",
            paddingRight: 20,
            paddingLeft: 20,
            marginTop: 30,
          }}
        >
          <strong>{"Add VRSC"}</strong>
        </button>
      </div>
    </React.Fragment>
  );
}

export const PbaasCoinSelectorRender = function() {
  return (
    <React.Fragment>
      <h1
        style={{
          margin: 0,
          paddingBottom: 40,
          fontSize: 20,
          color: "rgb(0,0,0)",
        }}
      >
        {"Select a PBaaS Chain"}
      </h1>
      <Autocomplete
        loading={this.state.loading}
        loadingText={this.state.loadingText}
        disabled={this.state.disabled}
        options={this.state.chainIds}
        getOptionLabel={(option) => {
          return this.state.chainMap[option].name;
        }}
        style={{ width: 300 }}
        value={
          this.props.selectedCoin == null
            ? null
            : this.state.nameMap[this.props.selectedCoin.name]
        }
        onChange={(e, value) =>
          this.selectPbaasChain(this.state.chainMap[value])
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select PBaaS Chain"
            variant="outlined"
            fullWidth
          />
        )}
        renderOption={(option) => {
          return (
            <h1
              className="d-lg-flex align-items-lg-center"
              style={{ marginBottom: 0, fontSize: 16 }}
            >
              <img
                src={CHAIN_FALLBACK_IMAGE}
                width="20px"
                height="20px"
                style={{ marginRight: 5, marginBottom: 2 }}
              />
              {this.state.chainMap[option].name}
            </h1>
          );
        }}
      />
    </React.Fragment>
  );
}