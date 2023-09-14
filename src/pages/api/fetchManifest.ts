import type { NextApiRequest, NextApiResponse } from 'next';
import { clusterApiUrl, Cluster } from '@solana/web3.js';

type ResponseData = {
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const { network, publicKey } = req.query;
    
    const clusterMapping: { [key: string]: Cluster } = {
        'devnet': 'devnet',
        'mainnet-beta': 'mainnet-beta',
      };
      
    const apiURL = 
      network === 'devnet' ? process.env.NEXT_PUBLIC_DEVNET_RPC :
      network === 'mainnet-beta' ? process.env.NEXT_PUBLIC_MAINNET_RPC :
      clusterApiUrl(clusterMapping[network as string]);

    const response = await fetch(`${apiURL}?publicKey=${publicKey}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
