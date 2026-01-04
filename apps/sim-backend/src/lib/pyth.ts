import { HermesClient } from '@pythnetwork/hermes-client';
import { AptosPriceServiceConnection } from '@pythnetwork/pyth-aptos-js';

export const aptosPythClient = new AptosPriceServiceConnection(
    'https://hermes.pyth.network',
);

export const hermesPythClient = new HermesClient(
    'https://hermes.pyth.network',
);