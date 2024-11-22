import axios from "axios";
import { create } from "ipfs-http-client";
import FactoryContractAbi, {
  FactoryContractAddress,
} from "./../abis/FactoryContrac";
import TicketNftAbi from "./../abis/TicketNftABI";
import { ApiError } from "../utils";
import httpStatus from "http-status";
import { Web3Storage, File } from "web3.storage";

const ethers = require("ethers");

// Infura credentials
const projectId = "2J8ZK6Xi0RsGXdagpUTp72KizhP";
const projectSecret = "a423342ad44c853d04731200832aa0b7";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
// Wallet infooo
const PRIVATE_KEY_FOR_WALLET = process.env.PRIVATE_KEY_FOR_WALLET as string;
const PublicKey = process.env.PublicKey as string;
const rpcUrl = process.env.rpcUrl as string;
// ipfs node url
const ipfsBaseUrl = "https://ipfs.io/ipfs/";

const ipfsClient = () => {
  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  return ipfs;
};

const client = new Web3Storage({
  token: "z6Mkwa7VyK3Y3pYP1JddKv3SJEV2rCaVKU7AWpUyE8CoowSd",
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const createMetamaskWallet = async () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
};

const CreateNewNftContract = async (name: string, ticketCount: number) => {
  try {
    const contractName = "SolyTicket - " + name;

    // Initialize the JSON RPC provider
    const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Connect the wallet
    const wallet = new ethers.Wallet(
      PRIVATE_KEY_FOR_WALLET,
      customHttpProvider,
    );

    // Connect to the contract with a signer
    const contractWithSigner = new ethers.Contract(
      FactoryContractAddress,
      FactoryContractAbi,
      wallet,
    );

    // Check wallet balance
    const balance = await wallet.getBalance();
    console.log(`Wallet balance: ${ethers.utils.formatEther(balance)} MATIC`);

    // Manually set gas price and gas limit
    const gasLimit = ethers.BigNumber.from("3000000"); // Set a reasonable gas limit manually

    // Fetch the current gas price and manually set it
    const gasPrice = await customHttpProvider.getGasPrice();
    const maxPriorityFeePerGas = ethers.utils.parseUnits("2.5", "gwei"); // Set priority fee
    const maxFeePerGas = ethers.utils.parseUnits("30", "gwei"); // Set max fee

    console.log(
      `Gas price: ${gasPrice.toString()}, Max priority fee: ${maxPriorityFeePerGas.toString()}`,
    );

    // Perform the transaction
    const tx = await contractWithSigner.createTicket(
      ticketCount,
      contractName,
      "soly",
      {
        gasLimit, // Manually setting the gas limit
        maxPriorityFeePerGas, // Manually set max priority fee
        maxFeePerGas, // Manually set max fee per gas
      },
    );

    console.log(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Transaction mined in block ${receipt.blockNumber}.`);

    // Extract and return the contract address from the event logs
    let contractAddress;
    receipt.events?.filter((event: { event: string; args: [any, any] }) => {
      if (event.event === "SolyContractDeployed") {
        const [, deployedContractAddress] = event.args;
        contractAddress = deployedContractAddress;
      }
    });

    console.log(`Contract deployed at: ${contractAddress}`);
    return contractAddress;
  } catch (error: any) {
    console.error("Error during contract deployment:", error);

    // If there's a gas estimation issue
    if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
      console.error("Gas estimation failed, possible contract revert.");
    }

    // If there's a server error (often due to RPC provider issues)
    if (error.code === "SERVER_ERROR") {
      console.error("Server error from the RPC provider:", error);
    }

    // If the transaction reverted with a specific reason
    if (error.code === "CALL_EXCEPTION") {
      console.error("Transaction reverted:", error);
    }

    throw error;
  }
};

async function generateTicketNFT(
  image: string,
  displayName: string,
  desc: string,
  tokenId: number,
  address: string,
): Promise<boolean> {
  try {
    //  const img = await loadIpfs(Buffer.from(image.split(",")[1], "base64"));  // Use Buffer.from() for better security
    //  const res = await  constructMetadata(displayName, desc, tokenId, address,img)

    const res = await generateAndMintBulkTicketsWithSameImage(
      image,
      displayName,
      desc,
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      address,
    );
    // Linking metadata
    if (res) {
      return true;
    }

    console.error(`Failed to generate NFT for tokenId: ${tokenId}`);
    throw new ApiError(httpStatus.BAD_REQUEST, "İşlem Başarısız");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error during NFT generation for tokenId: ${tokenId}:`,
        error.message,
      );
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    } else {
      console.error(
        `Unknown error during NFT generation for tokenId: ${tokenId}`,
      );
      throw new ApiError(httpStatus.BAD_REQUEST, "Unknown error occurred");
    }
  }
}
export const loadIpfsweb3 = async (imageBuffer: Buffer) => {
  try {
    // Create a file object from the Buffer
    const file = new File([imageBuffer], "image.jpg", { type: "image/jpeg" });

    // Upload the image using the Web3.Storage client
    const cid = await client.put([file], {
      wrapWithDirectory: false, // Upload the file directly without a directory
    });

    console.log("Image uploaded to Web3.Storage with CID:", cid);

    return cid; // Return the CID of the image
  } catch (error) {
    console.error("Web3.Storage image upload failed:", error);
    throw new Error("Image upload to Web3.Storage failed.");
  }
};

