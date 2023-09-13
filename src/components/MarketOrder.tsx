import React, { FC, useState, useCallback, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useManifest, useTrader, dexterity, useProduct } from 'contexts/DexterityProviders';
import { notify } from '../utils/notifications';
import { PublicKey } from '@solana/web3.js';
import Button from './Button';

export const PlaceMarketOrder: FC = () => {
    const { publicKey } = useWallet();
    const { manifest } = useManifest();
    const { trader } = useTrader();
    const { selectedProduct, markPrice } = useProduct()
    const [slippage, setSlippage] = useState<number | null>(null);
    const [size, setSize] = useState<number | null>(null);
    const [orderType, setOrderType] = useState<'Long' | 'Short' | 'None'>('None');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

    const callbacks = {
        onGettingBlockHashFn: () => {},
        onGotBlockHashFn: () => {},
        onConfirm: (txn: string) => notify({ type: 'success', message: 'Order Placed Successfully!', txid: txn })
    }

    const handlePlaceOrder = useCallback(async () => {
        if (!markPrice || !slippage || !size || !publicKey || !manifest || !selectedProduct) return;

        const priceFraction = dexterity.Fractional.New(orderType === 'Short' ? markPrice - ((markPrice * slippage) / 100) : markPrice + ((markPrice * slippage) / 100), 0);
        const sizeFraction = dexterity.Fractional.New(size * 10 ** selectedProduct.exponent, selectedProduct.exponent);

        try {
            setIsLoading(true);
            await trader.newOrder(
                selectedProduct.index,
                orderType === 'Short' ? false : true,
                priceFraction,
                sizeFraction,
                false,
                new PublicKey(process.env.NEXT_PUBLIC_REFERRER_TRG!),
                process.env.NEXT_PUBLIC_REFERRER_BPS!,
                null,
                null,
                callbacks
            );
            setIsSuccess(true);
        } catch (error: any) {
            setIsSuccess(false);
            notify({ type: 'error', message: 'Placing order failed!', description: error?.message });
        } finally {
            notify({ type: 'success', message: `Market ${orderType} Order Placed Successfully!` });
            setIsLoading(false);
        }
    }, [slippage, size, orderType, publicKey, manifest, trader, selectedProduct, markPrice]);

    const isFormValid = useMemo(() => markPrice !== null && slippage !== null && size !== null && orderType !== 'None', [slippage, size, orderType, markPrice]);

    return (
        <div className="flex flex-col justify-center items-center border border-white rounded-lg p-4 mt-4">
            <h1 className='text-2xl mb-4'>Place a Market Order</h1>

            <div className="w-full flex flex-col items-center">
                <label htmlFor="slippageInput" className="text-xl font-semibold mb-1">Price</label>
                <input
                    id="slippageInput"
                    type="number"
                    placeholder="Slipage %"
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                    className="w-full mb-4 p-2 rounded-md text-xl text-black border border-gray-300"
                    aria-label="Enter the slippgage for the order"
                />
            </div>

            <div className="w-full flex flex-col items-center">
                <label htmlFor="sizeInput" className="text-xl font-semibold mb-1">Size</label>
                <input
                    id="sizeInput"
                    type="number"
                    placeholder="Size"
                    onChange={(e) => setSize(parseFloat(e.target.value))}
                    className="w-full mb-4 p-2 rounded-md text-xl text-black border border-gray-300"
                    aria-label="Enter the size for the order"
                />
            </div>

            <div className="flex items-center space-x-4">
                <div className={`p-2 pr-8 pl-8 ${orderType === 'Long' ? 'bg-[#80ff7d]' : 'bg-gray-200'}`}>
                    <label className="text-xl font-semibold text-white" htmlFor="isMarketLongCheckbox">
                        <input
                            id="isMarketLongCheckbox"
                            type="checkbox"
                            className="hidden"
                            checked={orderType === 'Long'}
                            onChange={() => setOrderType(orderType === 'Long' ? 'None' : 'Long')}
                        />
                        Long
                    </label>
                </div>
                <div className={`p-2 pr-8 pl-8 ${orderType === 'Short' ? 'bg-[#ff80f2]' : 'bg-gray-200'}`}>
                    <label className="text-xl font-semibold text-white" htmlFor="isMarketShortCheckbox">
                        <input
                            id="isMarketShortCheckbox"
                            type="checkbox"
                            className="hidden"
                            checked={orderType === 'Short'}
                            onChange={() => setOrderType(orderType === 'Short' ? 'None' : 'Short')}
                        />
                        Short
                    </label>
                </div>
            </div>

            <Button
                text="🛒 Place Market Order"
                onClick={handlePlaceOrder}
                disabled={!isFormValid || isLoading}
                className={isFormValid ? 'mt-4 bg-gradient-to-br from-[#80ff7d] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black' : ''}
                isLoading={isLoading}
                status={isSuccess ? 'success' : 'failed'}
            />
        </div>
    );
};
