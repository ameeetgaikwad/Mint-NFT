import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import {
  Box,
  Button,
  Center,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
} from "@chakra-ui/react";
const inter = Inter({ subsets: ["latin"] });
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { Contract, providers, utils } from "ethers";
import {
  useProvider,
  useSigner,
  useContract,
  useAccount,
  useNetwork,
} from "wagmi";
import {
  ABI,
  sharedeumLibertyContractAddress,
  polygonMumbaiContractAddress,
  sepoliaContractAddress,
} from "@/constants/constants";

export default function Home() {
  const { data: signer } = useSigner();
  const { connector: activeConnector, isConnected } = useAccount();
  const { chain, chains } = useNetwork();

  const [balance, setBalance] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [successMint, setSuccessMint] = useState(false);
  const [failMint, setFailMint] = useState(false);
  const [NFTData, setNFTData] = useState([]);

  let contractAddress;
  switch (chain?.id) {
    case 8081:
      contractAddress = sharedeumLibertyContractAddress;
      break;
    case 80001:
      contractAddress = polygonMumbaiContractAddress;
      break;
    case 11155111:
      contractAddress = sepoliaContractAddress;
      break;
    default:
      contractAddress = sharedeumLibertyContractAddress;
  }

  useEffect(() => {
    setBalance();
    setFailMint(false);
  }, [chain, signer]);

  const mintNft = async () => {
    try {
      if (isConnected) {
        setFailMint(false);
        setSuccessMint();
        setBalance();
        setIsLoading(true);
        const nftContract = new Contract(contractAddress, ABI, signer);
        const tx = await nftContract.mint(1);
        await tx.wait();
        const receipt = await tx.wait();
        setIsLoading(false);
        setSuccessMint(true);
      } else {
        alert("Connect your wallet");
      }
    } catch (error) {
      console.log(`An error occurred: ${error.message}`);
      setFailMint(true);
      setIsLoading(false);
    }
  };

  const showBalance = async () => {
    try {
      setBalance();
      setFailMint(false);
      setSuccessMint();
      setIsLoading(true);
      const nftContract = new Contract(contractAddress, ABI, signer);
      const tx = await nftContract.balanceOf(signer?._address);
      const noOfTokens = BigInt(tx._hex).toString();

      let tokenIDArray = [];
      for (let i = 0; i < noOfTokens; i++) {
        const tokenID = await nftContract.tokenOfOwnerByIndex(
          signer?._address,
          i
        );

        tokenIDArray.push(BigInt(tokenID._hex).toString());
      }

      let datas;
      let NFTDatas = [];
      let stringData;
      for (let j = 0; j < noOfTokens; j++) {
        const response = await fetch(
          `https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/${tokenIDArray[j]}`
        )
          .then((response) => response.text())
          .then((data) => {
            datas = data;
            console.log(data);
          })
          .catch((error) => console.error(error));

        stringData = JSON.stringify(datas);
        const imageUrl = stringData.match(/ipfs:\/\/\w+/)[0];
        NFTDatas.push(imageUrl.slice(7));
      }
      console.log(NFTDatas[0]);
      setNFTData(NFTDatas);
      setBalance(noOfTokens);
      setIsLoading(false);
    } catch (error) {
      console.log(`An error occurred: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mint NFT</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        bgGradient={
          "linear-gradient( 113deg,  rgba(251,250,205,1) 24.4%, rgba(247,163,205,1) 53.7%, rgba(141,66,243,1) 99.2% )"
        }
        height={"100vh"}
        fontFamily="Courier New, Courier, monospace"
        textAlign={"center"}
      >
        {/* navigation */}
        <Box
          padding={"25px 20px"}
          display={"flex"}
          justifyContent={"right"}
          alignItems={"center"}
        >
          <Box
            display={"flex"}
            justifyContent={"space-evenly"}
            alignItems={"center"}
            width={"40%"}
          >
            <ConnectButton />
          </Box>
        </Box>
        {/* main content */}
        <Box
          display={"flex"}
          flexDir={"column"}
          position={"fixed"}
          top={"50%"}
          left={"50%"}
          transform={"translate(-50%,-50%)"}
        >
          <Box marginBottom={8} fontWeight={"bold"} fontSize={18}>
            Mint your BAYC NFT now. You can have at max 5 NFTs.
          </Box>
          <Box
            display={"flex"}
            justifyContent={"center"}
            transition={"backgroundImage 5s ease-in-out"}
          >
            <Button
              width={"27%"}
              marginRight={8}
              backgroundImage={
                "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
              }
              _hover={{
                backgroundImage:
                  "linear-gradient(43deg, #FFCC70 0%, #C850C0 46%, #4158D0 100%)",
              }}
              onClick={mintNft}
            >
              Mint NFT
            </Button>
            <Button
              width={"27%"}
              background={"white"}
              _hover={{
                background: "#fbcce3",
              }}
              onClick={showBalance}
            >
              Show Balance
            </Button>
          </Box>
          <Box
            display={"flex"}
            justifyContent={"center"}
            fontWeight={"bold"}
            marginTop={8}
          >
            <Box display={"flex"} flexDir={"column"}>
              <Box>{balance ? `You have ${balance} BAYC NFTs.` : ""}</Box>
              {balance ? (
                <Box
                  display={"flex"}
                  flexDir={{ base: "column", sm: "row" }}
                  position={"absolute"}
                  top={"150%"}
                  left={"50%"}
                  transform={"translate(-50%,-50%)"}
                >
                  {NFTData.map((data) => {
                    return (
                      <Box marginRight={4} width={"7rem"}>
                        <img
                          key={data}
                          src={`https://gateway.pinata.cloud/ipfs/${data}#x-ipfs-companion-no-redirect`}
                          width={"100%"}
                        />
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                ""
              )}
            </Box>
            <Box>{isLoading ? <Spinner /> : ""}</Box>
            <Box>
              {successMint ? "You have successfully minted an BAYC NFT!" : ""}
            </Box>
            <Box
              display={"flex"}
              flexDir={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Text>
                {failMint ? (
                  <Alert status="error" variant="left-accent">
                    <AlertIcon />
                    <AlertTitle fontSize={19}>Minting NFT failed!</AlertTitle>
                    <AlertDescription>
                      You might not have enough ETH Or You might have exceeded
                      the Max NFT Per Address Limit!
                    </AlertDescription>
                  </Alert>
                ) : (
                  ""
                )}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

// fbfacd
// f7a3cd
// 8d42f3

// https://gateway.pinata.cloud/${ipfs/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m}#x-ipfs-companion-no-redirect
// https://gateway.pinata.cloud/ipfs/QmSg9bPzW9anFYc3wWU5KnvymwkxQTpmqcRSfYj7UmiBa7#x-ipfs-companion-no-redirect
