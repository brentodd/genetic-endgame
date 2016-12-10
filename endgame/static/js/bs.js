var myBS = angular.module('myBS', [
	'ngRoute',
	'bsControllers'
]);

myBS.config(['$routeProvider', function($routeProvider){
	$routeProvider.
		when('/', {
			templateUrl: '/static/partials/index.html',
			controller: 'NoController',
		}).
		when('/about', {
			templateUrl: '/static/partials/about.html',
			controller: 'NoController',
		}).
		when('/powers', {
			templateUrl: '/static/partials/powers.html',
			controller: 'PowersController',
		}).
		otherwise({
			redirectTo: '/'
		});
}]);

