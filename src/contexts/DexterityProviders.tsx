import React, { ReactNode, createContext, useContext, useState } from "react";
import dexterityTs, {Manifest, Trader} from '@hxronetwork/dexterity-ts'
import { useNetworkConfiguration } from "./NetworkConfigurationProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
export const dexterity = dexterityTs

interface ManifestContextProps {
  manifest: InstanceType<typeof Manifest>;
  setManifest: React.Dispatch<React.SetStateAction<InstanceType<typeof Manifest>>>; 
}

const ManifestContext = createContext<ManifestContextProps | undefined>(undefined);

export const ManifestProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [manifest, setManifest] = useState(null);

  return (
    <ManifestContext.Provider value={{ manifest, setManifest }}>
      {children}
    </ManifestContext.Provider>
  );
};

export const useManifest = () => {
  const context = useContext(ManifestContext);
  if (!context) {
    throw new Error("useManifest must be used within a ManifestProvider");
  }
  return context;
};

export interface Product {
  index: number;
  name: string;
  minSize: number;
  exponent: number
}

interface TraderContextProps {
  trader: InstanceType<typeof Trader>;
  setTrader: React.Dispatch<React.SetStateAction<InstanceType<typeof Trader>>>;
  mpgPubkey: string;
  setMpgPubkey: React.Dispatch<React.SetStateAction<string>>;
  selectedProduct: Product;
  setSelectedProductIndex: React.Dispatch<React.SetStateAction<Product>>
}

const TraderContext = createContext<TraderContextProps | undefined>(undefined);

export const TraderProvider: React.FC<{children: ReactNode}> = ({ children }) => {

  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;

  // if (devnet) BITCCOIN MPG; else if (mainnet) MAJORS MPG
  let defaultMpg = 
  network == 'devnet' ? 'HyWxreWnng9ZBDPYpuYugAfpCMkRkJ1oz93oyoybDFLB' : 
  network == 'mainnet-beta' ? '4cKB5xKtDpv4xo6ZxyiEvtyX3HgXzyJUS1Y8hAfoNkMT' : null;

  let defaultProduct: Product = {
    index: 0,
    name: 'BTCUSD-PERP',
    minSize: 0.0001,
    exponent: 4,
  }

  const [trader, setTrader] = useState(null);
  const [mpgPubkey, setMpgPubkey] = useState(defaultMpg)
  const [selectedProduct, setSelectedProductIndex] = useState(defaultProduct)

  return (
    <TraderContext.Provider value={{ trader, setTrader, mpgPubkey, setMpgPubkey, selectedProduct, setSelectedProductIndex }}>
      {children}
    </TraderContext.Provider>
  );
};

export const useTrader = () => {
  const context = useContext(TraderContext);
  if (!context) {
    throw new Error("useTrader must be used within a TraderProvider");
  }
  return context;
};