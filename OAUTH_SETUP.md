# OAuth Setup Guide for Mental Health Chatbot

This guide will help you set up Google OAuth authentication for your mental health chatbot.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Mental Health Chatbot"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (your email address)
6. Save and continue

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - Name: "Mental Health Chatbot Web Client"
   - Authorized JavaScript origins: 
     - `http://localhost:5000`
     - `http://127.0.0.1:5000`
     - Your production domain (if applicable)
   - Authorized redirect URIs:
     - `http://localhost:5000/login.html`
     - Your production login URL (if applicable)
5. Click "Create"
6. Copy the Client ID

## Step 4: Configure the Application

### Frontend Configuration

1. Open `frontend/login.html`
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID:

```html
<div id="g_id_onload"
     data-client_id="YOUR_ACTUAL_CLIENT_ID_HERE"
     data-callback="handleCredentialResponse"
     data-auto_prompt="false">
</div>
```

### Backend Configuration

1. Set the environment variable for your Google Client ID:

```bash
# On Windows
set GOOGLE_CLIENT_ID=your-actual-client-id-here

# On macOS/Linux
export GOOGLE_CLIENT_ID=your-actual-client-id-here
```

2. Or add it to your `.env` file (create if it doesn't exist):

```
GOOGLE_CLIENT_ID=your-actual-client-id-here
```

## Step 5: Install Dependencies

Install the new Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

## Step 6: Test the Setup

1. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```

2. Open `frontend/login.html` in your browser
3. Try signing in with Google
4. You should be redirected to the chat interface after successful authentication

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production environments
2. **Client ID Security**: The client ID is safe to expose in frontend code, but keep it secure
3. **Token Validation**: The backend validates tokens server-side for security
4. **User Data**: Only essential user information is stored locally

## Troubleshooting

### Common Issues

1. **"Invalid Client ID" Error**
   - Verify the client ID is correct in `login.html`
   - Check that the domain is authorized in Google Cloud Console

2. **"Redirect URI Mismatch" Error**
   - Ensure the redirect URI in Google Cloud Console matches your application URL
   - Check for trailing slashes or protocol mismatches

3. **Token Verification Fails**
   - Verify the `GOOGLE_CLIENT_ID` environment variable is set correctly
   - Check that the Google+ API is enabled

4. **CORS Issues**
   - Ensure the backend CORS configuration includes your frontend domain
   - Check that both frontend and backend are running on the same domain/port

### Debug Mode

To enable debug logging, set the environment variable:

```bash
export FLASK_DEBUG=1
```

## Production Deployment

For production deployment:

1. Update authorized origins and redirect URIs in Google Cloud Console
2. Use environment variables for configuration
3. Enable HTTPS
4. Consider implementing session management
5. Add rate limiting and security headers

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check the backend logs for Python errors
3. Verify all configuration steps were completed correctly
4. Ensure all dependencies are installed

## Privacy and Compliance

This implementation:
- Stores minimal user data locally
- Uses Google's secure OAuth flow
- Provides guest access option
- Includes crisis information and disclaimers
- Follows mental health app best practices

Remember that this chatbot is not a substitute for professional medical help. Always include appropriate disclaimers and crisis resources. 