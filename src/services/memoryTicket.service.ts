import { Location, SmartContract } from "@prisma/client";
import { create } from "ipfs-http-client";
import { Contract, ethers } from "ethers";
import FactoryContractAbi, {
  FactoryContractAddress,
} from "./../abis/FactoryContrac";
import TicketNftAbi from "./../abis/TicketNftABI";
import prisma from "../dbClient";
import { ApiError } from "../utils";
import httpStatus from "http-status";
import { createCanvas, loadImage, registerFont } from "canvas";
import Web3 from "web3";
import { Alchemy } from "alchemy-sdk";
import axios from "axios";

// Infura credentials
const projectId = "2J8ZK6Xi0RsGXdagpUTp72KizhP";
const projectSecret = "a423342ad44c853d04731200832aa0b7";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
// Wallet infooo
const PRIVATE_KEY_FOR_WALLET =
  "1b0dba0820797c1187850d3defc0546048b8b4b1c85203bbf34e24b447414328";
const PublicKey = "0x827f629C4b70D99c2564F499bB6B0b7D554b3b7B";
const rpcUrl = "https://rpc-mumbai.maticvigil.com";
// ipfs node url
const ipfsBaseUrl = "https://ipfs.io/ipfs/";
// registerFont("./Oswald-VariableFont_wght.ttf", { family: "Oswald ExtraLight" });
//alchemy
const apiKey = "UmemkVUs4Lzk2SRvGORKFH8stUI3ksts";
const achBaseUrl = "https://polygon-mumbai.g.alchemy.com/v2/";
const achUrl = `${achBaseUrl}${apiKey}`;

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

async function generateMemoryTicket(
  image: string,
  displayName: string,
  activityName: string,
  userId: string,
): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User did not found");
    }
    const contract = await prisma.smartContract.findFirst({
      where: { activityName: activityName },
      // select: { id: true },
    });
    if (!contract) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Contract did not found");
    }
    const existingUser = await prisma.memoryTicket.findFirst({
      where: {
        smartContractId: contract?.id,
        userId: userId,
      },
    });

    if (existingUser) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Bir hesaptan sadece bir tane alabilirsiniz!",
      );
    }
    const memoryTicket = await prisma.memoryTicket.findMany({
      where: {
        smartContractId: contract?.id,
      },
    });
    if (memoryTicket.length > contract.contractCapacity) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Out of limit");
    }

    // const imageString = await imageWithLabelConverter(displayName);
    const ipfsConverted = await loadIpfs(
      new Buffer(image.split(",")[1], "base64"),
    );

    await constructMetadata(
      ipfsConverted,
      "29 Ekim TEST",
      "29 Ekim TEST",
      memoryTicket.length,
      contract.contractAdress,
    );

    const res = await transferNFT(
      contract,
      user.bcAddress,
      memoryTicket.length,
      user.id,
      displayName,
    );
    console.log(res);
    if (res) {
      return image;
    }
    throw new ApiError(httpStatus.BAD_REQUEST, "İşlem Başarısız");
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
}

export const loadIpfs = async (image: Buffer) => {
  const ipfs = ipfsClient();
  const result = await ipfs.add(image);
  return result.path;
};

const constructMetadata = async (
  imagePath: string,
  name: string,
  description: string,
  index: number,
  contractAddress: string,
) => {
  const ipfs = ipfsClient();
  const nftIds: Array<number> = [];
  const metadataCIDs = [];

  const metaDataObj = {
    name: name + " #" + index,
    description: description,
    image: ipfsBaseUrl + imagePath,
  };

  const result = await ipfs.add(JSON.stringify(metaDataObj));
  // becuase nft starts with id 0
  nftIds.push(index);
  metadataCIDs.push(result.path);

  await linkMetaData(nftIds, metadataCIDs, contractAddress);
};

const linkMetaData = async (
  nftIds: Array<number>,
  CIDs: any[],
  nftContractAddress: string,
) => {
  if (nftIds.length !== CIDs.length) {
    return;
  }

  try {
    const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(
      PRIVATE_KEY_FOR_WALLET,
      customHttpProvider,
    );
    const nftContract = new Contract(nftContractAddress, TicketNftAbi, wallet);
    const _res = await nftContract.addTokenUriForNft(nftIds, CIDs, {
      from: PublicKey,
    });

    await _res.wait();

    // TEST
    // these part will be deleted later
    const _mint0 = await nftContract.mint({ from: PublicKey, value: 1 });
    await _mint0.wait();
  } catch (error: any) {
    console.log("====================================");
    console.log(error.message);
    console.log("====================================");
    throw new ApiError(httpStatus.BAD_REQUEST, "Something wrong in link");
  }
};

