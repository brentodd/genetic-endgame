var myBS = angular.module('myBS', [
	'ngRoute',
	'bsControllers'
]);

myBS.config(['$routeProvider', function($routeProvider){
	$routeProvider.
		when('/', {
			templateUrl: '/static/partials/splash.html',
			controller: 'SplashController',
		}).
		when('/powers', {
			templateUrl: '/static/partials/powers.html',
			controller: 'PowersController',
		}).
		otherwise({
			redirectTo: '/'
		});
}]);

