var _ = require('underscore');

var restylingApp = angular.module('restylingApp');

restylingApp.controller('AddTableController', ['$scope', 'VisDataService',
    function($scope, visDataService) {
        window.dataScope = $scope;
        window.visDataService = visDataService;
        $scope.data = visDataService.visData;
        $scope.ids = visDataService.ids;

        $scope.createMarks = function(groupID) {
            var group = $scope.data[groupID];

            var newIds = [];
            var maxId = _.max($scope.ids);
            var dataSize = group.data[_.keys(group.data)[0]].length;
            for (var i = 1; i < dataSize+1; ++i) {
                newIds.push(maxId + i);
            }

            var createMarksMessage = {
                type: "create",
                ids: newIds
            };
            visDataService.sendMessage(createMarksMessage);
        };

        $scope.addCSVDataTable = function() {
            if (!$scope.loadedGroupData) {
                return false;
            }

            var newGroupData = _.extend({}, $scope.loadedGroupData);

            var newGroup = {
                data: newGroupData,
                attrs: null,
                ids: null,
                nodeAttrs: null,
                numNodes: $scope.loadedGroupDataLength,
                schema: _.keys(newGroupData)
            };

            visDataService.visData.push(newGroup);
            console.log(newGroup);
        };

        $scope.leftOuterJoinCSV = function(key) {
            if (!$scope.loadedGroupData) {
                return false;
            }

            var leftData = visDataService.getSelected().data;
            var rightData = $scope.loadedGroupData;
            var leftLength = leftData[_.keys(leftData)[0]].length;
            var rightLength = $scope.loadedGroupDataLength;

            for (var row = 0; row < leftLength; ++row) {
                var foundMatchingKey = false;
                for (var rightRow = 0; rightRow < rightLength; ++rightRow) {
                    if (leftData[key][row] === rightData[key][rightRow]) {
                        foundMatchingKey = true;
                        _.each(_.keys(rightData), function(dataField) {
                            if (dataField !== key) {
                                if (leftData[dataField]) {
                                    leftData[dataField].push(rightData[dataField][rightRow]);
                                }
                                else {
                                    leftData[dataField] = [rightData[dataField][rightRow]];
                                }
                            }
                        });
                        break;
                    }
                }

                if (!foundMatchingKey) {
                    _.each(_.keys(rightData), function(dataField) {
                        if (dataField !== key) {
                            if (leftData[dataField]) {
                                leftData[dataField].push(null);
                            }
                            else {
                                leftData[dataField] = [null];
                            }
                        }
                    });
                }
            }
            console.log(leftData);
            visDataService.getSelected().group = _.keys(leftData);
        };
    }
]);