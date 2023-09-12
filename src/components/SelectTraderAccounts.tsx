import React, { FC, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useManifest, useTrader, dexterity } from 'contexts/DexterityProviders';
import { PublicKey } from '@solana/web3.js';
import { notify } from "../utils/notifications";
import { formatPubKey } from 'utils/util';
import Button from './Button';

type TraderAccount = {
    pubkey: PublicKey;
    trg: any
};

interface TraderAccountDropdownProps {
    accounts: TraderAccount[];
    onSelect: (value: string) => void;
}

const TraderAccountDropdown: FC<TraderAccountDropdownProps> = ({ accounts, onSelect }) => {
    return (
        <select onChange={(e) => onSelect(e.target.value)} className='text-black text-xl'>
            <option value="default">Select a Trader Account</option>
            {accounts.map((trg, index) => (
                <option key={index} value={trg.pubkey.toBase58()}>{formatPubKey(trg.pubkey.toBase58())}</option>
            ))}
        </select>
    );
};

export const SelectTraderAccounts: FC = () => {
    const { publicKey } = useWallet();
    const { manifest } = useManifest();  // Assuming createTRG is the function to create a new TRG
    const [trgsArr, setTrgsArr] = useState<TraderAccount[]>([]);
    const [selectedTrg, setSelectedTrg] = useState<string>('');
    const { mpgPubkey, setTrader } = useTrader()

    useEffect(() => {
        fetchTraderAccounts();
    }, [publicKey]);

    const fetchTraderAccounts = useCallback(async () => {
        if (!publicKey) return;
        if (!manifest) return;
        if (!manifest.fields) return
        if (!manifest.fields.wallet) return
        if (!manifest.fields.wallet.publicKey) return;

        try {
            const trgs = await manifest.getTRGsOfOwner(publicKey, new PublicKey(mpgPubkey));
            setTrgsArr(trgs);
        } catch (error: any) {
            notify({ type: 'error', message: `Selecting Trader Account failed!`, description: error?.message });
        }
    }, [publicKey, manifest]);

    const handleCreateTRG = useCallback(async () => {
        try {
            await manifest.createTrg(new PublicKey(mpgPubkey));
            fetchTraderAccounts();
        } catch (error: any) {
            notify({ type: 'error', message: `Creating Trader Account failed!`, description: error?.message });
        }
    }, [fetchTraderAccounts, manifest]);

    const handleSelection = useCallback(async (selectedValue: string) => {
        if (selectedValue == "default") return
        setSelectedTrg(selectedValue);
        console.log({ selectedValue })
        const trader = new dexterity.Trader(manifest, new PublicKey(selectedValue))
        const trg = await manifest.getTRG(new PublicKey(selectedValue))
        console.log('Huh ', { trg })
        await trader.update()
        await manifest.updateOrderbooks(new PublicKey(mpgPubkey));
        setTrader(trader)
    }, [manifest, setTrader]);

    return (
        <div className="flex flex-column justify-center items-center">
          <h1 className='text-2xl mr-3'>Selecting or Creating a Trader Account</h1>
          {trgsArr.length > 0 ? (
            <>
              <TraderAccountDropdown accounts={trgsArr} onSelect={handleSelection} />
              <Button text="🔄 Load Trader Accounts" onClick={fetchTraderAccounts} disabled={!publicKey} className='bg-gradient-to-br  from-[#80ff7d] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black' />
            </>
          ) : (
            <>
              <Button text="🔄 Load Trader Accounts" onClick={fetchTraderAccounts} disabled={!publicKey} className='bg-gradient-to-br  from-[#80ff7d] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black' />
              <Button text="➕ Create New Trader Account" onClick={handleCreateTRG} disabled={!publicKey} className='bg-gradient-to-br  from-[#80ff7d] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black' />
            </>
          )}
        </div>
      );
};
