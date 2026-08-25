const axios = require("axios");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const AUTHORITY_EMAIL = process.env.AUTHORITY_EMAIL || "";
const AUTHORITY_PASSWORD = process.env.AUTHORITY_PASSWORD || "";
const results = [];

async function request(method, path, body, token) {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${path}`,
      data: body,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true,
    });
    return { status: response.status, body: response.data };
  } catch (error) {
    return { status: 0, body: { error: error.message } };
  }
}

function check(step, description, expectedStatus, response, condition = true) {
  const passed = response.status === expectedStatus && condition;
  results.push({ step, description, expected: expectedStatus, actual: response.status, result: passed ? "PASS" : "FAIL", body: response.body });
  console.log(`Step ${step}: ${passed ? "PASS" : "FAIL"} | ${description} | expected ${expectedStatus}, actual ${response.status}`);
  if (!passed) console.log("Response:", JSON.stringify(response.body, null, 2));
  return passed;
}

function shelters(response) {
  return response.body && Array.isArray(response.body.data) ? response.body.data : [];
}

function names(response) {
  return shelters(response).map((shelter) => shelter.name);
}

function hasNamesInOrder(response, expectedNames) {
  const actualNames = names(response);
  let previousIndex = -1;
  return expectedNames.every((name) => {
    const currentIndex = actualNames.indexOf(name);
    const isAfterPrevious = currentIndex > previousIndex;
    previousIndex = currentIndex;
    return currentIndex !== -1 && isAfterPrevious;
  });
}

function hasAllNames(response, expectedNames) {
  const actualNames = names(response);
  return expectedNames.every((name) => actualNames.includes(name));
}

async function createShelter(token, payload) {
  return request("POST", "/api/shelters", payload, token);
}

async function main() {
  if (!AUTHORITY_EMAIL || !AUTHORITY_PASSWORD) {
    console.error("Missing authority credentials. Set AUTHORITY_EMAIL and AUTHORITY_PASSWORD before running.");
    console.error("PowerShell: $env:AUTHORITY_EMAIL='authority@example.com'; $env:AUTHORITY_PASSWORD='password'");
    process.exitCode = 1;
    return;
  }

  const suffix = Date.now();
  const kanpurName = `Kanpur Relief Camp ${suffix}`;
  const lucknowName = `Lucknow Relief Camp ${suffix}`;
  const delhiName = `Delhi Relief Camp ${suffix}`;

  const login = await request("POST", "/api/auth/login", {
    email: AUTHORITY_EMAIL,
    password: AUTHORITY_PASSWORD,
  });
  const authorityToken = login.body && (login.body.accessToken || login.body.token);
  check(1, "Authority login", 200, login, Boolean(authorityToken));
  if (!authorityToken) {
    console.error("Cannot continue without an authority token.");
    return;
  }

  const kanpur = await createShelter(authorityToken, {
    name: kanpurName,
    address: "Kanpur Relief Camp, Kanpur",
    state: "Uttar Pradesh",
    district: "Kanpur",
    coordinates: [80.3319, 26.4499],
    capacity: 200,
  });
  const kanpurId = kanpur.body && kanpur.body.data && kanpur.body.data._id;
  check(2, "Create Kanpur Relief Camp", 201, kanpur, Boolean(kanpurId));

  const lucknow = await createShelter(authorityToken, {
    name: lucknowName,
    address: "Lucknow Relief Camp, Lucknow",
    state: "Uttar Pradesh",
    district: "Lucknow",
    coordinates: [80.9462, 26.8467],
    capacity: 150,
  });
  const lucknowId = lucknow.body && lucknow.body.data && lucknow.body.data._id;
  check(3, "Create Lucknow Relief Camp", 201, lucknow, Boolean(lucknowId));

  const delhi = await createShelter(authorityToken, {
    name: delhiName,
    address: "Delhi Relief Camp, New Delhi",
    state: "Delhi",
    district: "New Delhi",
    coordinates: [77.1025, 28.7041],
    capacity: 300,
  });
  const delhiId = delhi.body && delhi.body.data && delhi.body.data._id;
  check(4, "Create Delhi Relief Camp", 201, delhi, Boolean(delhiId));

  // No Authorization header: this request proves the nearby route is public.
  const defaultNearby = await request("GET", "/api/shelters/nearby?lng=80.3319&lat=26.4499");
  check(5, "Nearby shelters default 50km radius and closest-first order", 200, defaultNearby,
    names(defaultNearby).indexOf(kanpurName) === 0 && !names(defaultNearby).includes(delhiName));

  const mediumNearby = await request("GET", "/api/shelters/nearby?lng=80.3319&lat=26.4499&maxDistance=150000");
  check(6, "Nearby shelters within 150km include Kanpur and Lucknow, not Delhi", 200, mediumNearby,
    hasNamesInOrder(mediumNearby, [kanpurName, lucknowName]) && !names(mediumNearby).includes(delhiName));

  const wideNearby = await request("GET", "/api/shelters/nearby?lng=80.3319&lat=26.4499&maxDistance=1000000");
  check(7, "Nearby shelters within 1000km return Kanpur, Lucknow, Delhi in order", 200, wideNearby,
    hasNamesInOrder(wideNearby, [kanpurName, lucknowName, delhiName]));

  const missingCoordinates = await request("GET", "/api/shelters/nearby");
  check(8, "Nearby shelters rejects missing lng and lat", 400, missingCoordinates);

  const allShelters = await request("GET", "/api/shelters");
  check(9, "Public all-shelters endpoint includes all three test shelters", 200, allShelters,
    hasAllNames(allShelters, [kanpurName, lucknowName, delhiName]));

  // Repeat an unauthenticated call explicitly to document public access.
  const publicNearby = await request("GET", "/api/shelters/nearby?lng=80.3319&lat=26.4499");
  check(10, "Nearby endpoint is public without Authorization header", 200, publicNearby,
    names(publicNearby).includes(kanpurName));

  console.log("\n====================================");
  console.log("SHELTER API TEST RESULTS");
  console.log("====================================");
  console.table(results.map(({ step, description, expected, actual, result }) => ({ step, description, expected, actual, result })));
  const failed = results.filter((result) => result.result === "FAIL");
  console.log("====================================");
  console.log(`TOTAL: ${results.length - failed.length} PASSED / ${results.length} TESTS`);
  console.log(`FAILED: ${failed.length}`);
  console.log("====================================");
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((error) => {
  console.error("Test runner failed:", error);
  process.exitCode = 1;
});
