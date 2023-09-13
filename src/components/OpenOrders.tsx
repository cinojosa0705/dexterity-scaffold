import { dexterity, useProduct, useTrader } from "contexts/DexterityProviders";
import { FC, useCallback, useEffect } from "react";
import Button from "./Button";
import { timeSince } from "utils/util";

type BigNumber = {
    m: string;
    exp: string;
    _isNan: boolean;
};

type OrderData = {
    id: string;
    productName: string;
    productIndex: number;
    price: BigNumber;
    qty: BigNumber;
    isBid: boolean;
};

export const OpenOrders: FC = () => {
    const {
        orderData, // ordeData: OrderData[]
        lastUpdated,
        updated
    } = useTrader()

    return (
        <>
            {updated && orderData && (
                <div className="border border-white rounded-lg p-4">
                    <h1 className="text-2xl mb-4">Account Info</h1>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <h2 className="text-xl mb-2">Orders</h2>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderData.map((order, index) => (
                                        <tr key={index}>
                                            <td>{order.productName}</td>
                                            <td>{parseFloat(order.price.m) * Math.pow(10, parseInt(order.price.exp))}</td>
                                            <td>{parseFloat(order.qty.m) / Math.pow(10, parseInt(order.qty.exp))}</td>
                                            <td>{order.isBid ? 'Bid' : 'Ask'}</td>
                                        </tr>
                                    ))}
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
}



