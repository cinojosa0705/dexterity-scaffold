import React, { FC, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useManifest, useTrader, useProduct, Product } from 'contexts/DexterityProviders';
import { notify } from "../utils/notifications";

export const SelectProducts: FC = () => {
    const { publicKey } = useWallet();
    const { manifest } = useManifest();
    const [productsArr, setProductsArr] = useState<any[]>([]);
    const { trader } = useTrader();
    const { setSelectedProduct } = useProduct();

    useEffect(() => {
        fetchProducts();
    }, [publicKey, manifest, trader]);

    const fetchProducts = useCallback(async () => {
        if (!trader) {
            console.log('trader error');
            return;
        };

        try {
            setProductsArr(Array.from(trader.getProducts()));
        } catch (error: any) {
            notify({ type: 'error', message: `Selecting Trader Account failed!`, description: error?.message });
        }
    }, [publicKey, manifest, trader]);

    const handleSelection = useCallback((event) => {
        const selectedValue = event.target.value;
        if (selectedValue === "default" || productsArr.length === 0) return;
        const product = productsArr.find(([name]) => name === selectedValue);
        if (product) {
            const formattedProduct: Product = {
                name: product[0],
                index: product[1].index,
                minSize: 1 / Math.pow(10, product[1].product.outright.outright.metadata.baseDecimals),
                exponent: product[1].product.outright.outright.metadata.tickSize.exp
            };
            setSelectedProduct(formattedProduct);
        }
    }, [productsArr, setSelectedProduct]);

    return (
        <div className="flex flex-col items-center justify-center border border-white rounded-lg p-4 mt-4">
            <h1 className="text-2xl mb-4">Select Product</h1>
    
            {productsArr.length > 0 ? (
                <select onChange={handleSelection} className="form-select w-full text-black">
                    <option value="default">Choose a product...</option>
                    {productsArr.map(([productName, {index, product}]) => product.outright && (
                        <option key={productName} value={productName}>
                            {productName}
                        </option>
                    ))}
                </select>
            ) : (
                <p>No active products</p>
            )}
        </div>
    );
};
