import { dexterity, useProduct, useTrader } from "contexts/DexterityProviders";
import { FC, useCallback, useEffect, useState } from "react";
import Button from "./Button";
import { timeSince } from "utils/util";
import { notify } from "utils/notifications";

export const OpenPositions: FC = () => {
    const {
        positionsData,
        lastUpdated,
        updated,
    } = useTrader();
    const { markPrice } = useProduct();

    return (
        <>
            {updated && positionsData && (
                <div className="border border-white rounded-lg p-4">
                    <h1 className="text-2xl mb-4">Positions Info</h1>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Quantity</th>
                                        <th>Value</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {positionsData.map((position, index) => {
                                        if (Math.abs(parseFloat(position[1].m)) > 0) {
                                            const qty = parseFloat(position[1].m) / Math.pow(10, parseInt(position[1].exp));
                                            const value = qty * markPrice;

                                            return (
                                                <tr key={index}>
                                                    <td>{position[0]}</td>
                                                    <td>{qty}</td>
                                                    <td>${value.toLocaleString()}</td>
                                                    <td>{position[1].m > 0 ? 'Long' : 'Short'}</td>
                                                </tr>
                                            );
                                        }
                                        return null; // Return null if condition is not met
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="font-semibold">Last Updated:</div>
                        <div>{timeSince(lastUpdated)}</div>
                    </div>
                </div>
            )}
        </>
    );
};
