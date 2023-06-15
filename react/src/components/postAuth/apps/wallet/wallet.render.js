import React from 'react';
import WalletStyles from './wallet.styles'
import {
  NATIVE,
  DASHBOARD,
  ETH,
  CHAIN_POSTFIX,
  FIX_CHARACTER,
  CHAIN_FALLBACK_IMAGE,
  ERC20,
  ADD_DEFAULT_COIN,
  CHAIN_OPTIONS,
  POST_SYNC,
  IS_PBAAS,
} from "../../../../util/constants/componentConstants";
import { openAddCoinModal, openModal } from '../../../../actions/actionDispatchers';
import { IconButton } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dashboard from './dashboard/dashboard'
import CoinWallet from './coinWallet/coinWallet'
import { normalizeNum } from '../../../../util/displayUtil/numberFormat';
import CurrencySelector from '../../../../containers/CurrencySelector/CurrencySelector';

const COMPONENT_MAP = {
  [DASHBOARD]: <Dashboard />,
}

export const WalletRender = function () {
  const walletApp = this.props.mainPathArray[3]
    ? this.props.mainPathArray[3]
    : null;

  if (walletApp) {
    if (COMPONENT_MAP[walletApp]) return COMPONENT_MAP[walletApp];
    else {
      const pathDestination = walletApp.split(FIX_CHARACTER);

      if (pathDestination.length > 1 && pathDestination[1] === CHAIN_POSTFIX)
        return (
          <CoinWallet
            coin={pathDestination[0]}
            balances={this.props.balances[pathDestination[0]]}
            transactions={this.props.transactions[pathDestination[0]]}
            addresses={this.props.addresses[pathDestination[0]]}
          />
        );
    }
  }

  return null;
};

export const WalletCardRender = function(coinObj) {
  const {
    fiatCurrency,
    fiatPrices,
    balances,
    mainPathArray,
    loggingOut
  } = this.props;

  const isActive = mainPathArray.includes(`${coinObj.id}${FIX_CHARACTER}${CHAIN_POSTFIX}`);
  const coinFiatRate = fiatPrices[coinObj.id]
    ? fiatPrices[coinObj.id][fiatCurrency]
    : null;
  const coinBalance = balances[coinObj.id]
    ? balances[coinObj.id].native.public.confirmed +
      (balances[coinObj.id].native.private.confirmed
        ? balances[coinObj.id].native.private.confirmed
        : 0)
    : "-";
  const balanceFiat =
    coinFiatRate && coinBalance !== "-"
      ? (coinFiatRate * coinBalance).toFixed(2)
      : "-";
  
  const errorOrLoading = coinObj.status !== POST_SYNC

  return (
    <button
      className="unstyled-button"
      onClick={() => this.openCoin(coinObj.id)}
      key={coinObj.id}
      style={WalletStyles.cardClickableContainer}
    >
      <div className="d-flex flex-column align-items-end" style={WalletStyles.cardContainer}>
        <div
          className={`card ${isActive ? "active-card" : "border-on-hover"}`}
          style={WalletStyles.cardInnerContainer}
        >
          {errorOrLoading && (
            <div
              style={{
                color: `rgb(49, 101, 212)`,
                alignSelf: "flex-end",
                height: 20,
              }}
            >
              <CircularProgress
                variant={"indeterminate"}
                thickness={4.5}
                size={20}
                color="inherit"
              />
            </div>
          )}
          <div
            className="card-body d-flex justify-content-between"
            style={{
              ...WalletStyles.cardBody,
              display: "flex",
              flexDirection: "column",
              paddingTop: errorOrLoading ? 0 : 20,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div className="d-flex" style={WalletStyles.cardCoinInfoContainer}>
                    <img
                      src={`assets/images/cryptologo/${
                        coinObj.mode === ETH ? ETH : coinObj.mode === ERC20 ? ERC20 : "btc"
                      }/${coinObj.id.toLowerCase()}.png`}
                      width="25px"
                      height="25px"
                      onError={(e) => {
                        e.target.src = CHAIN_FALLBACK_IMAGE;
                      }}
                    />
                    <h4 style={WalletStyles.cardCoinName}>
                      <strong>{coinObj.name}</strong>
                    </h4>
                  </div>
                  <h5
                    className={`text-left coin-type ${coinObj.mode === NATIVE ? "native" : "lite"}`}
                    style={WalletStyles.cardCoinType}
                  >
                    <strong>{coinObj.mode === NATIVE ? "NATIVE" : "LITE"}</strong>
                  </h5>
                </div>
                <div style={{ paddingTop: 6 }}>
                  <h6 className="text-right" style={WalletStyles.fiatValue}>
                    {`${balanceFiat}  ${fiatCurrency}`}
                  </h6>
                  <h5 className="text-right" style={WalletStyles.balance}>
                    {`${
                      isNaN(coinBalance)
                        ? coinBalance
                        : normalizeNum(Number(coinBalance.toFixed(8)))[3]
                    } ${coinObj.id}`}
                  </h5>
                </div>
              </div>
              {coinObj.options.tags.includes(IS_PBAAS) && coinObj.mode === NATIVE && <CurrencySelector coin={coinObj.id} />}
            </div>
          </div>
        </div>
        {isActive && !loggingOut && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <a
              className="text-right"
              href="#"
              onClick={() => this.openDeactivateDialog(coinObj.id, coinObj.mode)}
              style={WalletStyles.deactivateCoin}
            >
              {"Deactivate"}
            </a>
            {coinObj.mode === NATIVE && (
              <IconButton
                aria-label={"coin options"}
                onClick={() => openModal(CHAIN_OPTIONS, { chainTicker: coinObj.id })}
                size="small"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <SettingsIcon />
              </IconButton>
            )}
          </div>
        )}
      </div>
    </button>
  );
};

export const CoinDeactivateDialogue = function() {
  const { coinDeactivateDialogue } = this.state

  return (
    <Dialog
      open={coinDeactivateDialogue == null ? false : true}
      onClose={this.closeDeactivateDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{`Deactivate ${coinDeactivateDialogue.coin}?`}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {`Are you sure you would like to deactivate ${coinDeactivateDialogue.coin}?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => this.closeDeactivateDialog()} color="primary">
          {"No"}
        </Button>
        <Button
          onClick={() =>
            this.deactivate(
              coinDeactivateDialogue.coin,
              coinDeactivateDialogue.mode
            )
          }
          color="primary"
          autoFocus
        >
          {"Yes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const WalletTabsRender = function() {
  return [
    {
      title: "Wallet Dashboard",
      icon: 'fa-home',
      onClick: () => this.openDashboard(),
      isActive: () => this.props.mainPathArray.includes(DASHBOARD)
    },
    {
      title: "Add Coin",
      icon: 'fa-plus',
      onClick: () => openAddCoinModal(ADD_DEFAULT_COIN),
      isActive: () => false
    }
    // {
    //   title: "Import Coin",
    //   icon: 'fa-file-import',
    //   onClick: () => openAddCoinModal(IMPORT_COIN),
    //   isActive: () => false
    // }
  ];
};