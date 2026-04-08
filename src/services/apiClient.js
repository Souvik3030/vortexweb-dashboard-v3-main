import axios from "axios";
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_WEBHOOK_API_URL, 
  headers: { "Content-Type": "application/json" },
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
     console.error("API Error:", error.response?.data?.error_description || error.message);
      if (error.response?.status === 401) {
      console.warn("Bitrix24 Token might be expired or invalid.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;


function buildQueryString(params, prefix = "") {
  const parts = [];

  Object.keys(params).forEach((key) => {
    const value = params[key];
    // Create the Bitrix-style key: "filter" -> "filter[!RESPONSIBLE_ID]"
    const newKey = prefix ? `${prefix}[${key}]` : key;

    if (Array.isArray(value)) {
      // Handle Arrays: filter[!RESPONSIBLE_ID][0]=1, filter[!RESPONSIBLE_ID][1]=11
      value.forEach((val, i) => {
        if (typeof val === "object" && val !== null) {
          // Recursion for objects inside arrays (rare but possible)
          parts.push(buildQueryString(val, `${newKey}[${i}]`));
        } else {
          parts.push(
            `${encodeURIComponent(newKey)}[${i}]=${encodeURIComponent(val)}`
          );
        }
      });
    } else if (typeof value === "object" && value !== null) {
      // Handle Objects: Recurse deeper
      parts.push(buildQueryString(value, newKey));
    } else {
      // Handle Primitives: Strings, Numbers, Booleans
      parts.push(`${encodeURIComponent(newKey)}=${encodeURIComponent(value)}`);
    }
  });

  return parts.filter(Boolean).join("&");
}

async function fetchAllWithBatch(baseUrl, methodWithParams) {
  const cleanBaseUrl = baseUrl ? baseUrl.replace(/\/$/, "") : "";

  // 1. Initial Request
  let firstRes;
  try {
    firstRes = await axios.get(`${cleanBaseUrl}/${methodWithParams}`);
  } catch (err) {
    console.error("Initial Fetch Error:", err);
    return [];
  }

  if (firstRes.data.error) {
    console.error("Bitrix API Error:", firstRes.data.error_description);
    return [];
  }

  // Handle Bitrix response structure variations
  let firstPage = [];
  let total = 0;

  if (Array.isArray(firstRes.data.result)) {
    firstPage = firstRes.data.result;
    total = firstRes.data.total;
  } else if (firstRes.data.result && firstRes.data.result.tasks) {
    firstPage = firstRes.data.result.tasks;
    total = firstRes.data.total || firstRes.data.result.count || 0;
  }

  // If we have all data or no data, return early
  if (!total || total <= 50) return firstPage;

  // 2. Prepare Batch Commands
  const commands = {};
  // Ensure we append '&' or '?' correctly
  const methodBase = methodWithParams.includes("?")
    ? `${methodWithParams}&`
    : `${methodWithParams}?`;

  // Start from 50
  for (let i = 50; i < total; i += 50) {
    commands[`page_${i}`] = `${methodBase}start=${i}`;
  }

  // 3. Execute Batches (Chunked by 50)
  try {
    const commandKeys = Object.keys(commands);
    const chunkedCommands = [];

    for (let i = 0; i < commandKeys.length; i += 50) {
      const chunk = {};
      commandKeys
        .slice(i, i + 50)
        .forEach((key) => (chunk[key] = commands[key]));
      chunkedCommands.push(chunk);
    }

    let allAdditionalResults = [];

    for (const cmdChunk of chunkedCommands) {
      const batchRes = await axios.post(`${cleanBaseUrl}/batch`, {
        halt: 0,
        cmd: cmdChunk,
      });

      const batchResultData = batchRes.data?.result?.result || {};

      // Flatten results
      Object.values(batchResultData).forEach((res) => {
        if (Array.isArray(res)) {
          allAdditionalResults.push(...res);
        } else if (res && res.tasks) {
          allAdditionalResults.push(...res.tasks);
        }
      });
    }

    return [...firstPage, ...allAdditionalResults];
  } catch (error) {
    console.error("Batch Error", error);
    return firstPage; // Graceful degradation
  }
}

// --- 3. Main Export ---
export const fetchFast = async (method, params = {}) => {
  const BITRIX_WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_API_URL; // Verify this key

  if (!BITRIX_WEBHOOK_URL) {
    console.error("Missing Bitrix Webhook URL");
    return [];
  }

  // Step 1: Serialize params (Recursively fixed)
  const queryString = buildQueryString(params);

  // Step 2: Construct Method String
  const methodWithParams = queryString ? `${method}?${queryString}` : method;

  // Step 3: Fetch
  return await fetchAllWithBatch(BITRIX_WEBHOOK_URL, methodWithParams);
};


