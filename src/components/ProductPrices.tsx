import { PublicKey } from "@solana/web3.js";
import { dexterity, useProduct, useTrader } from "contexts/DexterityProviders";
import { FC, useCallback, useEffect } from "react";
import Button from "./Button";

export const ProductPrices: FC = () => {
    const { markPrice, indexPrice, setIndexPrice, setMarkPrice, selectedProduct } = useProduct()
    const { trader } = useTrader()
    const UNINITIALIZED = new PublicKey('11111111111111111111111111111111');

    const updatePrices = useCallback(async() => {
            for (const [productName, obj] of dexterity.Manifest.GetProductsOfMPG(trader.mpg)) {
              const { index: productIndex, product } = obj;

              if (productIndex != selectedProduct.index) {
                  continue;
              }

              const meta = dexterity.productToMeta(product);

              if (meta.productKey.equals(UNINITIALIZED)) {
                  continue;
              }

              if (product.combo?.combo) {
                  continue;
              }

              await trader.updateMarkPrices()
      
              const index = Number(dexterity.Manifest.GetIndexPrice(trader.markPrices, meta.productKey));
              const mark = Number(dexterity.Manifest.GetMarkPrice(trader.markPrices, meta.productKey));
      
              console.log({index, mark})
      
              setIndexPrice(index)
              setMarkPrice(mark)
            }
        }, [trader, setIndexPrice, setMarkPrice, selectedProduct]); // Removed markPrice and indexPrice

        useEffect(() => {
            const intervalId = setInterval(() => {
                updatePrices();
            }, 500);
    
            return () => clearInterval(intervalId);
        }, [updatePrices]);
        return (
            <div className="border border-white rounded-lg p-4 mt-4">
              <h1 className="text-2xl mb-4">Product Info</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="font-semibold">Index Price:</div>
                <div>${indexPrice.toLocaleString()}</div>
                <div className="font-semibold">Mark Price:</div>
                <div>${markPrice.toLocaleString()}</div>
              </div>
              <Button
                text={'↻'}
                onClick={updatePrices}
                className="w-6 mt-4 bg-gradient-to-br from-[#80ff7d] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black"
              />
            </div>
          );
}
