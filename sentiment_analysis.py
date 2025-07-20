import nltk
from textblob import TextBlob
import re
from collections import Counter
import pandas as pd

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

from nltk.sentiment.vader import SentimentIntensityAnalyzer

class SentimentAnalyzer:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        
        # Emotional keywords for mental health context
        self.emotion_keywords = {
            'anxiety': ['anxious', 'worried', 'nervous', 'scared', 'fear', 'panic', 'stress'],
            'depression': ['sad', 'depressed', 'hopeless', 'worthless', 'empty', 'tired', 'exhausted'],
            'anger': ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'hate'],
            'happiness': ['happy', 'joy', 'excited', 'pleased', 'content', 'grateful'],
            'loneliness': ['alone', 'lonely', 'isolated', 'abandoned', 'left out'],
            'suicidal': ['suicide', 'kill myself', 'end it all', 'want to die', 'better off dead']
        }
    
    def analyze_sentiment(self, text):
        """
        Analyze sentiment using TextBlob and VADER
        Returns: dict with sentiment scores and classification
        """
        # Clean text
        cleaned_text = self.clean_text(text)
        
        # TextBlob sentiment
        blob = TextBlob(cleaned_text)
        textblob_polarity = blob.sentiment.polarity
        textblob_subjectivity = blob.sentiment.subjectivity
        
        # VADER sentiment
        vader_scores = self.analyzer.polarity_scores(cleaned_text)
        
        # Determine overall sentiment
        sentiment = self.classify_sentiment(vader_scores, textblob_polarity)
        
        # Detect emotional state
        emotion = self.detect_emotion(cleaned_text)
        
        return {
            'text': text,
            'cleaned_text': cleaned_text,
            'sentiment': sentiment,
            'emotion': emotion,
            'vader_scores': vader_scores,
            'textblob_polarity': textblob_polarity,
            'textblob_subjectivity': textblob_subjectivity,
            'confidence': self.calculate_confidence(vader_scores, textblob_polarity)
        }
    
    def clean_text(self, text):
        """Clean and preprocess text"""
        # Convert to lowercase
        text = text.lower()
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text
    
    def classify_sentiment(self, vader_scores, textblob_polarity):
        """Classify sentiment based on VADER and TextBlob scores"""
        compound = vader_scores['compound']
        
        if compound >= 0.05:
            return 'positive'
        elif compound <= -0.05:
            return 'negative'
        else:
            return 'neutral'
    
    def detect_emotion(self, text):
        """Detect emotional state based on keywords"""
        text_lower = text.lower()
        emotion_scores = {}
        
        for emotion, keywords in self.emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                emotion_scores[emotion] = score
        
        if emotion_scores:
            # Return the emotion with highest score
            return max(emotion_scores, key=emotion_scores.get)
        else:
            return 'neutral'
    
    def calculate_confidence(self, vader_scores, textblob_polarity):
        """Calculate confidence in sentiment analysis"""
        # Use absolute compound score as confidence
        confidence = abs(vader_scores['compound'])
        return min(confidence * 100, 100)  # Convert to percentage
    
    def get_sentiment_summary(self, analysis_result):
        """Get a human-readable summary of sentiment analysis"""
        sentiment = analysis_result['sentiment']
        emotion = analysis_result['emotion']
        confidence = analysis_result['confidence']
        
        summary = f"Sentiment: {sentiment.title()} (Confidence: {confidence:.1f}%)"
        if emotion != 'neutral':
            summary += f"\nDetected Emotion: {emotion.title()}"
        
        return summary
    
    def analyze_conversation_history(self, messages):
        """Analyze sentiment trends in conversation history"""
        if not messages:
            return None
        
        sentiments = []
        emotions = []
        
        for message in messages:
            if message.get('sender') == 'user':  # Only analyze user messages
                analysis = self.analyze_sentiment(message.get('text', ''))
                sentiments.append(analysis['sentiment'])
                emotions.append(analysis['emotion'])
        
        # Calculate trends
        sentiment_counts = Counter(sentiments)
        emotion_counts = Counter(emotions)
        
        return {
            'sentiment_distribution': dict(sentiment_counts),
            'emotion_distribution': dict(emotion_counts),
            'dominant_sentiment': sentiment_counts.most_common(1)[0][0] if sentiment_counts else 'neutral',
            'dominant_emotion': emotion_counts.most_common(1)[0][0] if emotion_counts else 'neutral'
        }

# Example usage and testing
if __name__ == "__main__":
    analyzer = SentimentAnalyzer()
    
    # Test cases
    test_texts = [
        "I'm feeling really sad and hopeless today",
        "I'm so happy and excited about the future!",
        "I'm anxious and worried about everything",
        "I feel neutral about this situation",
        "I want to kill myself and end it all"
    ]
    
    print("=== Sentiment Analysis Test Results ===\n")
    
    for text in test_texts:
        result = analyzer.analyze_sentiment(text)
        print(f"Text: {text}")
        print(f"Analysis: {analyzer.get_sentiment_summary(result)}")
        print(f"VADER Scores: {result['vader_scores']}")
        print("-" * 50) 