export const loadIpfs = async (image: Buffer) => {
  try {
    const ipfs = ipfsClient();
    const result = await ipfs.add(image);
    return result.path;
  } catch (error) {
    console.error("IPFS image upload failed:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Failed to upload image to IPFS",
    );
  }
};

/**
 * Uploads metadata to Pinata and returns the CID.
 * @param displayName - The name of the token/NFT.
 * @param description - The description of the NFT.
 * @param tokenId - The token ID.
 * @param ipfsHash - The image's IPFS hash.
 * @param artist - The artist's name.
 * @param date - The event date.
 * @param location - The event location.
 * @param block - The seating block.
 * @param seat - The seat number.
 * @returns The IPFS CID of the uploaded metadata.
 */
export const constructMetadataPinata = async (
  displayName: string,
  description: string,
  tokenId: number,
  ipfsHash: string,
  artist: string,
  date: Date,
  location: string,
  block: string,
  seat: string,
) => {
  const metadata = {
    name: `${displayName} #${tokenId}`,
    description: description,
    image: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`, // Using Pinata gateway for IPFS
    attributes: [
      {
        trait_type: "Artist",
        value: artist,
      },
      {
        trait_type: "Date",
        value: date.toISOString(),
      },
      {
        trait_type: "Location",
        value: location,
      },
      {
        trait_type: "Block",
        value: block,
      },
      {
        trait_type: "Seat",
        value: seat,
      },
    ],
  };

  console.log("Generated Metadata:", metadata);

  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
      },
    );

    const { IpfsHash } = response.data;
    console.log("Metadata uploaded to Pinata with CID:", IpfsHash);

    return IpfsHash; // Return the CID of the metadata
  } catch (error) {
    console.error("Metadata upload to Pinata failed:", error);
    throw new Error("Failed to upload metadata to Pinata");
  }
};

export const constructMetadata = async (
  displayName: string,
  description: string,
  tokenId: number,
  ipfsHash: string,
  artist: string,
  date: Date,
  location: string,
  block: string,
  seat: string,
) => {
  const metadata = {
    name: `${displayName} #${tokenId}`,
    description: description,
    image: `${ipfsBaseUrl}${ipfsHash}`,
    attributes: [
      {
        trait_type: "Artist",
        value: artist,
      },
      {
        trait_type: "Date",
        value: formatDate(date.toISOString()),
      },
      {
        trait_type: "Location",
        value: location,
      },
      {
        trait_type: "Block",
        value: block,
      },
      {
        trait_type: "Seat",
        value: seat,
      },
    ],
  };

  console.log("Generated Metadata:", metadata); // Log metadata for debugging

  try {
    const ipfs = ipfsClient();
    const result = await ipfs.add(JSON.stringify(metadata)); // Upload metadata to IPFS

    console.log("Metadata uploaded to IPFS:", result.path);
    return result.path;
  } catch (error) {
    console.error("Metadata upload failed:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Failed to upload metadata to IPFS",
    );
  }
};

// const linkMetaData = async (
//   nftIds: Array<number>,
//   metadataCIDs: Array<string>,
//   contractAddress: string,
// ) => {
//   if (nftIds.length !== metadataCIDs.length) {
//     console.error("Mismatch between NFT IDs and Metadata CIDs length");
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Mismatch between NFT IDs and Metadata CIDs",
//     );
//   }

//   try {
//     const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
//     const wallet = new ethers.Wallet(
//       PRIVATE_KEY_FOR_WALLET,
//       customHttpProvider,
//     );
//     const nftContract = new Contract(contractAddress, TicketNftAbi, wallet);

//     // Log wallet balance
//     const balance = await wallet.getBalance();

//     // Increase gas price for faster mining
//     const gasPrice = await customHttpProvider.getGasPrice();
//     const higherGasPrice = gasPrice.mul(ethers.BigNumber.from(2)); // Double the gas price for faster processing

//     // Send transaction to link metadata
//     const tx = await nftContract.addTokenUriForNft(nftIds, metadataCIDs, {
//       from: PublicKey,
//       gasPrice: higherGasPrice,
//     });

//     const receipt = await tx.wait();

//     const mintTx = await nftContract.mint({
//       from: PublicKey,
//       value: 0, // Ensure you're sending the correct mint value
//       gasLimit: ethers.BigNumber.from("500000"), // Increase gas limit
//       maxPriorityFeePerGas: ethers.utils.parseUnits("60", "gwei"), // Increase priority fee
//       maxFeePerGas: ethers.utils.parseUnits("100", "gwei"), // Set max fee
//     });

