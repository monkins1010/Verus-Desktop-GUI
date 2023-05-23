
import React from 'react';
import { VirtualizedTable } from '../VirtualizedTable/VirtualizedTable'
import { SortDirection } from 'react-virtualized';
import SearchBar from '../SearchBar/SearchBar';
import { FormControl, Select, MenuItem } from '@material-ui/core';
import { openAddCoinModal } from '../../actions/actionDispatchers';

export const CurrenciesCardRender = (
  openCurrencyInfo,
  getDisplayCurrencies,
  filterCurrencies,
  currencies,
  state,
  props
) => {
  const {
    setCurrencySearchTerm,
    currencySearchTerm,
    displayCurrencies,
    setDisplayCurrencies,
    activeTicker,
    setActiveTicker,
    verusCoins,
  } = state;
  const { allCurrencies, info, blacklists, identities } = props;
  const coins = Object.keys(allCurrencies);

  return (
    <React.Fragment>
      {currencies != null &&
        coins != null &&
        coins.length > 0 &&
        (props.coin == null || coins.includes(props.coin)) &&
        Object.values(allCurrencies).flat().length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 8,
            }}
          >
            {/* {props.coin == null && (
              <FormControl variant="outlined">
                <Select
                  value={coins.findIndex((value) => value === activeTicker)}
                  onChange={(e) =>
                    setActiveTicker(e.target.value === -1 ? null : coins[e.target.value])
                  }
                >
                  <MenuItem value={-1}>{"All Blockchains"}</MenuItem>
                  {coins.map((coin, index) => {
                    return <MenuItem value={index}>{coin}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            )} */}
            <SearchBar
              label={"Filter"}
              variant={"outlined"}
              placeholder={"Type and press enter"}
              clearable={true}
              style={{
                width: 300,
              }}
              onChange={(e) => setCurrencySearchTerm(e.target.value)}
              onClear={() => {
                setCurrencySearchTerm("");
                setDisplayCurrencies(
                  filterCurrencies(
                    getDisplayCurrencies(currencies, info, blacklists, identities),
                    ""
                  )
                );
              }}
              onSubmit={() =>
                setDisplayCurrencies(
                  filterCurrencies(
                    getDisplayCurrencies(currencies, info, blacklists, identities),
                    currencySearchTerm
                  )
                )
              }
              value={currencySearchTerm}
            />
          </div>
        )}
      {displayCurrencies.length > 0 ? (
        CurrencyTableRender(displayCurrencies, openCurrencyInfo, props)
      ) : verusCoins.length == 0 ? (
        <a href="#" style={{ color: "rgb(49, 101, 212)" }} onClick={() => openAddCoinModal()}>
          {"Add VRSC to discover new currencies!"}
        </a>
      ) : (
        <div>{"No currencies found."}</div>
      )}
    </React.Fragment>
  );
};

export const CurrencyTableRender = (displayCurrencies, openCurrencyInfo, props) => {
  return (
    <div style={{ height: ((50 * displayCurrencies.length) + 50), maxHeight: 500, width: '100%' }}>
      <VirtualizedTable
        rowCount={displayCurrencies.length}
        sortBy="confirmations"
        sortDirection={ SortDirection.ASC }
        onRowClick={ async ({rowData}) => await openCurrencyInfo(rowData, props.identities) }
        rowGetter={({ index }) => displayCurrencies[index]}
        columns={[
          {
            width: 100,
            cellDataGetter: ({ rowData }) => {
              return (
                <div
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textOverflow: "ellipsis",
                  }}
                >
                  {rowData.currency.name}
                </div>
              );
            },
            flexGrow: 1,
            label: 'Name',
            dataKey: 'name'
          },
          {
            width: 100,
            cellDataGetter: ({ rowData }) => {
              return (
                <div
                  style={{
                    fontWeight: "bold",
                    color: rowData.status === 'pending'
                      ? "#878787" /* GRAY */
                      : rowData.status === 'failed'
                      ? "rgb(212, 49, 62)" /* RED */
                      : "rgb(74, 166, 88)" /* GREEN */,
                    flex: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textOverflow: "ellipsis",
                  }}
                >
                  {rowData.status === 'pending'
                    ? `Pending (${rowData.ageString})`
                    : rowData.status === 'failed'
                    ? "Failed"
                    : "Active"}
                </div>
              );
            },
            flexGrow: 1,
            label: 'Status',
            dataKey: 'status'
          },
          {
            width: 160,
            cellDataGetter: ({ rowData }) => {
              return (
                <div
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textOverflow: "ellipsis",
                  }}
                >
                  {rowData.currency.endblock === 0
                    ? `Permanent ${
                        rowData.isToken ? (rowData.isGateway ? "Gateway" : "Token") : "Blockchain"
                      }`
                    : `Temporary ${
                        rowData.isToken ? (rowData.isGateway ? "Gateway" : "Token") : "Blockchain"
                      }`}
                </div>
              );
            },
            flexGrow: 1,
            label: 'Type',
            dataKey: 'type'
          },
          {
            width: 100,
            cellDataGetter: ({ rowData }) => {
              return (
                <div
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textOverflow: "ellipsis",
                  }}
                >
                  {rowData.status === "pending" ? "-" : rowData.ageString}
                </div>
              );
            },
            flexGrow: 1,
            label: 'Age',
            dataKey: 'age',
          },
          {
            width: 60,
            flexGrow: 1,
            cellDataGetter: ({ rowData }) => {
              return (
                <div
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textOverflow: "ellipsis",
                  }}
                >
                  {props.whitelists &&
                  props.whitelists[rowData.currency.spottername]
                    ? props.whitelists[rowData.currency.spottername].some(
                        (whitelistCoin) =>
                          whitelistCoin.toUpperCase() ===
                          rowData.currency.name.toUpperCase()
                      ) ||
                      Object.keys(props.activatedCoins).some(
                        (activeCoinKey) =>
                          activeCoinKey.toUpperCase() ===
                          rowData.currency.name.toUpperCase()
                      )
                      ? "Yes"
                      : "No"
                    : "-"}
                </div>
              );
            },
            label: 'Added',
            dataKey: 'added',
          },
        ]}
      />
    </div>
  )
}
