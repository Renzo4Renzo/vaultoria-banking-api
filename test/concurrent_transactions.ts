import axios from "axios";

const BASE_URL = "http://localhost:3700/api/v1";
const AUTH_URL = `${BASE_URL}/auth/token`;
const ENDPOINTS_SEQUENCE = [
  "transactions/deposit",
  "transactions/withdraw",
  "transactions/transfer",
  "transactions/withdraw",
  "transactions/transfer",
  "transactions/deposit",
];
const USER_ID = 20;

const payloads = [
  { to_account_id: 24, amount: 12 },
  { from_account_id: 24, amount: 8 },
  { from_account_id: 24, to_account_id: 16, amount: 10 },
  { from_account_id: 24, amount: 2 },
  { from_account_id: 24, to_account_id: 16, amount: 5 },
  { to_account_id: 24, amount: 18 },
];

async function main() {
  try {
    console.log("Getting auth token...");

    const authResponse = await axios.post(AUTH_URL, {
      user_id: USER_ID,
    });

    const token = authResponse.data?.data?.token;
    if (!token) throw new Error("No token received from auth response");

    console.log("Token received:", token);

    const requests = payloads.map(async (payload, index) => {
      const endpoint = `${BASE_URL}/${ENDPOINTS_SEQUENCE[index]}`;

      console.log(`Preparing request ${index + 1} to ${endpoint}`);

      try {
        const response = await axios.post(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        //JSON Stringify is necessary to prevent the console from logging "corrupted live objects"
        console.log(`✅ Request ${index + 1} to ${endpoint} succeeded:\n`, JSON.stringify(response.data, null, 2));
      } catch (error: any) {
        const serverResponse = error.response?.data;
        if (serverResponse) {
          //JSON Stringify is necessary to prevent the console from logging "corrupted live objects"
          console.error(
            `❌ Request ${index + 1} to ${endpoint} failed with server response:\n`,
            JSON.stringify(serverResponse, null, 2)
          );
        } else {
          console.error(`❌ Request ${index + 1} to ${endpoint} failed:`, error.message);
        }
      }
    });

    console.log("Sending all requests concurrently...");
    await Promise.allSettled(requests);
  } catch (error: any) {
    console.error("🔥 Fatal error:", error.message);
  }
}

main();
