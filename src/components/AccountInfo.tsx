import { PublicKey } from "@solana/web3.js";
import { dexterity, useProduct, useTrader } from "contexts/DexterityProviders";
import { FC, useCallback, useEffect } from "react";
import Button from "./Button";
import { timeSince } from "utils/util";

export const AccountInfo: FC = () => {
    const { selectedProduct } = useProduct()
    const {
        trader,
        cashBalance,
        setCashBalance,
        openPositionsValue,
        setOpenPositionsValue,
        portfolioValue,
        setPortfolioValue,
        initialMarginReq,
        setInitialMarginReq,
        maintananceMarginReq,
        setMaintananceMarginReq,
        accountHealth,
        setAccountHealth,
        allTimePnl,
        setAllTimePnl,
        updated,
        setUpdated,
        lastUpdated,
        setLastUpdated,
        setAccountLeverage,
        accountLeverage,
        setOrderData,
        setPositionsData
    } = useTrader()

    const updateAccountInfo = useCallback(async () => {
        if (!trader) return;
        const cashBalance = Number(trader.getExcessInitialMarginWithoutOpenOrders())
        const openPositionsValue = Number(trader.getPositionValue())
        const portfolioValue = Number(trader.getPortfolioValue())
        const initialMarginReq = Number(trader.getRequiredInitialMargin())
        const maintananceMarginReq = Number(trader.getRequiredMaintenanceMargin())
        const accountHealth =
            portfolioValue > initialMarginReq * 2 ? 'Very Healthy' :
                portfolioValue > initialMarginReq * 1.5 ? 'Healthy' :
                    portfolioValue > initialMarginReq ? 'Healthy, at risk' :
                        portfolioValue > maintananceMarginReq * 1.5 ? 'Unhealthy, at risk' :
                            portfolioValue > maintananceMarginReq ? 'Very unhealthy, reduce your risk' :
                                'Liquidatable'
        const allTimePnl = Number(trader.getPnL())
        const positions = Array.from(trader.getPositions())

        setOrderData(Array.from(await Promise.all(trader.getOpenOrders([selectedProduct.name]))))
        
        setPositionsData(positions)
        setCashBalance(cashBalance)
        setOpenPositionsValue(openPositionsValue)
        setPortfolioValue(portfolioValue)
        setInitialMarginReq(initialMarginReq)
        setMaintananceMarginReq(maintananceMarginReq)
        setAccountHealth(accountHealth)
        setAllTimePnl(allTimePnl)
        setUpdated(true)
        setAccountLeverage(portfolioValue / initialMarginReq)
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

                        <div className="font-semibold">Open Positions Value:</div>
                        <div>${openPositionsValue.toLocaleString()}</div>

                        <div className="font-semibold">Portfolio Value:</div>
                        <div>${portfolioValue.toLocaleString()}</div>

                        <div className="font-semibold">Initial Margin Requirement:</div>
                        <div>${initialMarginReq.toLocaleString()}</div>

                        <div className="font-semibold">Maintenance Margin Requirement:</div>
                        <div>${maintananceMarginReq.toLocaleString()}</div>

                        <div className="font-semibold">Account Health:</div>
                        <div>{accountHealth}</div>

                        <div className="font-semibold">Account Effective Leverage:</div>
                        <div>x{accountLeverage.toLocaleString()}</div>

                        <div className="font-semibold">All Time PnL:</div>
                        <div>${allTimePnl.toLocaleString()}</div>

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



