import React, { useState, useEffect, useMemo } from 'react';

type Order = {
    price: number;
    amount: number;
};

type OrderRowProps = {
    order: Order;
    totalDepth: number;
    isBid?: boolean;
};

const formatNumber = (num: number) => num.toLocaleString();

const OrderRow: React.FC<OrderRowProps> = React.memo(({ order, totalDepth, isBid }) => {
    const depthPercent = useMemo(() => ((order.amount / totalDepth) * 300).toFixed(2), [order.amount, totalDepth]);

    return (
        <div className={`grid grid-cols-3 relative cursor-pointer ${isBid ? 'text-green-400' : 'text-pink-400'} hover:bg-gray-700 rounded p-2 transition duration-200 ease-in-out`}>
            <div
                className={`absolute inset-y-0 rounded ${isBid ? 'bg-green-500' : 'bg-pink-500'} opacity-40`}
                style={{ width: `${depthPercent}%`, right: isBid ? '0' : 'auto' }}
            ></div>

            {isBid ?
                <>
                    <div className="hover:text-white">{formatNumber(order.amount)}</div>
                    <div className="hover:text-white">${formatNumber(order.price)}</div>
                </>
                :
                <>
                    <div className="hover:text-white">${formatNumber(order.price)}</div>
                    <div className="hover:text-white">{formatNumber(order.amount)}</div>
                </>}
        </div>
    );
});

const OrderBook: React.FC = () => {
    const [totalBidDepth, setTotalBidDepth] = useState(0);
    const [totalAskDepth, setTotalAskDepth] = useState(0);

    useEffect(() => {
        const bidDepth = sampleBids.reduce((acc, order) => acc + order.amount, 0);
        const askDepth = sampleAsks.reduce((acc, order) => acc + order.amount, 0);

        setTotalBidDepth(bidDepth);
        setTotalAskDepth(askDepth);
    }, []);

    return (
        <div className="flex flex-col items-center p-6 border text-white rounded-lg shadow-xl mt-5 w-3/4 space-y-5">
            {/* Header */}
            <div className="flex justify-between w-full text-center mb-2">
                <div className="w-1/2 font-semibold text-green-400">Bids</div>
                <div className="w-1/2 font-semibold text-pink-400">Asks</div>
            </div>

            {/* Order Lists */}
            <div className="flex w-full">
                <div className="w-1/2 rounded-lg p-2 space-y-2">
                    {sampleBids.map((order, index) => (
                        <OrderRow key={index} order={order} totalDepth={totalBidDepth} isBid={true} />
                    ))}
                </div>
                <div className="w-1/2 rounded-lg p-2 space-y-2">
                    {sampleAsks.map((order, index) => (
                        <OrderRow key={index} order={order} totalDepth={totalAskDepth} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const sampleBids: Order[] = [
    { price: 27200, amount: 0.3 },
    { price: 27100, amount: 0.5 },
    { price: 27000, amount: 0.3 },
    { price: 26900, amount: 0.2 },
    { price: 26800, amount: 0.25 },
    { price: 26700, amount: 0.55 },
    { price: 26600, amount: 0.95 },
    { price: 26500, amount: 0.25 },
    { price: 26400, amount: 0.95 },
];

const sampleAsks: Order[] = [
    { price: 27300, amount: 0.8 },
    { price: 27400, amount: 0.7 },
    { price: 27599, amount: 0.1 },
    { price: 27699, amount: 0.3 },
    { price: 27799, amount: 0.15 },
    { price: 27999, amount: 0.4 },
    { price: 28099, amount: 0.4 },
    { price: 28199, amount: 1.45 },
    { price: 28299, amount: 0.45 },
];

export default OrderBook;
