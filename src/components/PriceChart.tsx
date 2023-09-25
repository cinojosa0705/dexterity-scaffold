import React, { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

interface Props {
  initialAsset?: string;
  initialTimeFrame?: string;
}

interface Candle {
    h: string;
    l: string;
    o: string;
    c: string;
    timestamp: Date;
}

const list = ['btcusd-perp', 'solusd-perp', 'ethusd-perp'];
const times = ['1_m', '10_m', '1_h', '1_d'];

const CandlestickChart: React.FC<Props> = ({ initialAsset = 'btcusd-perp', initialTimeFrame = '1_m' }) => {
  const [asset, setAsset] = useState(initialAsset);
  const [timeFrame, setTimeFrame] = useState(initialTimeFrame);
  const [candles, setCandles] = useState<Candle[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3000/' + asset);

    ws.current.onmessage = (message) => {
        console.log({message});
      const data = JSON.parse(message.data);
      console.log({data});
      if (data.candles) {
        setCandles(data.candles);
      }
    };

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ command: 'stream', params: {} }));
    };

    return () => {
      ws.current?.close();
    };
  }, [asset]);

  useEffect(() => {
    if (!chartRef.current) {
        return;
    }

    if (chartRef.current) {
        chartRef.current.innerHTML = '';
    }

    const chart = createChart(chartRef.current, { width: 800, height: 600 });
    const candlestickSeries = chart.addCandlestickSeries();

    console.log({candles})

    const seriesData = candles.map(candle => ({
        time: new Date(candle.timestamp).getTime() / 1000,
        open: Number(Number(candle.o).toFixed(4)),
        high: Number(Number(candle.h).toFixed(4)),
        low:  Number(Number(candle.l).toFixed(4)),
        close:  Number(Number(candle.c).toFixed(4))
    }));

    candlestickSeries.setData(seriesData as any);

}, [candles]);


  const handleAssetChange = (newAsset: string) => {
    setAsset(newAsset);
    ws.current?.send(JSON.stringify({ command: 'change-asset', params: { newAsset } }));
    setTimeFrame('1_m')
  };

  const handleTimeFrameChange = (newTime: string) => {
    setTimeFrame(newTime);
    ws.current?.send(JSON.stringify({ command: 'change-time', params: { newTime } }));
  };

  return (
    <div>
      <select value={asset} className="text-black" onChange={e => handleAssetChange(e.target.value)}>
        {list.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <select value={timeFrame} className="text-black"onChange={e => handleTimeFrameChange(e.target.value)}>
        {times.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <div ref={chartRef} style={{ width: '800px', height: '600px' }}></div>
    </div>
  );
}

export default CandlestickChart;
