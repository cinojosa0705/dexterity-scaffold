import { PublicKey } from "@solana/web3.js";
import { useProduct, useTrader } from "contexts/DexterityProviders";
import { FC, useCallback, useEffect } from "react";
import Button from "./Button";
import { timeSince } from "utils/util";

export const AccountInfo: FC = () => {
    const { selectedProduct } = useProduct()
    const {
        trader,
        cashBalance,
        setCashBalance,
        portfolioValue,
        setPortfolioValue,
        updated,
        setUpdated,
        lastUpdated,
        setLastUpdated,
        setOrderData,
        orderData
    } = useTrader()

    const updateAccountInfo = useCallback(async () => {
        if (!trader) return;
        const cashBalance = Number(trader.getExcessInitialMarginWithoutOpenOrders())
        const portfolioValue = Number(trader.getPortfolioValue())
        setOrderData(Array.from(await Promise.all(trader.getOpenOrders([selectedProduct.name]))))
        setCashBalance(cashBalance)
        setPortfolioValue(portfolioValue)
        setUpdated(true)
        setLastUpdated(Date.now())
    }, [trader, selectedProduct]); // Removed markPrice and indexPrice

    useEffect(() => {
        trader.connect(updateAccountInfo, updateAccountInfo)

        return () => {
            trader.disconnect()
        }
    }, [updateAccountInfo]);

    return (
        <>
            {updated && (
                <div className="border border-white rounded-lg p-4">
                    <h1 className="text-2xl mb-4">Account Info</h1>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="font-semibold">Cash Balance:</div>
                        <div>${cashBalance.toLocaleString()}</div>

                        <div className="font-semibold">Portfolio Value:</div>
                        <div>${portfolioValue.toLocaleString()}</div>

                        <div className="font-semibold">Open Orders:</div>
                        <div>{orderData.length ?? 0}</div>

                        <div className="font-semibold">Last Updated:</div>
                        <div>{timeSince(lastUpdated)}</div>
                    </div>
                    <Button
                        text={'↻'}
                        onClick={updateAccountInfo}
                        className="w-6 mt-4 bg-gradient-to-br from-[#80ff7d] to-[#80ff7d] hover:from-white hover:to-purple-300 text-black"
                    />
                </div>
            )}
        </>


    );
}