async function transferNFT(
  contract: SmartContract,
  toAdress: string,
  tokenId: number,
  userId: string,
  displayName: string,
): Promise<boolean> {
  try {
    const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(
      PRIVATE_KEY_FOR_WALLET,
      customHttpProvider,
    );
    const nftContract = new Contract(
      contract.contractAdress,
      TicketNftAbi,
      wallet,
    );

    const gasLimit = 200000;
    const tx = await nftContract.transferFrom(
      wallet.address,
      toAdress,
      tokenId,
      {
        gasLimit,
      },
    );

    if (tx) {
      const newSmartContract = await prisma.memoryTicket.create({
        data: {
          tokenId: tokenId,
          userId: userId,
          smartContractId: contract.id,
          displayName: displayName,
        },
      });
      return true;
    }

    return false;
  } catch (error: any) {
    console.log("====================================");
    console.log(error.message);
    console.log("====================================");
    throw new ApiError(httpStatus.BAD_REQUEST, "something wrong in transfer");
    return false;
  }
}

async function imageWithLabelConverter(displayName: string): Promise<string> {
  const image = await loadImage(
    "C:/Users/Administrator/Documents/29_memory.png",
  );

  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);

  // ctx.font = '140px "Oswald ExtraLight"';

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(displayName, canvas.width / 2, canvas.height / 2 - 600);

  const base64Image = canvas.toDataURL("image/jpeg");
  return base64Image;
}

async function createMemoryContract(
  contractName: string,
  numberOfTickets: number,
  tag: string,
): Promise<any> {
  try {
    const contractNameToDeploy = "SolyTicket - " + contractName;
    const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(
      PRIVATE_KEY_FOR_WALLET,
      customHttpProvider,
    );
    const contractWithSigner = new Contract(
      FactoryContractAddress,
      FactoryContractAbi,
      wallet,
    );
    const _res = await contractWithSigner.createTicket(
      true,
      numberOfTickets,
      numberOfTickets,
      0,
      contractNameToDeploy,
      tag,
      { from: PublicKey },
    );

    const _details = await _res.wait();
    let _contractAddress;
    _details.events.filter((event: { event: string; args: [any, any] }) => {
      if (event.event === "SolyContractDeployed") {
        const [by, contractAddress] = event.args;
        _contractAddress = contractAddress;
      }
    });

    const newSmartContract = await prisma.smartContract.create({
      data: {
        activityName: contractName,
        contractAdress: _contractAddress as unknown as string,
        contractCapacity: numberOfTickets,
      },
    });

    return _contractAddress;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
}
async function getUserInfoForMemory(
  userId: string,
  activityName: string,
): Promise<any> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User did not found");
    }

    const contract = await prisma.smartContract.findFirst({
      where: { activityName: activityName },
      // select: { id: true },
    });
    if (!contract) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Contract did not found");
    }

    const existingUser = await prisma.memoryTicket.findFirst({
      where: {
        smartContractId: contract?.id,
        userId: userId,
      },
    });

    if (!existingUser) {
      return { isExist: false };
    }

    let obj = {
      bcAddress: user.bcAddress,
      // mnemonicIsShown: user.mnemonicIsShown,
      displayName: existingUser.displayName,
    };

    return obj;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
}

async function getNFTmetaData(
  userId: string,
  activityName: string,
): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User did not found");
  }
  const contract = await prisma.smartContract.findFirst({
    where: { activityName: activityName },
    // select: { id: true },
  });
  if (!contract) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Contract did not found");
  }
  const existingUser = await prisma.memoryTicket.findFirst({
    where: {
      smartContractId: contract?.id,
      userId: userId,
    },
  });
  if (!existingUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Account doesnt have specified nft!",
    );
  }
  const options = {
    method: "GET",
    url: `${achUrl}/getNFTs`,
    params: {
      owner: user.bcAddress,
      "contractAddresses[]": contract.contractAdress,
      withMetadata: "true",
      pageSize: "100",
    },
    headers: { accept: "application/json" },
  };

  try {
    const response = await axios.request(options);
    console.log(response);
    let nftImage;
    if (response.data) {
      const arr = response.data?.ownedNfts;
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (
          element.contract?.address ==
          contract.contractAdress.toLocaleLowerCase()
        ) {
          nftImage = element.metadata?.image;
          break;
        }
      }
    }

    return nftImage;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "error in ach api!");
  }
}

export default {
  generateMemoryTicket,
  createMemoryContract,
  imageWithLabelConverter,
  getUserInfoForMemory,
  getNFTmetaData,
};
