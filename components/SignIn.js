import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import { useSession, signIn, signOut } from "next-auth/react";
import React from "react";
import styles from "../styles/Theme.module.css";

export default function SignIn() {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  const { data: session } = useSession();

  if (session && address) {
    return (
      <div className={styles.bigSpacerTop}>
        <a onClick={() => signOut()} className={styles.secondaryButton}>
          Sign out of Discord
        </a>
        |
        <a
          onClick={() => disconnectWallet()}
          className={styles.secondaryButton}
        >
          Disconnect wallet
        </a>
      </div>
    );
  }

  // 1. Connect with MetaMask
  if (!address) {
    return (
      <div className={styles.main}>
        <h2 className={styles.noGapBottom}>Connect</h2>
        <p>Mint Alphamon NFT</p>
        <button
          onClick={connectWithMetamask}
          className={`${styles.mainButton} ${styles.spacerTop}`}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // 2. Connect with Discord (OAuth)
  if (!session) {
    return (
      <div className={`${styles.main}`}>
        <h2 className={styles.noGapBottom}>Login with Discord</h2>
        <p>
          👋{" "}
          <i>
            Hey,{" "}
            {
              // truncate address
              address.slice(0, 6) + "..." + address.slice(-4)
            }
          </i>
        </p>

        <p>Login with Discord to check your eligibility for the NFT!</p>

        <p>
          We check to see if you are a member of the Pepemon Discord when you
          try to mint.
        </p>

        <button
          className={`${styles.mainButton} ${styles.spacerTop}`}
          onClick={signIn}
        >
          Connect Discord
        </button>
      </div>
    );
  }
}
