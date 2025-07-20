var authApp = angular.module('authApp', []);

authApp.controller('LoginController', function($scope, $http, $window, $timeout) {
  $scope.isLoading = false;
  $scope.errorMessage = '';
  
  // Check if user is already authenticated
  $scope.checkAuthStatus = function() {
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      // Redirect to chat if already authenticated
      $window.location.href = 'index.html';
    }
  };
  
  // Guest login functionality
  $scope.guestLogin = function() {
    $scope.isLoading = true;
    $scope.errorMessage = '';
    
    // Create guest user info
    const guestUser = {
      id: 'guest_' + Date.now(),
      name: 'Guest User',
      email: 'guest@example.com',
      picture: null,
      isGuest: true
    };
    
    // Store guest info
    localStorage.setItem('userInfo', JSON.stringify(guestUser));
    localStorage.setItem('authToken', 'guest_token_' + Date.now());
    localStorage.setItem('isGuest', 'true');
    
    $timeout(function() {
      $scope.isLoading = false;
      $window.location.href = 'index.html';
    }, 1000);
  };
  
  // Handle Google OAuth response
  window.handleCredentialResponse = function(response) {
    $scope.$apply(function() {
      $scope.isLoading = true;
      $scope.errorMessage = '';
      
      // Decode the JWT token
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Create user info object
      const userInfo = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        isGuest: false
      };
      
      // Store user info and token
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('authToken', response.credential);
      localStorage.setItem('isGuest', 'false');
      
      // Send token to backend for verification (optional)
      $http.post('http://localhost:5000/verify-token', {
        token: response.credential
      }).then(function() {
        $timeout(function() {
          $scope.isLoading = false;
          $window.location.href = 'index.html';
        }, 1000);
      }).catch(function(error) {
        console.error('Token verification failed:', error);
        // Still proceed with login even if backend verification fails
        $timeout(function() {
          $scope.isLoading = false;
          $window.location.href = 'index.html';
        }, 1000);
      });
    });
  };
  
  // Initialize
  $scope.checkAuthStatus();
});

// Add logout functionality to global scope
window.logout = function() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('isGuest');
  window.location.href = 'login.html';
};

// Check authentication on page load
window.checkAuthentication = function() {
  const token = localStorage.getItem('authToken');
  const userInfo = localStorage.getItem('userInfo');
  
  if (!token || !userInfo) {
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}; 