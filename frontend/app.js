var app = angular.module('chatApp', []);

app.controller('ChatController', function($scope, $http, $timeout, $window) {
  // Initialize user info from localStorage
  $scope.userInfo = null;
  $scope.messages = [
    {text: "Hello! I'm here to support you. How are you feeling today?", sender: "bot"}
  ];
  $scope.userInput = "";
  $scope.sentimentInfo = null;
  $scope.conversationTrend = null;
  $scope.isTyping = false;
  
  // Load user information
  $scope.loadUserInfo = function() {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      $scope.userInfo = JSON.parse(userInfoStr);
      
      // Personalize welcome message based on user
      if ($scope.userInfo && !$scope.userInfo.isGuest) {
        $scope.messages[0] = {
          text: `Hello ${$scope.userInfo.name}! I'm here to support you. How are you feeling today?`,
          sender: "bot"
        };
      }
    }
  };
  
  // Logout function
  $scope.logout = function() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isGuest');
    $window.location.href = 'login.html';
  };

  $scope.sendMessage = function() {
    if (!$scope.userInput || $scope.isTyping) return;
    
    // Add user message
    $scope.messages.push({text: $scope.userInput, sender: "user"});
    var userMessage = $scope.userInput;
    $scope.userInput = "";
    
    // Show typing indicator
    $scope.isTyping = true;
    $scope.messages.push({text: "", sender: "typing"});

    $http.post('http://localhost:5000/chat', {message: userMessage})
      .then(function(response) {
        $timeout(function() {
          // Remove typing indicator
          $scope.messages.pop();
          $scope.isTyping = false;
          
          // Add bot response with delay for natural feel
          $timeout(function() {
            $scope.messages.push({text: response.data.response, sender: "bot"});
            
            // Update sentiment information
            $scope.sentimentInfo = {
              sentiment: response.data.sentiment,
              emotion: response.data.emotion,
              confidence: response.data.confidence,
              intent: response.data.intent
            };
            
            // Update conversation trend
            if (response.data.conversation_trend) {
              $scope.conversationTrend = response.data.conversation_trend;
            }
            
            // Scroll to bottom
            $timeout(function() {
              var chatDiv = document.getElementById('chat-messages');
              chatDiv.scrollTop = chatDiv.scrollHeight;
            }, 100);
          }, 800); // Delay for natural conversation flow
        }, 300);
      }, function() {
        // Remove typing indicator on error
        $scope.messages.pop();
        $scope.isTyping = false;
        $scope.messages.push({text: "Sorry, there was an error connecting to the server.", sender: "bot"});
      });
  };

  $scope.getSentimentColor = function(sentiment) {
    switch(sentiment) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      case 'neutral': return '#6b7280';
      default: return '#6b7280';
    }
  };

  $scope.getEmotionIcon = function(emotion) {
    switch(emotion) {
      case 'anxiety': return '😰';
      case 'depression': return '😔';
      case 'anger': return '😠';
      case 'happiness': return '😊';
      case 'loneliness': return '😢';
      case 'suicidal': return '⚠️';
      default: return '😐';
    }
  };

  // Handle Enter key
  $scope.handleKeyPress = function(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      $scope.sendMessage();
    }
  };

  // Auto-focus input on load
  $timeout(function() {
    var input = document.querySelector('.chat-input input');
    if (input) input.focus();
  }, 500);
  
  // Initialize user info
  $scope.loadUserInfo();
});
