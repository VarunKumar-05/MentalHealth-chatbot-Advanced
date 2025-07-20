from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import random
import os
import json
import sys
import jwt
import requests

# Add parent directory to path to import sentiment_analysis
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sentiment_analysis import SentimentAnalyzer

# Load model and vectorizer
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'vectorizer.pkl')
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

# Initialize sentiment analyzer
sentiment_analyzer = SentimentAnalyzer()

# Load intent responses from dataset
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../intents.json'))
with open(DATASET_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

intent_responses = {}
for intent in data['intents']:
    tag = intent['tag']
    responses = intent.get('responses', [])
    if isinstance(responses, list):
        intent_responses[tag] = responses
    else:
        intent_responses[tag] = [responses]

# Store conversation history for sentiment analysis
conversation_history = []

def generate_response(intent, sentiment_analysis=None):
    """Generate response based on intent and sentiment analysis"""
    responses = intent_responses.get(intent, [])
    
    if not responses:
        return "I'm here to help. Please let me know how I can assist you."
    
    # Select base response
    base_response = random.choice(responses)
    
    # If sentiment analysis is available, personalize the response
    if sentiment_analysis:
        sentiment = sentiment_analysis['sentiment']
        emotion = sentiment_analysis['emotion']
        confidence = sentiment_analysis['confidence']
        
        # Add sentiment-aware prefix for negative emotions
        if sentiment == 'negative' and confidence > 30:
            if emotion == 'suicidal':
                return f"I'm very concerned about what you're saying. {base_response} Please know that you're not alone and there are people who care about you. If you're having thoughts of self-harm, please call a crisis hotline immediately."
            elif emotion in ['depression', 'loneliness']:
                return f"I can sense you're going through a difficult time. {base_response} It's okay to feel this way, and I'm here to listen."
            elif emotion == 'anxiety':
                return f"I understand this might be causing you anxiety. {base_response} Let's work through this together."
            else:
                return f"I hear that you're feeling down. {base_response}"
        
        # Add positive reinforcement for positive emotions
        elif sentiment == 'positive' and confidence > 30:
            return f"That's wonderful to hear! {base_response}"
    
    return base_response

app = Flask(__name__)
CORS(app)

# OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', 'your-google-client-id')
GOOGLE_ISSUER = 'https://accounts.google.com'

def verify_google_token(token):
    """Verify Google OAuth token"""
    try:
        # Decode the token without verification first to get the header
        header = jwt.get_unverified_header(token)
        
        # Get Google's public keys
        response = requests.get('https://www.googleapis.com/oauth2/v1/certs')
        response.raise_for_status()
        public_keys = response.json()
        
        # Find the correct key
        key_id = header.get('kid')
        if key_id not in public_keys:
            return None
            
        public_key = public_keys[key_id]
        
        # Verify the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=['RS256'],
            audience=GOOGLE_CLIENT_ID,
            issuer=GOOGLE_ISSUER
        )
        
        return payload
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

@app.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify OAuth token endpoint"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'No token provided'}), 400
        
        # Verify the token
        payload = verify_google_token(token)
        
        if payload:
            return jsonify({
                'valid': True,
                'user': {
                    'id': payload.get('sub'),
                    'email': payload.get('email'),
                    'name': payload.get('name'),
                    'picture': payload.get('picture')
                }
            })
        else:
            return jsonify({'error': 'Invalid token'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message', '')
    
    # Analyze sentiment
    sentiment_result = sentiment_analyzer.analyze_sentiment(user_input)
    
    # Predict intent
    user_input_vec = vectorizer.transform([user_input])
    intent = model.predict(user_input_vec)[0]
    
    # Generate personalized response
    response = generate_response(intent, sentiment_result)
    
    # Store in conversation history
    conversation_history.append({
        'sender': 'user',
        'text': user_input,
        'sentiment': sentiment_result['sentiment'],
        'emotion': sentiment_result['emotion'],
        'intent': intent
    })
    
    # Analyze conversation trends if we have enough history
    conversation_analysis = None
    if len(conversation_history) >= 3:
        conversation_analysis = sentiment_analyzer.analyze_conversation_history(conversation_history)
    
    return jsonify({
        'response': response,
        'intent': intent,
        'sentiment': sentiment_result['sentiment'],
        'emotion': sentiment_result['emotion'],
        'confidence': sentiment_result['confidence'],
        'conversation_trend': conversation_analysis
    })

@app.route('/sentiment-analysis', methods=['POST'])
def analyze_sentiment():
    """Endpoint for standalone sentiment analysis"""
    text = request.json.get('text', '')
    result = sentiment_analyzer.analyze_sentiment(text)
    return jsonify(result)

@app.route('/conversation-analysis', methods=['GET'])
def get_conversation_analysis():
    """Get analysis of entire conversation history"""
    if not conversation_history:
        return jsonify({'message': 'No conversation history available'})
    
    analysis = sentiment_analyzer.analyze_conversation_history(conversation_history)
    return jsonify(analysis)

if __name__ == '__main__':
    app.run(debug=True) 