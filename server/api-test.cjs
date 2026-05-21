const axios = require("axios");
const { faker } = require("@faker-js/faker");

// Configure axios for the test
const api = axios.create({
   baseURL: "http://localhost:3000/api",
   withCredentials: true, // This is crucial for session cookies
});

// To hold the cookie between requests
let cookie = "";

// Intercept responses to capture the session cookie
api.interceptors.response.use(
   (response) => {
      if (response.headers["set-cookie"]) {
         cookie = response.headers["set-cookie"][0];
      }
      return response;
   },
   (error) => {
      return Promise.reject(error);
   },
);

// Intercept requests to attach the session cookie
api.interceptors.request.use(
   (config) => {
      if (cookie) {
         config.headers["Cookie"] = cookie;
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   },
);

const log = (message, data = "") => {
   console.log(`\n--- ${message} ---`);
   if (data) {
      console.log(JSON.stringify(data, null, 2));
   }
};

const runTest = async () => {
   try {
      const testUser = {
         name: faker.person.fullName(),
         email: faker.internet.email(),
         password: "password123",
      };
      let generatedThumbnailId = null;

      // 1. Test Root Endpoint
      log("Testing GET /");
      const rootRes = await axios.get("http://localhost:3000/");
      console.log("Status:", rootRes.status, "OK");

      // 2. Test User Registration
      log("Testing POST /auth/register");
      const regRes = await api.post("/auth/register", testUser);
      console.log("Status:", regRes.status, "OK");
      log("Register Response:", regRes.data);

      // 3. Test User Login
      log("Testing POST /auth/login");
      const loginRes = await api.post("/auth/login", {
         email: testUser.email,
         password: testUser.password,
      });
      console.log("Status:", loginRes.status, "OK");
      log("Login Response:", loginRes.data);

      // 4. Test Session Verification
      log("Testing GET /auth/verify");
      const verifyRes = await api.get("/auth/verify");
      console.log("Status:", verifyRes.status, "OK");
      log("Verify Response:", verifyRes.data);
      if (!verifyRes.data.isLoggedIn) {
         throw new Error("Verification failed: User should be logged in.");
      }

      // 5. Test Thumbnail Generation (This will call the Gemini API)
      // NOTE: This will fail if your GEMINI_API_KEY is invalid or has quota issues.
      log("Testing POST /thumbnail/generate");
      const genRes = await api.post("/thumbnail/generate", {
         prompt: "A cute cat wearing a wizard hat",
         colorScheme: "Vibrant",
         style: "Cartoon",
         aspectRatio: "16:9",
      });
      console.log("Status:", genRes.status, "OK");
      log("Generate Response:", genRes.data);
      if (!genRes.data.thumbnail._id) {
         throw new Error("Thumbnail generation failed to return an ID.");
      }
      generatedThumbnailId = genRes.data.thumbnail._id;

      // 6. Test Get All User Thumbnails
      log("Testing GET /user/thumbnails");
      const allThumbsRes = await api.get("/user/thumbnails");
      console.log("Status:", allThumbsRes.status, "OK");
      log("Get All Thumbnails Response:", allThumbsRes.data);
      if (allThumbsRes.data.thumbnail.length === 0) {
         throw new Error("Get all thumbnails returned an empty array.");
      }

      // 7. Test Get Thumbnail by ID
      log("Testing GET /user/thumbnails/:id");
      const thumbByIdRes = await api.get(
         `/user/thumbnails/${generatedThumbnailId}`,
      );
      console.log("Status:", thumbByIdRes.status, "OK");
      log("Get Thumbnail by ID Response:", thumbByIdRes.data);

      // 8. Test Deleting the Thumbnail
      log("Testing DELETE /thumbnail/delete/:id");
      const deleteRes = await api.delete(
         `/thumbnail/delete/${generatedThumbnailId}`,
      );
      console.log("Status:", deleteRes.status, "OK");
      log("Delete Response:", deleteRes.data);

      // 9. Test User Logout
      log("Testing POST /auth/logout");
      const logoutRes = await api.post("/auth/logout");
      console.log("Status:", logoutRes.status, "OK");
      log("Logout Response:", logoutRes.data);

      // 10. Verify User is Logged Out
      log("Testing GET /auth/verify (after logout)");
      const verifyAfterLogoutRes = await api.get("/auth/verify");
      console.log("Status:", verifyAfterLogoutRes.status, "OK");
      log("Verify After Logout Response:", verifyAfterLogoutRes.data);
      if (verifyAfterLogoutRes.data.isLoggedIn) {
         throw new Error("Verification failed: User should be logged out.");
      }

      console.log("\n✅ All API tests passed successfully!");
   } catch (error) {
      console.error("\n❌ API Test Failed!");
      // Log the full error to get more details, especially for connection issues
      console.error(error);
      process.exit(1); // Exit with an error code
   }
};

runTest();
