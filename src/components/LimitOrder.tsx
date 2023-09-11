import React, { FC, useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useManifest, useTrader, dexterity } from 'contexts/DexterityProviders';
import { notify } from '../utils/notifications';
import { PublicKey } from '@solana/web3.js';
import Button from './Button';

export const PlaceLimitOrder: FC = () => {
    const { publicKey } = useWallet();
    const { manifest } = useManifest();
    const { trader, selectedProduct } = useTrader()
    const [price, setPrice] = useState<number | null>(null);
    const [size, setSize] = useState<number | null>(null);
    const [isLong, setIsLong] = useState<boolean>(false);
    const [isShort, setIsShort] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

    const callbacks = {
        onGettingBlockHashFn: () => notify({ type: 'waiting', message: 'Got BlockHash!' }),
        onGotBlockHashFn: () => notify({ type: 'success', message: 'Got BlockHash!' }),
        onConfirm: (txn: string) => notify({ type: 'success', message: 'Order Placed Successfully!', txid: txn })
    }

    const handlePlaceOrder = useCallback(async () => {
        if (!price || !size || !publicKey || !manifest) return;

        try {
            setIsLoading(true);
            await trader.justNewOrder(
                selectedProduct.index,
                isLong ? isShort ? false : true : true,
                dexterity.Fractional.New(price, 0),
                dexterity.Fractional.New(size * 10 ** selectedProduct.exponent, selectedProduct.exponent),
                false,
                new PublicKey(process.env.NEXT_PUBLIC_REFERRER_TRG!),
                process.env.NEXT_PUBLIC_REFERRER_BPS!,
                null,
                null,
                callbacks
            )
            setIsSuccess(true);
        } catch (error: any) {
            setIsSuccess(false);
            notify({ type: 'error', message: 'Placing order failed!', description: error?.message });
        } finally {
            setIsLoading(false);
        }
    }, [price, size, isLong, publicKey, manifest, trader, selectedProduct]);

    const [isFormValid, setIsFormValid] = useState(false)

    useEffect(() => {
        setIsFormValid(price !== null && size !== null && (isShort == null ? isLong === null ? false : true : true))
    }, [trader, price, size, isShort, isLong])

    return (
        <>
            <div className="flex flex-column justify-center items-center">
                <h1 className='text-2xl'>Place a Limit Order</h1>

                <input
                    type="number"
                    placeholder="Price"
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="m-2 p-2 text-xl text-black"
                    aria-label="Enter the price for the order"
                />

                <input
                    type="number"
                    placeholder="Size"
                    onChange={(e) => setSize(parseFloat(e.target.value))}
                    className="m-2 p-2 text-xl text-black"
                    aria-label="Enter the size for the order"
                />

                <label className="m-2 text-xl" htmlFor="isLongCheckbox">
                    <input
                        id="isLongCheckbox"
                        type="checkbox"
                        checked={isLong}
                        onChange={(e) => setIsLong(e.target.checked)}
                    />
                    Long
                </label>
                <label className="m-2 text-xl" htmlFor="isLongCheckbox">
                    <input
                        id="isShortCheckbox"
                        type="checkbox"
                        checked={isShort}
                        onChange={(e) => setIsShort(e.target.checked)}
                    />
                    Short
                </label>
                <Button text="🛒 Place Order" onClick={handlePlaceOrder} disabled={!isFormValid || isLoading} className={isFormValid ? 'bg-gradient-to-br from-green-500 to-yellow-500 hover:from-white hover:to-purple-300 text-black' : ''} isLoading={isLoading} status={isSuccess? 'success' : 'failed'} />
            </div>
        </>
    );
};