//     try {
//       const mintReceipt = await mintTx.wait();
//       console.log(`Mint transaction confirmed: ${mintReceipt.transactionHash}`);
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error(`Mint transaction failed: ${error.message}`);
//       } else {
//         console.error("Unknown error during minting.");
//       }
//     }
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Error linking metadata or minting token:", error.message);
//       throw new ApiError(httpStatus.BAD_REQUEST, error.message);
//     } else {
//       console.error("Unknown error during metadata linking or minting");
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         "Unknown error during linking or minting",
//       );
//     }
//   }
// };
async function createTicket(totalNFTs: number, name: string, tag: string) {
  const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
  const wallet = new ethers.Wallet(PRIVATE_KEY_FOR_WALLET, provider);

  const factory = new ethers.Contract(
    FactoryContractAddress,
    FactoryContractAbi,
    wallet,
  );
  try {
    console.log("Started creating ticket...");

    const txRes = await factory.createTicket(totalNFTs, name, tag, {
      gasLimit: 3000000,
    });
    console.log("Transaction sent, waiting for confirmation...");

    const txRec = await txRes.wait(1);
    console.log("Transaction confirmed!", txRec);

    const eventFilter = factory.filters.SolyContractDeployed(null, null);
    const logs = await factory.queryFilter(
      eventFilter,
      txRec.blockNumber,
      txRec.blockNumber,
    );

    let contractAddress;

    logs.forEach((log: any) => {
      const parsedLog = factory.interface.parseLog(log);
      contractAddress = parsedLog.args[1];
      console.log(`Address: ${parsedLog.args[1]}`); // Newly deployed Soly contract address
    });

    return contractAddress;
  } catch (error) {
    console.error("Error executing createTicket:", error);
  }
}

async function AddTokenUris(
  tokenId: number[],
  _newCID: string[],
  contractAddress: string,
) {
  try {
    const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
    const wallet = new ethers.Wallet(PRIVATE_KEY_FOR_WALLET, provider);
    const solycontract = new ethers.Contract(
      contractAddress,
      TicketNftAbi,
      wallet,
    );
    console.log("stated");
    const txRes = await solycontract.addTokenUriForNft(tokenId, _newCID);
    const txRec = await txRes.wait(1);
    console.log(txRec);
    return true;
  } catch (error) {
    console.error("Error executing AddTokenUris:", error);
    return false;
  }
}

async function viewTokenuri(tokenId: number, contractAddress: string) {
  const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
  const wallet = new ethers.Wallet(PRIVATE_KEY_FOR_WALLET, provider);
  const solycontract = new ethers.Contract(
    contractAddress,
    TicketNftAbi,
    wallet,
  );
  const uri = await solycontract.tokenURI(tokenId);

  console.log(uri);
}

async function generateAndMintBulkTicketsWithSameImage(
  image: string,
  displayName: string,
  desc: string,
  tokenIds: number[],
  contractAddress: string,
): Promise<boolean> {
  try {
    const metadataCIDs: string[] = [];

    const ipfsHash = await loadIpfs(Buffer.from(image.split(",")[1], "base64"));

    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];

      const metadataCID = await constructMetadata(
        displayName,
        desc,
        tokenId,
        contractAddress,
        ipfsHash,
        new Date(),
        "",
        "",
        "",
      );
      metadataCIDs.push(metadataCID);
    }

    await mintBulkTokens(tokenIds, metadataCIDs, contractAddress);

    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error during bulk NFT generation: ${error.message}`);
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    } else {
      console.error("Unknown error during bulk NFT generation");
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Unknown error occurred during bulk minting",
      );
    }
  }
}

export async function mintBulkTokens(
  tokenIds: number[],
  metadataCIDs: string[],
  contractAddress: string,
): Promise<void> {
  if (tokenIds.length !== metadataCIDs.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Mismatch between token IDs and metadata CIDs length",
    );
  }

  try {
    const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(
      PRIVATE_KEY_FOR_WALLET,
      customHttpProvider,
    );
    const nftContract = new ethers.Contract(
      contractAddress,
      TicketNftAbi,
      wallet,
    );

    const gasPrice = await customHttpProvider.getGasPrice();
    const higherGasPrice = gasPrice.mul(ethers.BigNumber.from(2));

    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      const metadataCID = metadataCIDs[i];

      const linkTx = await nftContract.addTokenUriForNft(
        [tokenId],
        [metadataCID],
        {
          from: PublicKey,
          gasPrice: higherGasPrice,
        },
      );
      await linkTx.wait();

      const mintTx = await nftContract.mint({
        from: PublicKey,
        value: 0,
        gasLimit: ethers.BigNumber.from("500000"),
        maxPriorityFeePerGas: ethers.utils.parseUnits("60", "gwei"),
        maxFeePerGas: ethers.utils.parseUnits("100", "gwei"),
      });

      const mintReceipt = await mintTx.wait();
      console.log(
        `Mint transaction confirmed for token ID ${tokenId}: ${mintReceipt.transactionHash}`,
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Unknown error during bulk minting",
      );
    }
  }
}

// Assuming loadIpfs and constructMetadata functions are the same from your previous code

export default {
  createMetamaskWallet,
  CreateNewNftContract,
  generateTicketNFT,
  createTicket,
  AddTokenUris,
  viewTokenuri,
};
