# Mental Health Chatbot with OAuth Authentication

A secure, AI-powered mental health chatbot with Google OAuth authentication, sentiment analysis, and personalized support.

## Features

### 🔐 Authentication
- **Google OAuth Integration**: Secure login with Google accounts
- **Guest Access**: Option to use the chatbot without creating an account
- **Session Management**: Automatic authentication checks and redirects
- **User Profiles**: Personalized experience with user information

### 🤖 AI Chatbot
- **Sentiment Analysis**: Real-time emotion and sentiment detection
- **Intent Recognition**: Understands user intentions and responds appropriately
- **Conversation Trends**: Tracks emotional patterns throughout conversations
- **Personalized Responses**: Tailored responses based on user's emotional state

### 🎨 Modern UI
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful Interface**: Modern gradient design with smooth animations
- **User-Friendly**: Intuitive navigation and clear user feedback
- **Accessibility**: Designed with accessibility in mind

## Quick Start

### 1. Setup OAuth (Optional)
Follow the detailed setup guide in `OAUTH_SETUP.md` to configure Google OAuth authentication.

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the Backend
```bash
cd backend
python app.py
```

### 4. Access the Application
Open `frontend/entry.html` in your browser. This will automatically redirect you to:
- Login page if not authenticated
- Chat interface if already authenticated

## File Structure

```
MentalPEP/
├── frontend/
│   ├── entry.html          # Entry point with auth check
│   ├── login.html          # OAuth login page
│   ├── login.css           # Login page styles
│   ├── login.js            # Login controller
│   ├── index.html          # Main chat interface
│   ├── app.js              # Chat controller
│   └── styles.css          # Main styles
├── backend/
│   ├── app.py              # Flask server with OAuth endpoints
│   ├── requirements.txt    # Python dependencies
│   ├── model.pkl           # ML model
│   └── vectorizer.pkl      # Text vectorizer
├── OAUTH_SETUP.md          # Detailed OAuth setup guide
└── README_OAUTH.md         # This file
```

## Authentication Flow

1. **Entry Point**: `entry.html` checks authentication status
2. **Login Page**: `login.html` provides Google OAuth and guest login options
3. **Authentication**: User can sign in with Google or continue as guest
4. **Chat Interface**: `index.html` shows personalized chat with user info
5. **Session Management**: Automatic logout and session persistence

## User Experience

### For Authenticated Users
- Personalized welcome message with their name
- Profile picture and user information displayed
- Secure session management
- Option to logout

### For Guest Users
- Anonymous access to all features
- No personal data collection
- Same functionality as authenticated users
- Clear "Guest" indicator

## Security Features

- **Token Validation**: Backend verifies Google OAuth tokens
- **CORS Protection**: Proper cross-origin resource sharing configuration
- **Local Storage**: Secure storage of authentication tokens
- **Privacy Focused**: Minimal data collection and storage

## Mental Health Features

### Crisis Awareness
- Detects concerning emotional states
- Provides appropriate crisis resources
- Clear disclaimers about professional help
- Emergency contact information

### Sentiment Analysis
- Real-time emotion detection
- Confidence scoring for analysis
- Conversation trend tracking
- Personalized response generation

### Support Categories
- Anxiety support
- Depression assistance
- Loneliness help
- General emotional support
- Crisis intervention

## Configuration

### Environment Variables
```bash
GOOGLE_CLIENT_ID=your-google-client-id
FLASK_DEBUG=1  # Optional: for development
```

### Google OAuth Setup
1. Create Google Cloud Project
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Update client ID in `login.html`
5. Set environment variable

## Development

### Adding New Features
1. Backend: Add new endpoints in `app.py`
2. Frontend: Update controllers in `app.js` or `login.js`
3. Styling: Modify CSS files as needed
4. Testing: Test both authenticated and guest flows

### Customization
- Modify color schemes in CSS files
- Add new OAuth providers
- Extend sentiment analysis
- Customize chatbot responses

## Privacy and Compliance

### Data Handling
- Minimal data collection
- Local storage only
- No server-side user data storage
- Secure token handling

### Mental Health Best Practices
- Clear disclaimers
- Crisis resource links
- Professional help recommendations
- Appropriate content warnings

## Troubleshooting

### Common Issues
1. **OAuth not working**: Check client ID and domain configuration
2. **CORS errors**: Verify backend CORS settings
3. **Authentication loops**: Clear browser storage and restart
4. **Styling issues**: Check CSS file paths and browser compatibility

### Debug Mode
Enable debug logging:
```bash
export FLASK_DEBUG=1
python app.py
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Review backend logs
3. Verify OAuth configuration
4. Test with both authenticated and guest users

## License

This project is for educational and mental health support purposes. Please ensure compliance with local regulations and mental health guidelines.

---

**Important**: This chatbot is not a substitute for professional medical help. If you're experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately. 