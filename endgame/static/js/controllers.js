var bsControllers = angular.module('bsControllers', []);

bsControllers.controller('PowersController', ['$scope', function($scope){
	$scope.powers = [{name: 'Covering Fire'},
					 {name: 'Second Wind'}, 
					 {name: 'Leapy Stabby'},
					 {name: 'Biotic Charge'}];
}]);

bsControllers.controller('NoController', ['$scope', function($scope){}]);