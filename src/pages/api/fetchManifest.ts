// Importing necessary types from Next.js and Solana's web3.js library
import type { NextApiRequest, NextApiResponse } from 'next';
import { clusterApiUrl, Cluster } from '@solana/web3.js';

// Defining a TypeScript type for the response data which can have either data or an error string
type ResponseData = {
  data?: any;
  error?: string;
};

// Exporting the default async function handler which takes NextApiRequest and NextApiResponse with ResponseData type as parameters
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // Destructuring network and publicKey from the request query
    const { network, publicKey } = req.query;
    
    // Mapping string keys to Cluster type to define network clusters
    const clusterMapping: { [key: string]: Cluster } = {
        'devnet': 'devnet',
        'mainnet-beta': 'mainnet-beta',
      };
      
    // Determining the API URL based on the network type and fetching it from environment variables or using clusterApiUrl function
    const apiURL = 
      network === 'devnet' ? process.env.NEXT_PUBLIC_DEVNET_RPC :
      network === 'mainnet-beta' ? process.env.NEXT_PUBLIC_MAINNET_RPC :
      clusterApiUrl(clusterMapping[network as string]);

    // Making a fetch request to the determined API URL with the publicKey as a query parameter
    const response = await fetch(`${apiURL}?publicKey=${publicKey}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // Parsing the response data to JSON
    const data = await response.json();
    // Sending a successful response with the data
    res.status(200).json({ data });
  } catch (error) {
    // Catching any errors and sending a 500 status code with the error message
    res.status(500).json({ error: error.message });
  }
};
