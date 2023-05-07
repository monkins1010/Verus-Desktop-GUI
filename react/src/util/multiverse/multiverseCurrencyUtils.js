import {
  CENTRALIZED_ISSUANCE,
  DEFUALT_ISSUANCE,
  IS_TOKEN_FLAG,
  IS_FRACTIONAL_FLAG,
  IS_PBAAS_FLAG,
  IS_GATEWAY_FLAG,
} from "../constants/flags";
import { checkFlag } from "../flagUtils";
import { blocksToTime } from "../blockMath";

/**
 * Calculates a decentralization score from 0-100 based on
 * chain preallocaation, proofprotocol (2 = centralized minting),
 * and number of preassigned notaries
 * @param {Object[]} preallocation The preallocation property of the chain obj
 * @param {Number} proofprotocol The proofprotocol property of the chain obj
 * @param {Object[]} notaries The notaries property of the chain obj
 * @param {Number} emitted The total number of emitted coins
 */
export const getDecentralizationScore = (
  preallocation = [],
  proofprotocol = DEFUALT_ISSUANCE,
  notaries = [],
  emitted = Infinity
) => {
  let score = 0;
  let centralizedFunds = 0;
  if (proofprotocol == CENTRALIZED_ISSUANCE || notaries.length > 0)
    return score;

  // TODO: Change when protocol changes from array of objects to object
  preallocation.map((preallocationObj) => {
    const id = Object.keys(preallocationObj)[0];
    centralizedFunds += preallocationObj[id];
  });

  score = centralizedFunds / emitted;

  return score > 100 ? 100 : score;
};

/**
 * Parses a currency into a displayable currency by adding some display data
 * @param {Object} currency
 */
export const getCurrencyInfo = (
  currency,
  launchSystemHeight,
  ownedIdentities = []
) => {
  const {
    options,
    minpreconversion,
    bestcurrencystate,
    startblock,
    conversions,
    proofprotocol,
    name,
    spotterid,
    launchsystemid
  } = currency;
  let finalStartBlock = launchsystemid !== spotterid ? 1 : startblock;

  const { supply } = bestcurrencystate != null ? bestcurrencystate : {};
  const isGateway = checkFlag(options, IS_GATEWAY_FLAG);
  const isToken = checkFlag(options, IS_TOKEN_FLAG) || isGateway;

  const isReserve = checkFlag(options, IS_FRACTIONAL_FLAG);
  const isPending = finalStartBlock > launchSystemHeight;
  const age = launchSystemHeight - finalStartBlock;
  const isFailed =
    !isPending &&
    minpreconversion != null &&
    minpreconversion.length > 0 &&
    minpreconversion.every((n) => n > 0) &&
    supply === 0;
  const ownedIdentity = ownedIdentities.find((id) => id.identity.name.toLowerCase() === name.toLowerCase());
  const spendableTo =
    !isFailed &&
    (isReserve || (isPending && conversions != null && conversions.length > 0));
  const spendableFrom = !isFailed && !isPending;

  return {
    age,
    ageString: blocksToTime(Math.abs(age)),
    isToken,
    isGateway,
    status: isFailed ? "failed" : isPending ? "pending" : "active",
    spendableTo,
    spendableFrom,
    preConvert: spendableTo && age < 0,
    currency,
    mintable:
      proofprotocol === 2 &&
      ownedIdentity != null &&
      ownedIdentity.status === "active",
    ownedIdentity,
  };
};
