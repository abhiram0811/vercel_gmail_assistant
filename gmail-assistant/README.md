# Gmail Assistant - Production Ready 🚀# 📧 Gmail Vector Assistant



A production-ready Next.js application that provides AI-powered semantic search for your Gmail emails. Access your personal Gmail assistant from anywhere using a secure web interface.A learning project that teaches you how to:

- Work with Gmail API and OAuth2 authentication

## 🌟 Live Application- Store emails in a vector database (Pinecone)

- Query emails semantically using LLMs

**Production URL**: https://gmail-assisstant.vercel.app- Write async JavaScript code



## ✨ Features---



- 🔍 **Semantic Search**: Search emails by meaning, not just keywords using OpenAI embeddings## 🎯 Phase 1: Setup & Authentication (Current Phase)

- 📧 **Gmail Integration**: Secure read-only access to your Gmail via Google OAuth2

- 🤖 **AI-Powered**: Uses OpenAI text-embedding-3-small (1536 dimensions) for intelligent searchWe're starting with the foundation - getting authenticated access to Gmail.

- ⚡ **Vector Database**: Fast similarity search powered by Pinecone serverless

- 🔐 **Secure Authentication**: OAuth2 flow with encrypted token storage in Redis### **What You've Built So Far:**

- 📊 **Email Analytics**: View indexing stats and search performance metrics- ✅ Project structure with proper configuration

- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS- ✅ OAuth2 authentication module

- ☁️ **Serverless**: Deployed on Vercel's free tier with automatic scaling- ✅ Web server for OAuth callback handling

- ✅ Test script to verify Gmail access

## 🏗️ Architecture

---

```

Next.js 14 (App Router) + TypeScript## 🚀 Getting Started - Step by Step

├── Frontend: React components with Tailwind CSS

├── Backend: Vercel Serverless Functions### **Step 1: Install Dependencies**

├── Authentication: Google OAuth2 + Redis token storage

├── AI: OpenAI text-embedding-3-small```bash

└── Database: Pinecone serverless vector storenpm install

``````



## 📁 Project Structure**What this installs:**

- `googleapis` - Official Google API client for Node.js

```- `dotenv` - Loads environment variables from .env file

gmail-assistant/- `express` - Web server for OAuth callback

├── app/- `open` - Opens browser automatically

│   ├── page.tsx                    # Landing page with login

│   ├── dashboard/page.tsx          # Main dashboard with search---

│   └── api/

│       ├── auth/                   # OAuth routes (login, callback, status, logout)### **Step 2: Get Google OAuth2 Credentials**

│       └── emails/                 # Email operations (index, search, stats)

├── lib/This is the most important step! You need to create credentials in Google Cloud Console.

│   ├── gmail.ts                    # Gmail API client

│   ├── openai.ts                   # OpenAI embeddings#### **Detailed Instructions:**

│   ├── pinecone.ts                 # Vector database operations

│   ├── kv.ts                       # Redis token storage1. **Go to Google Cloud Console**

│   ├── session.ts                  # Cookie-based session management   - Visit: https://console.cloud.google.com/

│   └── types.ts                    # TypeScript interfaces

├── .env.local                      # Local environment variables2. **Create a New Project**

└── package.json                    # Dependencies   - Click "Select a Project" → "New Project"

```   - Name it: "Gmail Vector Assistant"

   - Click "Create"

## 🚀 Quick Start

3. **Enable Gmail API**

### Prerequisites   - In the left sidebar, go to "APIs & Services" → "Library"

   - Search for "Gmail API"

- Node.js 18+    - Click on it and press "Enable"

- Google Cloud account

- OpenAI API key4. **Create OAuth2 Credentials**

- Pinecone account   - Go to "APIs & Services" → "Credentials"

- Vercel account (for deployment)   - Click "Create Credentials" → "OAuth client ID"

   - If prompted, configure the OAuth consent screen:

### Local Development     - Choose "External" (unless you have a Google Workspace)

     - App name: "Gmail Vector Assistant"

1. **Clone and navigate to the project**:     - User support email: Your email

   ```bash     - Developer contact: Your email

   cd gmail-assistant     - Click "Save and Continue"

   ```     - Skip scopes (click "Save and Continue")

     - Add test users: Your Gmail address

2. **Install dependencies**:     - Click "Save and Continue"

   ```bash   

   npm install5. **Configure OAuth Client**

   ```   - Application type: "Web application"

   - Name: "Gmail Vector Assistant"

3. **Set up environment variables** (see gmail-assistant/SETUP_STEPS.md for detailed instructions):   - Authorized redirect URIs: `http://localhost:3000/oauth2callback`

   ```bash   - Click "Create"

   cp .env.local.example .env.local

   # Edit .env.local with your credentials6. **Copy Your Credentials**

   ```   - You'll see a popup with your Client ID and Client Secret

   - **IMPORTANT:** Keep these safe! You'll need them in the next step

