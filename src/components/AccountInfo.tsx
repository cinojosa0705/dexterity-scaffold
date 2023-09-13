import { PublicKey } from "@solana/web3.js";
import { dexterity, useProduct, useTrader } from "contexts/DexterityProviders";
import { FC, useCallback, useEffect } from "react";
import Button from "./Button";

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
        setLastUpdated
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

        setCashBalance(cashBalance)
        setOpenPositionsValue(openPositionsValue)
        setPortfolioValue(portfolioValue)
        setInitialMarginReq(initialMarginReq)
        setMaintananceMarginReq(maintananceMarginReq)
        setAccountHealth(accountHealth)
        setAllTimePnl(allTimePnl)
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

function timeSince(timestamp: number): string {
    const now = Date.now(); // Current time in Unix timestamp (milliseconds)
    let elapsed = now - timestamp; // Time elapsed in milliseconds

    if (elapsed < 0) {
        return `in the future (${new Date(timestamp).toISOString()})`;
    }

    let interval = Math.floor(elapsed / 31536000000); // Years
    if (interval >= 1) {
        return interval + (interval === 1 ? " year ago" : " years ago");
    }

    interval = Math.floor(elapsed / 2592000000); // Months
    if (interval >= 1) {
        return interval + (interval === 1 ? " month ago" : " months ago");
    }

    interval = Math.floor(elapsed / 86400000); // Days
    if (interval >= 1) {
        return interval + (interval === 1 ? " day ago" : " days ago");
    }

    interval = Math.floor(elapsed / 3600000); // Hours
    if (interval >= 1) {
        return interval + (interval === 1 ? " hour ago" : " hours ago");
    }

    interval = Math.floor(elapsed / 60000); // Minutes
    if (interval >= 1) {
        return interval + (interval === 1 ? " minute ago" : " minutes ago");
    }

    return Math.floor(elapsed / 1000) + " seconds ago"; // Seconds
}



