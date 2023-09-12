
import { FC, useMemo } from "react";
import { SelectTraderAccounts } from '../../components/SelectTraderAccounts';
import { DexterityWallet } from "@hxronetwork/dexterity-ts";
import { useWallet } from "@solana/wallet-adapter-react";
import { useManifest, useTrader } from "contexts/DexterityProviders";
import { DefaultInfo } from "components/DefaultInfo";
import { PlaceLimitOrder } from "components/LimitOrder";
import { FundingTrader } from "components/FundingTrg";

export const BasicsView: FC = ({ }) => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const { manifest } = useManifest()
  const { trader } = useTrader()

  useMemo(async () => {
    const DexWallet: DexterityWallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    }
    manifest?.setWallet(DexWallet)
  }, [publicKey, manifest, trader]);

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
            <>
              <FundingTrader />
              <PlaceLimitOrder />
            </>
          }
        </div>
      </div>
    </div>
  );
};
