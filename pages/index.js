import { useAddress, useContract, Web3Button } from "@thirdweb-dev/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import SignIn from "../components/SignIn";
import styles from "../styles/Theme.module.css";

export const contractAddress = "0x95C3976d1f29fD21D3EBEd5C4987B38C9DB23a4B";

export default function Home() {
  // Grab the currently connected wallet's address
  const address = useAddress();
  // Get the currently authenticated user's session (Next Auth + Discord)
  const { data: session } = useSession();

  // Get the NFT Collection we deployed using thirdweb+
  const { contract: nftCollectionContract } = useContract(contractAddress);

  // This is simply a client-side check to see if the user is a member of the discord in /api/check-is-in-server
  // We ALSO check on the server-side before providing the signature to mint the NFT in /api/generate-signature
  // This check is to show the user that they are eligible to mint the NFT on the UI.
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  useEffect(() => {
    if (session) {
      setLoading(true);
      // Load the check to see if the user  and store it in state
      fetch("api/check-is-in-server")
        .then((res) => res.json())
        .then((d) => {
          setData(d || undefined);
          setLoading(false);
        });
    }
  }, [session]);

  // Function to create a signature on the server-side, and use the signature to mint the NFT
  async function mintNft() {
    // Make a request to the API route to generate a signature for us to mint the NFT with
    const signature = await fetch(`/api/generate-signature`, {
      method: "POST",
      body: JSON.stringify({
        // Pass our wallet address (currently connected wallet) as the parameter
        claimerAddress: address,
      }),
    });

    // If the user meets the criteria to have a signature generated, we can use the signature
    // on the client side to mint the NFT from this client's wallet
    if (signature.status === 200) {
      const json = await signature.json();
      const signedPayload = json.signedPayload;
      const nft = await nftCollectionContract?.signature.mint(signedPayload);

      // Show a link to view the NFT they minted
      alert(
        `Success 🔥 Check out your NFT here: https://testnets.opensea.io/assets/mumbai/0x95C3976d1f29fD21D3EBEd5C4987B38C9DB23a4B/${nft.id.toNumber()}`
      );
    }
    // If the user does not meet the criteria to have a signature generated, we can show them an error
    else {
      alert("Something went wrong. Are you a member of the discord?");
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Pepemon Pepechain Alphanet Badge</h1>

      <p className={styles.explain}>
        Mint your Alphanet badge and be the first to participate in{" "}
        <a
          href="https://pepechain.pepemon.world/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.purple}
        >
          Pepechain
        </a>
        <br></br>Alphanet Testing and potential Airdrop!
      </p>

      <p className={styles.explain}>
        We check if you are is a member of our Discord server, and allow you to
        mint an NFT if you are.
      </p>

      <hr className={styles.divider} />

      <SignIn />

      {address && session ? (
        isLoading ? (
          <p>Checking...</p>
        ) : data ? (
          <div className={`${styles.main} ${styles.spacerTop}`}>
            <h3>Hey {session?.user?.name} 👋</h3>
            <h4>Thanks for being a member of the Discord.</h4>
            <p>Here is a reward for you!</p>

            {/* NFT Preview */}
            <div className={styles.nftPreview}>
              <b>Your NFT:</b>
              <img src={session?.user.image} />
              <p>{session.user.name}&apos;s Pepemon Pepechain Alphamon NFT</p>
            </div>

            <Web3Button
              contractAddress={contractAddress}
              colorMode="dark"
              accentColor="#F213A4"
              action={() => mintNft()}
            >
              Claim NFT
            </Web3Button>
          </div>
        ) : (
          <div className={`${styles.main} ${styles.spacerTop}`}>
            <p>Looks like you are not a part of the Discord server.</p>
            <a
              className={styles.mainButton}
              href={`https://discord.gg/R8sZwMv`}
            >
              Join Server
            </a>
          </div>
        )
      ) : null}
    </div>
  );
}
