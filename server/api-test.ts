import axios from "axios";
import { CookieJar } from "tough-cookie";
import { HttpCookieAgent, HttpsCookieAgent } from "http-cookie-agent/http";
import http from "http";

const API_URL = "http://localhost:3000/api";

const cookieJar = new CookieJar();
const httpAgent = new HttpCookieAgent({ cookies: { jar: cookieJar } });
const httpsAgent = new HttpsCookieAgent({ cookies: { jar: cookieJar } });

const client = axios.create({
   httpAgent,
   httpsAgent,
   withCredentials: true,
});

let testUserId = "";
let testThumbnailId = "";
let testUserEmail = "";
let testUserPassword = "Test123!";

const tests = {
   async register() {
      console.log("\n📝 Testing: POST /api/auth/register");
      try {
         testUserEmail = `test${Date.now()}@example.com`;
         const res = await client.post(`${API_URL}/auth/register`, {
            email: testUserEmail,
            name: "Test User",
            password: testUserPassword,
         });
         console.log("✅ Register successful:", res.data);
         testUserId = res.data.user._id;
         return true;
      } catch (error: any) {
         console.error(
            "❌ Register failed:",
            error.response?.data || error.message,
         );
         return false;
      }
   },

   async login() {
      console.log("\n🔑 Testing: POST /api/auth/login");
      try {
         const res = await client.post(`${API_URL}/auth/login`, {
            email: testUserEmail,
            password: testUserPassword,
         });
         console.log("✅ Login successful:", res.data);
         return true;
      } catch (error: any) {
         console.error(
            "❌ Login failed:",
            error.response?.data || error.message,
         );
         return false;
      }
   },

   async verify() {
      console.log("\n✓ Testing: GET /api/auth/verify");
      try {
         const res = await client.get(`${API_URL}/auth/verify`);
         console.log("✅ Verify successful:", res.data);
         return res.data.isLoggedIn;
      } catch (error: any) {
         console.error(
            "❌ Verify failed:",
            error.response?.data || error.message,
         );
         return false;
      }
   },

   async generateThumbnail() {
      console.log("\n🎬 Testing: POST /api/thumbnail/generate");
      try {
         const res = await client.post(`${API_URL}/thumbnail/generate`, {
            title: "Test Thumbnail",
            style: "Bold & Graphic",
            color_scheme: "vibrant",
            aspect_ratio: "16:9",
         });
         console.log("✅ Generate thumbnail successful:", res.data);
         if (res.data.thumbnail?._id) {
            testThumbnailId = res.data.thumbnail._id;
         }
         return true;
      } catch (error: any) {
         console.error(
            "❌ Generate thumbnail failed:",
            error.response?.data || error.message,
         );
         return false;
      }
   },

   async getThumbnails() {
      console.log("\n📋 Testing: GET /api/user/thumbnails");
      try {
         const res = await client.get(`${API_URL}/user/thumbnails`);
         console.log("✅ Get thumbnails successful:", res.data);
         if (res.data.thumbnail?.length > 0) {
            testThumbnailId = res.data.thumbnail[0]._id;
         }
         return true;
      } catch (error: any) {
         console.error(
            "❌ Get thumbnails failed:",
            error.response?.data || error.message,
         );
         return false;
      }
   },

   async getThumbnailById() {
      if (!testThumbnailId) {
         console.log(
            "\n⚠️  Skipping: GET /api/user/thumbnails/:id (No thumbnail ID)",
         );
         return false;
      }
      console.log(`\n🖼️  Testing: GET /api/user/thumbnails/${testThumbnailId}`);
      try {
         const res = await client.get(
            `${API_URL}/user/thumbnails/${testThumbnailId}`,
         );
         console.log("✅ Get thumbnail by ID successful:", res.data);
         return true;
      } catch (error: any) {
         console.error(
            "❌ Get thumbnail by ID failed:",
            error.response?.data || error.message,
         );
         return false;
      }
   },

   async deleteThumbnail() {
      if (!testThumbnailId) {
         console.log(
            "\n⚠️  Skipping: DELETE /api/thumbnail/delete/:id (No thumbnail ID)",
         );
         return false;
      }
      console.log(
         `\n🗑️  Testing: DELETE /api/thumbnail/delete/${testThumbnailId}`,
      );
      try {
         const res = await client.delete(
            `${API_URL}/thumbnail/delete/${testThumbnailId}`,
         );
         console.log("✅ Delete thumbnail successful:", res.data);
         return true;
      } catch (error: any) {
         console.error(
            "❌ Delete thumbnail failed:",
            error.response?.data || error.message,
         );
         return false;
      }
   },

   async logout() {
      console.log("\n🚪 Testing: POST /api/auth/logout");
      try {
         const res = await client.post(`${API_URL}/auth/logout`);
         console.log("✅ Logout successful:", res.data);
         return true;
      } catch (error: any) {
         console.error(
            "❌ Logout failed:",
            error.response?.data || error.message,
         );
         return false;
      }
   },
};

async function runTests() {
   console.log("🚀 Starting API Tests...\n");

   // Run tests in correct sequence
   const results = {
      register: await tests.register(),
   };

   if (results.register) {
      results.login = await tests.login();
      results.verify = await tests.verify();

      if (results.verify) {
         results.getThumbnails = await tests.getThumbnails();
         results.getThumbnailById = await tests.getThumbnailById();
         results.generateThumbnail = await tests.generateThumbnail();
         results.deleteThumbnail = await tests.deleteThumbnail();
         results.logout = await tests.logout();
      }
   }

   console.log("\n\n📊 Test Results Summary:");
   console.log("========================");
   Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? "✅" : "❌"} ${test}`);
   });

   const passedCount = Object.values(results).filter(Boolean).length;
   console.log(`\n${passedCount}/${Object.keys(results).length} tests passed`);
}

runTests().catch(console.error);
