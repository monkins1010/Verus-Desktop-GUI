import React from 'react';
import { PUBLIC_ADDRS, PRIVATE_ADDRS, NATIVE, PRIVATE_BALANCE } from '../../../util/constants/componentConstants'
import SearchBar from '../../../containers/SearchBar/SearchBar'
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import IconDropdown from '../../../containers/IconDropdown/IconDropdown'
import { VirtualizedTable } from '../../../containers/VirtualizedTable/VirtualizedTable'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import QRCode from 'qrcode.react';
import { copyDataToClipboard } from '../../../util/copyToClipboard';
import { IconButton } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Config from '../../../config';

export const ReceiveCoinRender = function() {
  return (
    <div style={{ width: "100%" }}>
      { this.state.qrAddress ? ReceiveAddressQrRender.call(this) : ReceiveCoinMainRender.call(this) }
    </div>
  );
}

export const ReceiveCoinMainRender = function() {
  const { activeCoin } = this.props
  const { selectedMode, addresses, showZeroBalances } = this.state

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {activeCoin.mode === NATIVE && !this.isIdentity && (
        <div className="d-flex justify-content-between">
          {ReceiveCurrencyPickerRender.call(this)}
          <SearchBar
            label={"Address Search"}
            placeholder={"Type and press enter"}
            name="addressSearchTerm"
            clearable={true}
            style={{
              width: 300,
            }}
            onChange={this.setInput}
            onClear={this.clearAddrSearch}
            onSubmit={() => this.filterAddresses(addresses)}
            value={this.state.addressSearchTerm}
          />
        </div>
      )}
      <div style={{ marginTop: 10, flex: 1, border: "1px solid #E0E0E0" }}>
        {ReceiveAddressTableRender.call(this)}
      </div>
      {activeCoin.mode === NATIVE && !this.isIdentity && (
        <div style={{ paddingTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() =>
                this.setState({
                  showZeroBalances: !showZeroBalances
                })
              }
              style={{
                fontSize: 14,
                backgroundColor: "rgb(49, 101, 212)",
                borderWidth: 1,
                borderColor: "rgb(49, 101, 212)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {`${showZeroBalances ? "Hide" : "Show"} zero balance addresses`}
            </button>
            <button
              className="btn btn-primary"
              type="button"
              disabled={
                addresses[PUBLIC_ADDRS].length === 0 &&
                addresses[PRIVATE_ADDRS].length === 0
              }
              onClick={() =>
                this.getNewAddress(
                  selectedMode === PRIVATE_BALANCE
                    ? PRIVATE_ADDRS
                    : PUBLIC_ADDRS
                )
              }
              style={{
                fontSize: 14,
                backgroundColor: "rgb(49, 101, 212)",
                borderWidth: 1,
                borderColor: "rgb(49, 101, 212)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {`Create new ${selectedMode} address`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const ReceiveCurrencyPickerRender = function() {
  const { balanceCurr } = this.state
  let currencyArr = [this.props.activeCoin.id, ...this.props.whitelist]

  return (
    <Autocomplete
      options={ currencyArr }
      style={{ 
        width: 300,
        visibility: currencyArr.length > 1 ? "unset" : "hidden",
      }}
      disableClearable={true}
      value={ balanceCurr }
      onChange={(e, value) => { this.setState({balanceCurr: value}) }}
      renderInput={params => (
        <TextField
          {...params}
          label="Display Currency"
          fullWidth
        />
      )}
    />
  )
}

export const ReceiveAddressTableRender = function() {
  const { activeCoin } = this.props
  const { balanceCurr, addresses, selectedMode, showZeroBalances } = this.state
  let displayBalances = {}

  const getDisplayBalance = (rowData) => {
    const { balances } = rowData
    let displayBalance = '-';

    if (balances != null) {
      if (balanceCurr === activeCoin.id) displayBalance = balances.native;
      else {
        if (balances.reserve[balanceCurr] == null) {
          displayBalance = Config.general.native.showAddressCurrencyBalances ? 0 : "-";
        } else displayBalance = balances.reserve[balanceCurr];
      }
    }
    
    return displayBalance
  }

  const displayAddresses = showZeroBalances
    ? addresses[selectedMode]
    : addresses[selectedMode].filter((rowData) => {
        const displayBalance = getDisplayBalance(rowData);
        displayBalances[rowData.address] = displayBalance;

        return displayBalance !== 0 && displayBalance !== "-";
      });

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <VirtualizedTable
        shadeEvens
        rowCount={displayAddresses.length}
        tableRef={ el => { this.table = el; } }
        rowGetter={({ index }) => displayAddresses[index]}
        columns={[
          {
            width: 175,
            flexGrow: 2,
            cellDataGetter: ({ rowData }) => {
              return (
                <div
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textOverflow: "ellipsis"
                  }}
                >
                  {rowData.address}
                </div>
              );
            },
            label: 'Address',
            dataKey: 'address',
          },
          {
            width: 100,
            cellDataGetter: ({ rowData }) => {
              return displayBalances[rowData.address]
                ? displayBalances[rowData.address]
                : getDisplayBalance(rowData);
            },
            flexGrow: 1,
            label: 'Amount',
            dataKey: 'amount',
          },
          {
            width: 50,
            flexGrow: 1,
            cellDataGetter: ({ rowData }) => {
              return (
                <div
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textOverflow: "ellipsis"
                  }}
                >
                  {rowData.tag}
                </div>
              );
            },
            label: 'Type',
            dataKey: 'tag',
          },
          {
            width: 75,
            flexGrow: 1,
            cellDataGetter: ({ rowData }) => {
              return ReceiveAddressOptionsRender.call(this, rowData.address)
            },
            label: 'Options',
            dataKey: 'options',
          },
        ]}
      />
    </div>
  )
}

export const ReceiveAddressOptionsRender = function(address) {
  const addressOptions = this.generateAddressOptions(address)

  return (
    <div>
      <div className="d-flex align-items-center">
        <IconButton
          aria-label="Close Modal"
          size="small"
          onClick={() => copyDataToClipboard(address)}
        >
          <FileCopyIcon />
        </IconButton>
        <IconDropdown 
          items={ addressOptions }
          size="small"
          dropdownIconComponent={ <MoreVertIcon /> }
          onSelect={ (option) => this.selectAddressOption(address, option) }
        />
      </div>
    </div>
  )
}

export const ReceiveAddressQrRender = function() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: '100%'
      }}
    >
      <div
        style={{
          overflowWrap: "anywhere",
          textAlign: "center",
          width: 500,
          marginBottom: 20,
        }}
      >
        {this.state.qrAddress}
      </div>
      <QRCode value={this.state.qrAddress} size={320} />
      {this.state.showingPrivkey && (
        <React.Fragment>
          <div
            style={{
              overflowWrap: "anywhere",
              textAlign: "center",
              width: 500,
              marginBottom: 20,
              marginTop: 20,
            }}
          >
            {
              <i
                className="fas fa-exclamation-triangle"
                style={{ paddingRight: 6, color: "rgb(236,124,43)" }}
              />
            }
            {"WARNING, DO NOT SHARE!"}
            {
              <i
                className="fas fa-exclamation-triangle"
                style={{ paddingLeft: 6, color: "rgb(236,124,43)" }}
              />
            }
          </div>
          <div>
            {
              "This is a private key, anyone with access to this will have access to your funds!"
            }
          </div>
        </React.Fragment>
      )}
      <button
        className="btn btn-primary"
        type="button"
        onClick={this.toggleAddressQr}
        style={{
          fontSize: 14,
          backgroundColor: "rgb(49, 101, 212)",
          borderWidth: 1,
          borderColor: "rgb(49, 101, 212)",
          paddingRight: 20,
          paddingLeft: 20,
          marginTop: 20,
        }}
      >
        {"Back"}
      </button>
    </div>
  );
}


