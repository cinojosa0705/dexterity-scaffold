
import { FC, useEffect, useMemo } from "react";
import { SelectTraderAccounts } from '../../components/SelectTraderAccounts';
import { DexterityWallet } from "@hxronetwork/dexterity-ts";
import { useWallet } from "@solana/wallet-adapter-react";
import { dexterity, useManifest, useProduct, useTrader } from "contexts/DexterityProviders";
import { DefaultInfo } from "components/DefaultInfo";
import { PlaceLimitOrder } from "components/LimitOrder";
import { FundingTrader } from "components/FundingTrg";
import { ProductPrices } from "components/ProductPrices";
import { PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AccountInfo } from "components/AccountInfo";
import { PlaceMarketOrder } from "components/MarketOrder";
import { OpenOrders } from "components/OpenOrders";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { OpenPositions } from "components/OpenPositions";
import CandlestickChart from "components/PriceChart";

export const BasicsView: FC = ({ }) => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const { manifest, setManifest } = useManifest()
  const { trader } = useTrader()
  const { selectedProduct, setIndexPrice, setMarkPrice } = useProduct()
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;

  useMemo(async () => {
    if (!publicKey) return
    const DexWallet: DexterityWallet = {
      publicKey: publicKey!,
      signTransaction,
      signAllTransactions,
    }
    console.log({ DexWallet })
    const rpc =
      network == 'devnet' ? process.env.NEXT_PUBLIC_DEVNET_RPC! :
        network == 'mainnet-beta' ? process.env.NEXT_PUBLIC_MAINNET_RPC! :
          clusterApiUrl(network)
    const manifest = await dexterity.getManifest(rpc, true, DexWallet);
    console.log('Manifest: ', manifest)
    setManifest(manifest);
  }, [publicKey]);

  useEffect(() => { }, [trader, setIndexPrice, setMarkPrice])

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br  from-[#80ff7d] to-[#80ff7d] mt-10 mb-8">
          Basics
        </h1>
        <div className="text-center">
          <DefaultInfo />
          <SelectTraderAccounts />
          <CandlestickChart />
          {trader &&
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
              <div className="col-span-1 md:col-span-1 lg:col-span-1">
                <ProductPrices />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <PlaceLimitOrder />
                  </div>
                  <div>
                    <PlaceMarketOrder />
                  </div>
                </div>
                <div className="mt-4"><OpenOrders /></div>
              </div>
              <div className="col-span-1 md:col-span-1 lg:col-span-1 gap-4">
                <FundingTrader />
                <div className="mt-4"><AccountInfo /></div>
                <div className="mt-4"><OpenPositions/></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};
