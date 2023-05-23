import React from 'react';
import { connect } from 'react-redux';
import { newSnackbar } from '../../../../../../actions/actionCreators';
import { getAllCurrencies } from '../../../../../../util/api/wallet/walletCalls';
import { getCoinObj, isValidMultiverseName } from '../../../../../../util/coinData';
import {
  API_SUCCESS,
  ERROR_SNACK,
  INFO_SNACK,
  MID_LENGTH_ALERT,
  NATIVE,
} from "../../../../../../util/constants/componentConstants";
import { 
  PbaasChainSelectorRender
} from './pbaasChainSelector.render';

class PbaasChainSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      loadingText: "",
      disabled: false,
      chainMap: {},
      chainIds: [],
      nameMap: {} 
    };

    this.addVrsc = this.addVrsc.bind(this);
    this.fetchPbaasChains = this.fetchPbaasChains.bind(this);
    this.selectPbaasChain = this.selectPbaasChain.bind(this);
  }

  componentDidMount() {
    if (Object.values(this.props.activatedCoins).some(
      (coinObj) => coinObj.id === "VRSC" && coinObj.mode === NATIVE
    )) {
      this.fetchPbaasChains();
    } 
  }

  addVrsc() {
    this.props.setSelectedCoin(getCoinObj("VRSC"), () => {
      this.props.chooseCoin();
    });
  }

  selectPbaasChain(chain) {
    if (chain == null) {
      this.props.setSelectedCoin(null);
    } else {
      try {
        this.props.setSelectedCoin(
          getCoinObj(
            chain.name,
            chain
          )
        );
      } catch (e) {
        this.props.dispatch(
          newSnackbar(ERROR_SNACK, e.message)
        );
      }
    }
  }

  fetchPbaasChains() {
    this.setState(
      {
        loading: true,
        loadingText: "Finding chains...",
      },
      async () => {
        const chainTicker = "VRSC";

        try {
          //TODO Adapt to work with more than just VRSC
          const response = await getAllCurrencies(NATIVE, chainTicker, {
            systemtype: "pbaas"
          });

          let disabled = false;
          let chainMap = {};
          let chainIds = [];
          let nameMap = {};

          if (response.msg === API_SUCCESS) {
            if (Object.keys(response.result).length === 0) {
              this.props.dispatch(
                newSnackbar(
                  INFO_SNACK,
                  `No PBaaS chains found on "${chainTicker}".`,
                  MID_LENGTH_ALERT
                )
              );
              disabled = true;
            } else {
              response.result
                .sort((a, b) => (a.name > b.name ? 1 : -1))
                .forEach((x) => {
                  if (
                    isValidMultiverseName(x.name) &&
                    !this.props.activatedCoins[x.name.toUpperCase()]
                  ) {
                    chainMap[x.currencyid] = x;
                    chainIds.push(x.currencyid);
                    nameMap[x.name] = x.currencyid;
                  }
                });
            }
          } else {
            this.props.dispatch(
              newSnackbar(
                ERROR_SNACK,
                `Error fetching PBaaS chains for ${chainTicker}!`,
                MID_LENGTH_ALERT
              )
            );
            disabled = true;
          }

          this.setState({
            loading: false,
            loadingText: "",
            disabled,
            chainMap,
            chainIds,
            nameMap,
          });
        } catch (e) {
          console.warn(e);
          this.props.dispatch(
            newSnackbar(
              ERROR_SNACK,
              `Internal error while fetching PBaaS chains for ${chainTicker}!`,
              MID_LENGTH_ALERT
            )
          );

          this.setState({
            loading: false,
            loadingText: "",
            disabled: true,
          });
        }
      }
    );
  }

  render() {
    return PbaasChainSelectorRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    activatedCoins: state.coins.activatedCoins 
  };
};

export default connect(mapStateToProps)(PbaasChainSelector);