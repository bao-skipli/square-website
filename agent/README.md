# Bunny.net Local Deployment & Domain Agent

This package provides a secure local agent that directly connects your Squareup Clone application to **Bunny.net HTTP APIs** without using the Bunny Sites CLI.

## Security Architecture

1. **No Secrets in Frontend**: Your Bunny Account API Key and Storage Zone Passwords are kept exclusively on your local machine in `agent/.env`. The React frontend and Vite client bundle **never** receive privileged credentials.
2. **Two Separate Credential Types**:
   - **Bunny Account API Key** (`BUNNY_ACCOUNT_API_KEY`): Used for Management API operations: adding/removing custom hostnames, provisioning Let's Encrypt SSL certificates, and purging CDN cache.
   - **Bunny Storage Zone Password** (`BUNNY_STORAGE_ZONE_PASSWORD`): Used exclusively for the Storage API to upload static assets (`dist/`).
3. **No Shell Injections**: The agent runs pre-defined, validated build commands (`npm run build`) strictly in the project directory.

## Setup Instructions

### 1. Configure Credentials
Copy the example file to `.env`:
```bash
cp agent/.env.example agent/.env
```
Edit `agent/.env` and fill in your values:

```env
# 1. Bunny Account API Key (Account Settings -> API Key)
BUNNY_ACCOUNT_API_KEY=your_bunny_account_api_key

# 2. Pull Zone Information
BUNNY_PULL_ZONE_ID=123456
BUNNY_CDN_HOSTNAME=yourstore.b-cdn.net

# 3. Storage Zone Information (Needed for Build & Deploy Storefront)
BUNNY_STORAGE_ZONE_NAME=your_storage_zone
BUNNY_STORAGE_ZONE_PASSWORD=your_storage_zone_password
BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com
```

### 2. Start the Agent
In a separate terminal window, run:
```bash
npm run agent
```

When started, the agent will:
1. Announce connection and register its online presence in Firebase Realtime Database (`agentStatus`).
2. Listen for custom domain connection, verification, and removal jobs.
3. Listen for build & deployment jobs, compile the Vite project, upload files to Bunny Storage, purge Pull Zone cache, and verify the live website.

### 3. Simulation / Testing Mode
If no credentials are provided yet, the agent automatically starts in **Simulated Mode**. This allows you to test the entire Dashboard UI flow (adding domains, viewing DNS instructions, testing deployment progress and logs) locally without real credentials.
