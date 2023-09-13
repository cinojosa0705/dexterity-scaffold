
import { FC, useEffect, useMemo } from "react";
import { SelectTraderAccounts } from '../../components/SelectTraderAccounts';
import { DexterityWallet } from "@hxronetwork/dexterity-ts";
import { useWallet } from "@solana/wallet-adapter-react";
import { dexterity, useManifest, useProduct, useTrader } from "contexts/DexterityProviders";
import { DefaultInfo } from "components/DefaultInfo";
import { PlaceLimitOrder } from "components/LimitOrder";
import { FundingTrader } from "components/FundingTrg";
import { ProductPrices } from "components/ProductPrices";
import { PublicKey } from "@solana/web3.js";
import { AccountInfo } from "components/AccountInfo";
import { PlaceMarketOrder } from "components/MarketOrder";

export const BasicsView: FC = ({ }) => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const { manifest } = useManifest()
  const { trader } = useTrader()
  const { selectedProduct, setIndexPrice, setMarkPrice } = useProduct()

  useMemo(async () => {
    const DexWallet: DexterityWallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    }
    manifest?.setWallet(DexWallet)
  }, [publicKey, manifest, trader]);

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
              </div>
              <div className="col-span-1 md:col-span-1 lg:col-span-1 gap-4">
                <FundingTrader />
                <AccountInfo />
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};
