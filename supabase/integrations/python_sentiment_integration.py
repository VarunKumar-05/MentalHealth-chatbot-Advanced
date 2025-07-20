#!/usr/bin/env python3
"""
Python Integration for Enhanced Sentiment Analysis with Supabase
This script provides a bridge between the existing trained sentiment analysis model
and the Supabase Edge Function deployment.
"""

import pickle
import json
import requests
import os
from typing import Dict, Any, Optional
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseSentimentIntegration:
    """
    Integration class that combines the existing sentiment analysis model
    with Supabase deployment for enhanced mental health chatbot functionality.
    """
    
    def __init__(self, supabase_url: str, supabase_key: str, model_path: str = "backend/model.pkl", vectorizer_path: str = "backend/vectorizer.pkl"):
        """
        Initialize the integration with Supabase credentials and model paths.
        
        Args:
            supabase_url: Supabase project URL
            supabase_key: Supabase service role key
            model_path: Path to the trained sentiment analysis model
            vectorizer_path: Path to the text vectorizer
        """
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.model_path = model_path
        self.vectorizer_path = vectorizer_path
        
        # Load the trained model and vectorizer
        self.model = None
        self.vectorizer = None
        self.load_models()
        
        # Initialize Supabase client
        self.supabase_headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
    
    def load_models(self):
        """Load the trained sentiment analysis model and vectorizer."""
        try:
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            logger.info(f"Loaded model from {self.model_path}")
            
            with open(self.vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            logger.info(f"Loaded vectorizer from {self.vectorizer_path}")
                
        except FileNotFoundError as e:
            logger.warning(f"Model files not found: {e}")
            logger.info("Will use fallback sentiment analysis")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
    
    def analyze_sentiment_with_model(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment using the trained model.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary containing sentiment analysis results
        """
        if self.model is None or self.vectorizer is None:
            return self.fallback_sentiment_analysis(text)
        
        try:
            # Vectorize the text
            text_vectorized = self.vectorizer.transform([text])
            
            # Predict sentiment
            prediction = self.model.predict(text_vectorized)[0]
            prediction_proba = self.model.predict_proba(text_vectorized)[0]
            
            # Get confidence score
            confidence = max(prediction_proba) * 100
            
            # Map prediction to sentiment
            sentiment_mapping = {
                0: 'negative',
                1: 'neutral', 
                2: 'positive'
            }
            
            sentiment = sentiment_mapping.get(prediction, 'neutral')
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'prediction': prediction,
                'probabilities': prediction_proba.tolist(),
                'method': 'trained_model'
            }
            
        except Exception as e:
            logger.error(f"Error in model prediction: {e}")
            return self.fallback_sentiment_analysis(text)
    
    def fallback_sentiment_analysis(self, text: str) -> Dict[str, Any]:
        """
        Fallback sentiment analysis when the trained model is not available.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary containing sentiment analysis results
        """
        text_lower = text.lower()
        
        # Simple keyword-based analysis
        positive_words = ['happy', 'good', 'great', 'wonderful', 'excellent', 'amazing', 'love', 'joy']
        negative_words = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'suicidal']
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = 'positive'
            confidence = min(positive_count * 20, 100)
        elif negative_count > positive_count:
            sentiment = 'negative'
            confidence = min(negative_count * 20, 100)
        else:
            sentiment = 'neutral'
            confidence = 50
        
        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'method': 'fallback_keywords'
        }
    
    def detect_emotion(self, text: str) -> str:
        """
        Detect emotional state from text.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Detected emotion
        """
        text_lower = text.lower()
        
        emotion_keywords = {
            'anxiety': ['anxious', 'worried', 'nervous', 'scared', 'fear', 'panic', 'stress'],
            'depression': ['sad', 'depressed', 'hopeless', 'worthless', 'empty', 'tired', 'exhausted'],
            'anger': ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'hate'],
            'happiness': ['happy', 'joy', 'excited', 'pleased', 'content', 'grateful'],
            'loneliness': ['alone', 'lonely', 'isolated', 'abandoned', 'left out'],
            'suicidal': ['suicide', 'kill myself', 'end it all', 'want to die', 'better off dead']
        }
        
        emotion_scores = {}
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                emotion_scores[emotion] = score
        
        if emotion_scores:
            return max(emotion_scores, key=emotion_scores.get)
        else:
            return 'neutral'
    
    def detect_intent(self, text: str) -> str:
        """
        Detect user intent from text.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Detected intent
        """
        text_lower = text.lower()
        
        intent_keywords = {
            'help_request': ['help', 'support', 'need', 'struggling', 'crisis'],
            'greeting': ['hello', 'hi', 'how are you', 'feeling', 'doing'],
            'gratitude': ['thank', 'thanks', 'appreciate', 'grateful'],
            'meditation': ['meditate', 'breathing', 'calm', 'relax', 'mindfulness'],
            'sleep': ['sleep', 'insomnia', 'tired', 'rest', 'bed'],
            'general': ['general', 'talk', 'chat', 'conversation']
        }
        
        intent_scores = {}
        for intent, keywords in intent_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                intent_scores[intent] = score
        
        if intent_scores:
            return max(intent_scores, key=intent_scores.get)
        else:
            return 'general'
    
    def comprehensive_analysis(self, text: str) -> Dict[str, Any]:
        """
        Perform comprehensive sentiment analysis combining model and rule-based approaches.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Comprehensive analysis results
        """
        # Get model-based sentiment
        model_result = self.analyze_sentiment_with_model(text)
        
        # Get emotion and intent
        emotion = self.detect_emotion(text)
        intent = self.detect_intent(text)
        
        # Combine results
        result = {
            'text': text,
            'sentiment': model_result['sentiment'],
            'emotion': emotion,
            'intent': intent,
            'confidence': model_result['confidence'],
            'method': model_result['method'],
            'timestamp': datetime.now().isoformat(),
            'analysis_details': {
                'model_prediction': model_result.get('prediction'),
                'model_probabilities': model_result.get('probabilities'),
                'emotion_keywords_found': self._get_emotion_keywords(text),
                'intent_keywords_found': self._get_intent_keywords(text)
            }
        }
        
        return result
    
    def _get_emotion_keywords(self, text: str) -> Dict[str, list]:
        """Get emotion keywords found in text."""
        text_lower = text.lower()
        emotion_keywords = {
            'anxiety': ['anxious', 'worried', 'nervous', 'scared', 'fear', 'panic', 'stress'],
            'depression': ['sad', 'depressed', 'hopeless', 'worthless', 'empty', 'tired', 'exhausted'],
            'anger': ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'hate'],
            'happiness': ['happy', 'joy', 'excited', 'pleased', 'content', 'grateful'],
            'loneliness': ['alone', 'lonely', 'isolated', 'abandoned', 'left out'],
            'suicidal': ['suicide', 'kill myself', 'end it all', 'want to die', 'better off dead']
        }
        
        found_keywords = {}
        for emotion, keywords in emotion_keywords.items():
            found = [kw for kw in keywords if kw in text_lower]
            if found:
                found_keywords[emotion] = found
        
        return found_keywords
    
    def _get_intent_keywords(self, text: str) -> Dict[str, list]:
        """Get intent keywords found in text."""
        text_lower = text.lower()
        intent_keywords = {
            'help_request': ['help', 'support', 'need', 'struggling', 'crisis'],
            'greeting': ['hello', 'hi', 'how are you', 'feeling', 'doing'],
            'gratitude': ['thank', 'thanks', 'appreciate', 'grateful'],
            'meditation': ['meditate', 'breathing', 'calm', 'relax', 'mindfulness'],
            'sleep': ['sleep', 'insomnia', 'tired', 'rest', 'bed'],
            'general': ['general', 'talk', 'chat', 'conversation']
        }
        
        found_keywords = {}
        for intent, keywords in intent_keywords.items():
            found = [kw for kw in keywords if kw in text_lower]
            if found:
                found_keywords[intent] = found
        
        return found_keywords
    
    def send_to_supabase(self, analysis_result: Dict[str, Any], user_id: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send analysis results to Supabase for storage and processing.
        
        Args:
            analysis_result: Comprehensive analysis results
            user_id: User ID
            conversation_id: Optional conversation ID
            
        Returns:
            Response from Supabase
        """
        try:
            # Prepare data for Supabase
            data = {
                'user_id': user_id,
                'text': analysis_result['text'],
                'sentiment': analysis_result['sentiment'],
                'emotion': analysis_result['emotion'],
                'intent': analysis_result['intent'],
                'confidence': analysis_result['confidence'],
                'analysis_details': json.dumps(analysis_result['analysis_details']),
                'timestamp': analysis_result['timestamp']
            }
            
            if conversation_id:
                data['conversation_id'] = conversation_id
            
            # Send to Supabase messages table
            url = f"{self.supabase_url}/rest/v1/messages"
            response = requests.post(url, headers=self.supabase_headers, json=data)
            
            if response.status_code == 201:
                logger.info("Successfully sent analysis to Supabase")
                return response.json()
            else:
                logger.error(f"Error sending to Supabase: {response.status_code} - {response.text}")
                return {'error': response.text}
                
        except Exception as e:
            logger.error(f"Error sending to Supabase: {e}")
            return {'error': str(e)}
    
    def get_conversation_history(self, user_id: str, conversation_id: Optional[str] = None) -> list:
        """
        Get conversation history from Supabase.
        
        Args:
            user_id: User ID
            conversation_id: Optional conversation ID
            
        Returns:
            List of conversation messages
        """
        try:
            url = f"{self.supabase_url}/rest/v1/messages"
            params = {
                'user_id': f'eq.{user_id}',
                'select': '*',
                'order': 'created_at.asc'
            }
            
            if conversation_id:
                params['conversation_id'] = f'eq.{conversation_id}'
            
            response = requests.get(url, headers=self.supabase_headers, params=params)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Error getting conversation history: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []
    
    def analyze_conversation_trends(self, messages: list) -> Dict[str, Any]:
        """
        Analyze trends in conversation history.
        
        Args:
            messages: List of conversation messages
            
        Returns:
            Conversation trend analysis
        """
        if not messages:
            return {}
        
        sentiments = []
        emotions = []
        confidences = []
        
        for message in messages:
            if message.get('sentiment'):
                sentiments.append(message['sentiment'])
            if message.get('emotion'):
                emotions.append(message['emotion'])
            if message.get('confidence'):
                confidences.append(message['confidence'])
        
        # Calculate trends
        sentiment_counts = {}
        emotion_counts = {}
        
        for sentiment in sentiments:
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
        
        for emotion in emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        return {
            'total_messages': len(messages),
            'sentiment_distribution': sentiment_counts,
            'emotion_distribution': emotion_counts,
            'avg_confidence': sum(confidences) / len(confidences) if confidences else 0,
            'dominant_sentiment': max(sentiment_counts, key=sentiment_counts.get) if sentiment_counts else 'neutral',
            'dominant_emotion': max(emotion_counts, key=emotion_counts.get) if emotion_counts else 'neutral'
        }

def main():
    """Example usage of the integration."""
    # Load environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        logger.error("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
        return
    
    # Initialize integration
    integration = SupabaseSentimentIntegration(supabase_url, supabase_key)
    
    # Example analysis
    test_texts = [
        "I'm feeling really sad and hopeless today",
        "I'm so happy and excited about the future!",
        "I'm anxious and worried about everything",
        "I want to kill myself and end it all"
    ]
    
    print("=== Enhanced Sentiment Analysis Test ===\n")
    
    for text in test_texts:
        print(f"Text: {text}")
        analysis = integration.comprehensive_analysis(text)
        print(f"Sentiment: {analysis['sentiment']} (Confidence: {analysis['confidence']:.1f}%)")
        print(f"Emotion: {analysis['emotion']}")
        print(f"Intent: {analysis['intent']}")
        print(f"Method: {analysis['method']}")
        print("-" * 50)

if __name__ == "__main__":
    main() 