4. **Run development server**:

   ```bash---

   npm run dev

   ```### **Step 3: Configure Environment Variables**



5. **Open**: http://localhost:30001. **Copy the example file:**

   ```bash

## 🔑 Environment Variables   cp .env.example .env

   ```

### Required for Production (Vercel)

- `GOOGLE_CLIENT_ID` - Google OAuth client ID2. **Edit `.env` file and add your credentials:**

- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret   ```

- `GOOGLE_REDIRECT_URI` - OAuth redirect (https://gmail-assisstant.vercel.app/api/auth/callback)   GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com

- `OPENAI_API_KEY` - OpenAI API key   GOOGLE_CLIENT_SECRET=your_actual_client_secret

- `PINECONE_API_KEY` - Pinecone API key   GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

- `REDIS_URL` - Redis connection string (Vercel marketplace database)   ```



### Additional for Local Development3. **Leave the other variables for now** (we'll set them up in later phases)

- All of the above, but with `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback`

---

## 📖 Documentation

### **Step 4: Authenticate with Gmail**

- **[SETUP_STEPS.md](./gmail-assistant/SETUP_STEPS.md)** - Complete setup instructions

- **[DEPLOYMENT.md](./gmail-assistant/DEPLOYMENT.md)** - Deployment guideNow the fun part! Let's connect to your Gmail account.

- **[USER_GUIDE.md](./gmail-assistant/USER_GUIDE.md)** - How to use the application

- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Full development context and history```bash

node src/oauth-server.js

## 🎯 How It Works```



1. **Authentication**: Users sign in with their Google account using OAuth2**What happens:**

2. **Token Storage**: Access tokens are securely stored in Redis with encryption1. A browser window opens automatically

3. **Email Indexing**: Emails are fetched from Gmail API and processed in batches2. You'll see "Connect Gmail Account" button

4. **Embedding Generation**: OpenAI creates semantic embeddings (1536-dim vectors) for each email3. Click it to go to Google login

5. **Vector Storage**: Embeddings are stored in Pinecone with metadata (subject, sender, date, snippet)4. Select your Google account

6. **Semantic Search**: User queries are converted to embeddings and matched against stored vectors5. Approve the permissions

7. **Results**: Top matching emails are returned with similarity scores6. You'll be redirected back with "Successfully Connected!"



## 🔒 Security & Privacy**Behind the scenes:**

- Your browser is redirected to Google with your Client ID

- **Read-only Gmail access**: Only `gmail.readonly` scope requested- You approve access to read your emails

- **No email storage**: Emails are processed but only metadata and embeddings are stored- Google sends back a temporary code

- **Encrypted tokens**: OAuth tokens are encrypted before storage in Redis- The server exchanges that code for access tokens

- **Session management**: Secure cookie-based sessions with httpOnly flags- Tokens are saved to `token.json` file

- **Environment isolation**: All secrets managed via environment variables

---

## 💰 Cost Optimization (Free Tier Usage)

### **Step 5: Test the Connection**

- **Vercel**: Free tier for hobby projects (serverless functions)

- **Pinecone**: Free serverless tier (100K vectors, ~10K emails)Verify everything works by fetching some emails:

- **OpenAI**: Pay-per-use (~$0.0001 per email for embeddings)

- **Redis**: Vercel marketplace free tier for token storage```bash

- **Gmail API**: Free (10 billion quota units per day)npm run test-auth

```

**Estimated cost**: ~$1-2/month for 10K emails (OpenAI embeddings only)

**What you'll see:**

## 🛠️ Tech Stack- List of your 5 most recent emails

- Sender, subject, and date for each

| Component | Technology | Version |- Demonstration of async programming patterns

|-----------|-----------|---------|

| Framework | Next.js | 16.0.3 |**If it works:** 🎉 Congratulations! Phase 1 is complete!

| Language | TypeScript | 5.x |

| Styling | Tailwind CSS | 3.x |**If it doesn't work:** Check common issues below

| OAuth | Google OAuth2 | googleapis v144 |

| AI/ML | OpenAI API | 4.76.0 |---

| Vector DB | Pinecone | 4.0.0 |

| Cache/Tokens | Redis | redis package |## 🐛 Troubleshooting

| Deployment | Vercel | Serverless |

### **Error: "Not authenticated yet"**

## 📊 Performance- Run `node src/oauth-server.js` first to authenticate



- **Email Indexing**: ~100 emails per minute### **Error: "redirect_uri_mismatch"**

