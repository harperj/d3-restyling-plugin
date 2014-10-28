var angular = require('angular');

require('decon-plugin');

var restylingApp = angular.module('restylingApp', ['deconApp']);

require('./AddMappingsController');
require('./AddTableController');
require('./MappingsListController');