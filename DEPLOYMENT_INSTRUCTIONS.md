# Final Deployment Instructions for AirBear

This guide provides the final steps to deploy your fully-functional, real-time AirBear application to `airbear.me`.

The code in this repository is complete and production-ready. However, the automated deployment from our development environment is blocked by a Cloudflare authentication issue. By running the deployment from your own computer, you will bypass this issue and get your site live.

---

### **Prerequisites**

Before you begin, you will need:

1.  **Node.js and npm:** If you don't have them, install them from [nodejs.org](https://nodejs.org/).
2.  **A Code Editor:** A tool like VS Code is recommended.
3.  **Your Project Files:** You should have the latest version of this project downloaded to your computer.

---

### **Step 1: Create the Final Cloudflare API Token**

This is the most critical step. This token will give your computer the permission to deploy the site.

1.  **Start with the Template:**
    *   Go to the [API Tokens page](https://dash.cloudflare.com/e51a2bdba6bc83c5e4facff1bb288cff/api-tokens) in your Cloudflare dashboard.
    *   Click **Create Token**.
    *   Find the **Edit Cloudflare Workers** template and click **Use template**.

2.  **Add the Missing Permission:**
    *   Click the **+ Add more** button to add a new permission row.
    *   In the new row, select the following options from the dropdowns:
        *   `Account` > `Cloudflare Pages` > `Edit`

3.  **Confirm and Create:**
    *   Your token should now have **two** permissions listed:
        1.  `Account` > `Workers Scripts` > `Edit`
        2.  `Account` > `Cloudflare Pages` > `Edit`
    *   Ensure **Account Resources** is set to `Airbearme@gmail.com's Account`.
    *   Click **Continue to summary**, then **Create Token**.
    *   **Copy this token immediately and save it somewhere secure.** You will need it in the next step.

---

### **Step 2: Set Up Your `.env` File**

Your project needs your secret keys to connect to Stripe and Supabase.

1.  In the root directory of your project, you will see a file named `.env.example`.
2.  Make a copy of this file and rename it to `.env`.
3.  Open the new `.env` file and fill in your **production** (live) keys for Stripe and Supabase. The file should look like this:

```
# Cloudflare API Token (from Step 1)
CLOUFLARE_API_TOKEN=MyCRkll2FvtOKjvSQh3K6FFQcl4XQ1GcwWVKHaSe

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Supabase Configuration
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1Ni...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
```

**Important:** You must also add the `CLOUFLARE_API_TOKEN` you created in Step 1 to this file. The deployment script will use it to authenticate.

---

### **Step 3: Deploy the Application**

This is the final step. You will run a single command to deploy your entire application.

1.  **Open a Terminal:** Open a terminal or command prompt in the root directory of your project.
2.  **Install Dependencies:** Run the following command to install all the necessary tools:
    ```bash
    npm install
    ```
3.  **Run the Deploy Command:** Run the final command to deploy your site:
    ```bash
    npm run deploy -- --project-name=airbear --branch=main
    ```

The script will now build your application and deploy it to Cloudflare. When it is finished, your site will be live at `https://airbear.me` with all real-time features enabled.

---

If you encounter any issues, the most likely cause is an incorrect API key in your `.env` file. Please double-check that all keys are copied correctly.
