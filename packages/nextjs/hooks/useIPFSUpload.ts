import { useState } from "react";
import axios from "axios";

export const useIPFSUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToIPFS = async (file: File): Promise<string> => {
    setIsUploading(true);
    setError(null);

    try {
      const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
      const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;

      if (!pinataApiKey && !pinataJwt) {
        throw new Error(
          "Pinata credentials not configured. Please add NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_JWT to your .env.local file",
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      const metadata = JSON.stringify({
        name: "File name",
      });
      formData.append("pinataMetadata", metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);

      const headers: Record<string, string> = {};

      if (pinataJwt) {
        headers["Authorization"] = `Bearer ${pinataJwt}`;
      } else if (pinataApiKey) {
        headers["pinata_api_key"] = pinataApiKey;
        headers["pinata_secret_api_key"] = "";
      }

      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: Infinity,
        headers,
      });

      return `ipfs://${response.data.IpfsHash}`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadToIPFS, isUploading, error };
};
