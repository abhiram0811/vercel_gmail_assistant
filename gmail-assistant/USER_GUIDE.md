# 📖 User Guide - Gmail Assistant

Complete guide to using your Gmail Assistant for semantic email search.

## 🎯 What is Gmail Assistant?

Gmail Assistant is an AI-powered tool that lets you search your emails using natural language. Instead of searching for exact keywords, you can search by meaning and intent.

**Traditional Search**: "subject:meeting"  
**Semantic Search**: "emails about upcoming meetings"

## 🚀 Getting Started

### First-Time Setup

1. **Access the App**
   - Open your deployed app: `https://your-project.vercel.app`
   - Or locally: `http://localhost:3000`

2. **Sign In with Google**
   - Click the "Sign in with Google" button
   - Select your Google account
   - Review permissions (we only ask for read-only Gmail access)
   - Click "Allow"

3. **Index Your Emails**
   - After signing in, you'll see the dashboard
   - Click "Index Today's Emails" button
   - Wait for indexing to complete (may take 30-60 seconds)
   - You'll see a success message showing how many emails were indexed

Now you're ready to search!

## 🔍 How to Search

### Basic Search

1. Type your query in the search box
2. Click "Search" or press Enter
3. View results ranked by relevance

### Example Searches

**Work-Related:**
- "project updates from this week"
- "emails from my manager"
- "meeting invitations"
- "status reports"

**Personal:**
- "emails about bills and payments"
- "messages from my family"
- "order confirmations"
- "travel reservations"

**Time-Based:**
- "recent emails about work"
- "messages from last week"
- "today's important emails"

**Specific Topics:**
- "emails about the marketing campaign"
- "messages discussing the budget"
- "updates on client projects"

### Search Tips

✅ **Do:**
- Use natural language
- Be specific about what you're looking for
- Include context (e.g., "work emails about...")
- Search by intent, not exact words

❌ **Don't:**
- Use Gmail search operators (`from:`, `subject:`)
- Search for exact word matches
- Use quotation marks (not needed)
- Be too vague (e.g., just "emails")

## 📊 Understanding Results

### Result Cards

Each result shows:
- **Subject**: Email subject line
- **From**: Sender's email address
- **Date**: When the email was received
- **Match Score**: Percentage showing relevance (higher = more relevant)
- **Preview**: First 200 characters of the email

### Relevance Scores

- **90-100%**: Highly relevant, exact match to your query
- **70-89%**: Very relevant, closely related
- **50-69%**: Somewhat relevant, might be useful
- **Below 50%**: Loosely related (may not show in top results)

## 🔄 Indexing Emails

### When to Index

Index emails in these situations:
- **First time setup**: Index your initial emails
- **Daily routine**: Index new emails each day
- **After important emails**: Index immediately to search them
- **Weekly cleanup**: Re-index to keep database fresh

### Index Modes

**Today's Emails** (Default):
- Indexes emails from the current day
- Best for daily updates
- Fast and efficient

**Custom Indexing** (Future Feature):
- Index by date range
- Index specific labels
- Bulk indexing

### Index Statistics

The dashboard shows:
- **Total indexed emails**: How many emails are searchable
- **Last index time**: When you last indexed emails
- **Index size**: Database usage

## ⚙️ Dashboard Overview

### Top Bar
- **Logo**: "📧 Gmail Assistant"
- **Logout**: Sign out of the app

### Statistics Card
- **Email count**: Total indexed emails
- **Index button**: Trigger new indexing

### Search Section
- **Search input**: Enter your query
- **Search button**: Execute search
- **Tips**: Helpful search examples

### Results Section
- **Result count**: Number of matching emails
- **Result cards**: Matching emails with scores

## 🔐 Privacy & Security

### What We Access
- ✅ Read your Gmail messages (readonly)
- ✅ See sender, subject, date, and content
- ✅ Create search indexes

### What We DON'T Do
- ❌ Send emails on your behalf
- ❌ Delete or modify emails
- ❌ Share data with third parties
- ❌ Store emails permanently (only embeddings)

