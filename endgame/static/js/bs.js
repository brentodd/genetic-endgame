var myBS = angular.module('myBS', [
	'ngRoute',
	'bsControllers'
]);

myBS.config(['$routeProvider', function($routeProvider){
	$routeProvider.
		when('/about', {
			templateUrl: '/static/partials/about.html',
			controller: 'AboutController',
		}).
		when('/powers', {
			templateUrl: '/static/partials/powers.html',
			controller: 'PowersController',
		}).
		otherwise({
			redirectTo: '/about'
		});
}]);

