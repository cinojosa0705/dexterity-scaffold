import React, { FC, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useManifest, useTrader, dexterity } from 'contexts/DexterityProviders';
import { notify } from '../utils/notifications';
import { PublicKey } from '@solana/web3.js';

export const FundingTrader: FC = () => {
    const { publicKey } = useWallet();
    const { manifest } = useManifest();
    const { trader, selectedProduct } = useTrader();
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
        <>
            <div className="flex flex-column justify-center items-center">
                <h1 className='text-2xl'>Funding Trader</h1>

                <button
                    onClick={handleDeposit}
                    className={`group text-md w-30 m-2 btn ${amount !== null ? 'bg-gradient-to-br  from-[#80ff7d] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black' : 'bg-gray-300 cursor-not-allowed'}`}
                    disabled={amount === null || isLoading}
                >
                    {isLoading && depositStatus === 'processing' ? 'Processing...' : depositStatus === 'success' ? 'Success!' : depositStatus === 'failed' ? 'Failed!' : '🏦 Deposit'}
                </button>

                <input
                    type="number"
                    placeholder="Amount"
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    className="m-2 p-2 text-xl text-black"
                    aria-label="Enter the amount for deposit or withdraw"
                />

                <button
                    onClick={handleWithdraw}
                    className={`group text-md w-30 m-2 btn ${amount !== null ? 'bg-gradient-to-br from-[#ff80f2] from-[#80ff7d] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black' : 'bg-gray-300 cursor-not-allowed'}`}
                    disabled={amount === null || isLoading}
                >
                    {isLoading && withdrawStatus === 'processing' ? 'Processing...' : withdrawStatus === 'success' ? 'Success!' : withdrawStatus === 'failed' ? 'Failed!' : '💸 Withdraw'}
                </button>
            </div>
        </>
    );
};