- **Search Response**: <500ms average- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/oauth2callback`

- **Embedding Generation**: ~5 emails/second (OpenAI batch processing)- Check for trailing slashes or http vs https

- **Vector Search**: <100ms (Pinecone serverless)

### **Error: "invalid_client"**

## 🐛 Troubleshooting- Double-check your Client ID and Client Secret in `.env`

- Make sure there are no extra spaces

### OAuth Errors

- Ensure `GOOGLE_REDIRECT_URI` matches exactly in Google Console and environment variables### **Error: "Access blocked: This app's request is invalid"**

- Verify the redirect URI is added to "Authorized redirect URIs" in Google Cloud Console- Make sure you added yourself as a test user in the OAuth consent screen



### Indexing Fails### **Error: 401 Unauthorized**

- Check OpenAI API key and quota- Your token expired (they last 1 hour by default)

- Verify Pinecone index exists and is active- Run `node src/oauth-server.js` again to re-authenticate

- Check serverless function timeout limits (default: 10s, may need increase)

---

### Search Not Working

- Ensure emails are indexed first (check stats)## 📚 Key Concepts You've Learned

- Verify Pinecone API key and index name

- Check network connectivity to Pinecone### **1. OAuth2 Flow**

```

## 📈 Future EnhancementsUser → Your App → Google Login → User Approves → 

Google → Authorization Code → Your App → Exchange Code → 

- [ ] Email filtering by date rangeAccess Token → Your App can access Gmail

- [ ] Advanced search operators```

- [ ] Email categorization/labels

- [ ] Scheduled re-indexing### **2. Async/Await**

- [ ] Multi-language support```javascript

- [ ] Email summaries using GPT-4// Instead of callbacks:

- [ ] Conversation threadingfetchData(function(result) {

- [ ] Custom domain support  processData(result, function(processed) {

    console.log(processed);

## 📝 License  });

});

MIT License - feel free to use for personal projects

// We use async/await:

## 🤝 Contributingconst result = await fetchData();

const processed = await processData(result);

This is a personal project, but suggestions and feedback are welcome!console.log(processed);

```

## 📧 Support

### **3. Promise.all() for Parallel Operations**

For issues or questions, please check the documentation files or create an issue.```javascript

// Sequential (slow):

---const email1 = await fetchEmail(id1);

const email2 = await fetchEmail(id2);

**Built with ❤️ using Next.js, OpenAI, Pinecone, and Vercel**const email3 = await fetchEmail(id3);



Last Updated: November 20, 2025// Parallel (fast):

const [email1, email2, email3] = await Promise.all([
  fetchEmail(id1),
  fetchEmail(id2),
  fetchEmail(id3)
]);
```

### **4. Environment Variables**
- Never commit API keys to Git
- Use `.env` for local development
- Use `.env.example` to show what's needed

---

## 📁 Project Structure

```
gmail-vector-assistant/
├── src/
│   ├── auth.js           # OAuth2 authentication logic
│   ├── oauth-server.js   # Web server for OAuth callback
│   └── test-auth.js      # Test script to verify Gmail access
├── .env                  # Your secret credentials (not committed)
├── .env.example          # Template for required environment variables
├── .gitignore            # Prevents committing secrets
├── package.json          # Project dependencies and scripts
└── README.md             # This file!
```

---

## ✅ Phase 1 Complete Checklist

- [ ] Installed dependencies (`npm install`)
- [ ] Created Google Cloud project
- [ ] Enabled Gmail API
- [ ] Created OAuth2 credentials
- [ ] Configured `.env` file with credentials
- [ ] Successfully authenticated via browser
- [ ] Ran test script and saw your emails
- [ ] Understand OAuth2 flow
- [ ] Understand async/await basics

---

## 🎓 What's Next: Phase 2

In the next phase, we'll:
1. Fetch ALL your emails (with pagination)
2. Extract and parse email content
3. Handle different email formats (plain text, HTML)
4. Process email attachments (metadata only)
5. Learn about rate limiting and error handling

**Ready to continue?** Let me know and I'll guide you through Phase 2!

---

## 💡 Learning Tips

1. **Read the comments** in the code - they explain every concept
2. **Experiment** - try changing the code and see what happens
3. **Break things** - errors teach you more than success
4. **Ask questions** - if anything is unclear, ask!

---

## 🔒 Security Notes

- Never commit `.env` file to Git (it's in `.gitignore`)
- Never share your Client Secret publicly
- The `token.json` file contains sensitive data - don't share it
- For production apps, use more secure token storage (databases, vaults)

---

## 📖 Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth2 Explained](https://developers.google.com/identity/protocols/oauth2)
- [Async/Await Guide](https://javascript.info/async-await)
- [Google Cloud Console](https://console.cloud.google.com/)
