import React, { FC, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useManifest, useTrader, dexterity, useProduct } from 'contexts/DexterityProviders';
import { notify } from '../utils/notifications';
import { PublicKey } from '@solana/web3.js';

export const FundingTrader: FC = () => {
    const { publicKey } = useWallet();
    const { manifest } = useManifest();
    const { trader } = useTrader();
    const { selectedProduct } = useProduct()
    const [amount, setAmount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [depositStatus, setDepositStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
    const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

    const callbacks = {
        onGettingBlockHashFn: () => notify({ type: 'waiting', message: 'Fetching BlockHash...' }),
        onGotBlockHashFn: () => notify({ type: 'success', message: 'Got BlockHash!' }),
        onConfirm: async(txn: string) => {
            notify({ type: 'success', message: 'Deposited successfully into trader account!', txid: txn });
            setDepositStatus('success');
            console.log('HERE CONFIRMED')
        }
    };

    const handleDeposit = useCallback(async () => {
        if (!amount || !publicKey || !manifest) return;
        try {
            setIsLoading(true);
            setDepositStatus('processing');
            await trader.deposit(dexterity.Fractional.New(amount, 0), callbacks);
        } catch (error: any) {
            setDepositStatus('failed');
            notify({ type: 'error', message: 'Deposit failed!', description: error?.message });
        } finally {
            setIsLoading(false);
        }
    }, [amount, publicKey, manifest, trader, selectedProduct]);

    const handleWithdraw = useCallback(async () => {
        if (!amount || !publicKey || !manifest) return;

        try {
            setIsLoading(true);
            setWithdrawStatus('processing');
            await trader.withdraw(dexterity.Fractional.New(amount, 0));
            setWithdrawStatus('success');
        } catch (error: any) {
            setWithdrawStatus('failed');
            notify({ type: 'error', message: 'Withdrawal failed!', description: error?.message });
        } finally {
            notify({ type: 'success', message: 'Withdrawn successfully from trader account!' });
            setIsLoading(false);
        }
    }, [amount, publicKey, manifest, trader, selectedProduct]);

    return (
        <div className="flex flex-col justify-center items-center border border-white rounded-lg p-4 mt-4">
          <h1 className='text-2xl mb-4'>Funding Trader Account</h1>
          
          <div className="w-full flex flex-col items-center mb-4">
            <label htmlFor="amountInput" className="text-xl font-semibold mb-1">Amount</label>
            <input
              id="amountInput"
              type="number"
              placeholder="Amount"
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full p-2 rounded-md text-xl text-black border border-gray-300"
              aria-label="Enter the amount for deposit or withdraw"
            />
          </div>
      
          <div className="flex justify-center space-x-4 w-full">
            <button
              onClick={handleDeposit}
              className={`group text-md w-30 m-2 btn ${amount !== null ? 'bg-gradient-to-br  from-[#80ff7d] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={amount === null || isLoading}
            >
              {isLoading && depositStatus === 'processing' ? 'Processing...' : depositStatus === 'success' ? 'Success!' : depositStatus === 'failed' ? 'Failed!' : '🏦 Deposit'}
            </button>
            
            <button
              onClick={handleWithdraw}
              className={`group text-md w-30 m-2 btn ${amount !== null ? 'bg-gradient-to-br from-[#ff80f2] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={amount === null || isLoading}
            >
              {isLoading && withdrawStatus === 'processing' ? 'Processing...' : withdrawStatus === 'success' ? 'Success!' : withdrawStatus === 'failed' ? 'Failed!' : '💸 Withdraw'}
            </button>
          </div>
        </div>
      );
      
};