### Data Storage
- **OAuth Tokens**: Stored securely in Vercel KV (encrypted Redis)
- **Email Embeddings**: Stored in Pinecone (vector representations only)
- **Original Emails**: Never stored, only indexed
- **Search History**: Not tracked or stored

### Revoking Access

To remove app access:
1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find "Gmail Assistant"
3. Click "Remove Access"

Or from the app:
1. Click "Logout"
2. Clear browser cookies

## 🐛 Troubleshooting

### "Not Authenticated" Error
**Solution:**
1. Clear browser cookies
2. Go back to home page
3. Sign in again

### "No Results Found"
**Possible causes:**
- No emails indexed yet → Index some emails
- Search too specific → Try broader terms
- Recent emails not indexed → Run indexing again

### Search Returns Wrong Results
**Try:**
- Be more specific in your query
- Include more context
- Use different wording
- Index more emails for better context

### "Failed to Index Emails"
**Check:**
- Internet connection
- Gmail API quota (usually not an issue)
- Browser console for errors
- Try again in a few minutes

### Slow Performance
**Normal:**
- First search after indexing (initializing Pinecone)
- Indexing large batches (50+ emails)

**If persistently slow:**
- Check internet connection
- Try smaller index batches
- Clear browser cache

## 💡 Best Practices

### Daily Workflow

**Morning:**
1. Open Gmail Assistant
2. Click "Index Today's Emails"
3. Search for "important updates from yesterday"

**Throughout Day:**
1. Search as needed for specific emails
2. Use natural language queries

**Evening:**
1. Search for "unread messages that need response"
2. Review and respond

### Effective Searching

1. **Start broad, then narrow**
   - First: "work emails from this week"
   - Then: "project X updates from this week"

2. **Include context**
   - Good: "meeting invitations for next week"
   - Better: "meeting invitations about the product launch"

3. **Use variations**
   - If "project updates" doesn't work
   - Try "status updates" or "progress reports"

## 📈 Advanced Tips

### Combining Concepts
- "urgent emails from my boss about deadlines"
- "meeting notes with action items"
- "client feedback on recent delivery"

### Time References
- "this week", "today", "yesterday"
- "recent", "latest", "new"
- "last month", "this quarter"

### Relationship Context
- "from my team", "from clients"
- "from HR", "from management"
- "internal discussions", "external communications"

## 🎓 How It Works (Simple Explanation)

1. **Indexing**: Your emails are converted to "meaning vectors" (lists of numbers representing the email's meaning)
2. **Storage**: These vectors are stored in Pinecone (vector database)
3. **Searching**: Your query is also converted to a vector
4. **Matching**: Pinecone finds emails with similar meaning vectors
5. **Results**: Most similar emails are returned, ranked by relevance

**You don't search for exact words; you search for meaning!**

## 📞 Getting Help

### Check These Resources First
1. This user guide
2. [README.md](./README.md) - Setup and overview
3. [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment help
4. Browser console (F12) - Error messages

### Common Issues Already Solved
- Authentication problems → Logout and login again
- No results → Index emails first
- Wrong results → Refine your query
- Slow performance → Normal for first search

## 🎉 Tips for Power Users

1. **Regular Indexing**: Set a reminder to index daily
2. **Experiment**: Try different query phrasings
3. **Context Matters**: More context = better results
4. **Be Patient**: First search initializes Pinecone (may take 2-3s)
5. **Bookmark**: Add to browser bookmarks for quick access

## 📋 Quick Reference

### Keyboard Shortcuts
- **Enter**: Submit search
- **Escape**: Clear search box

### Search Pattern Templates
```
[topic] + [time] + [context]
Examples:
- "project updates from this week that need review"
- "meeting invites for tomorrow about planning"
- "client feedback from last month on deliverables"
```

---

**Enjoy semantic email search! 📧✨**

Need more help? Check the documentation or open an issue on GitHub.
