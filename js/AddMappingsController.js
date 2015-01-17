var _ = require('underscore');

var restylingApp = angular.module('restylingApp');

restylingApp.controller('AddMappingsController', ['$scope', 'VisDataService',
    function($scope, visDataService) {
    $scope.dataFieldsSelected = [];
    $scope.attrSelected = "";
    $scope.newNominalMappingData = {};
    $scope.newLinearMappingData = [];
    $scope.visDataService = visDataService;
    $scope.data = visDataService.visData;
    $scope.selectedMarkGroup = visDataService.selectedMarkGroup;

    $scope.linearMappingAvailable = function() {
        var group = visDataService.getSelected();
        //console.log($scope.dataFieldsSelected);
        //console.log($scope.attrSelected);
        if (!$scope.attrSelected && $scope.dataFieldsSelected.length === 0) {
            return true;
        }
        else if ($scope.attrSelected
            && typeof group.attrs[$scope.attrSelected][0] === "number"
            && $scope.dataFieldsSelected.length === 0) {
            return true;
        }
        else if (!$scope.attrSelected
            && $scope.dataFieldsSelected.length > 0
            && typeof group.data[$scope.dataFieldsSelected[0]][0] === "number") {
            return true;
        }
        else if ($scope.attrSelected
            && $scope.dataFieldsSelected.length > 0
            && typeof group.attrs[$scope.attrSelected][0] === "number"
            && typeof group.data[$scope.dataFieldsSelected[0]][0] === "number") {
            return true;
        }
        return false;
    };

    $scope.attrChange = function($event, oldAttrVal, attr) {
        if ($event.keyCode === 13) { //enter key
            var group = visDataService.getSelected();
            var newAttrVal = angular.element($event.target).val();
            var inds = [];
            for (var i = 0; i < group.attrs[attr].length; ++i) {
                if (group.attrs[attr][i] === oldAttrVal) {
                    group.attrs[attr][i] = newAttrVal;
                    inds.push(i);
                }
            }
            var ids = _.map(inds, function(ind) {return group.ids[ind];});
            visDataService.updateNodes(attr, newAttrVal, ids);
        }
    };

    $scope.getRemainingFields = function() {
        if ($scope.data.length > 0)
            return _.without(_.keys(visDataService.getSelected().data), $scope.dataFieldsSelected);
        return 0;
    };

    $scope.showAddNominalMappingDialog = function() {
        return $scope.action === 'nominal'
            && $scope.dataFieldsSelected.length === 1
            && $scope.attrSelected;
    };

    $scope.removeDataField = function(ind) {
        $scope.dataFieldsSelected.splice(ind, 1);
    };

    $scope.showAddLinearMappingDialog = function() {
        return $scope.action === 'linear'
            && $scope.dataFieldsSelected.length > 0
            && $scope.attrSelected;
    };

    $scope.showChangeAttrDialog = function() {
        return $scope.dataFieldsSelected.length === 0
            && $scope.attrSelected;
    };

    $scope.allowMappingSelect = function(mappingType) {
        if (mappingType === 'linear') {
            if ($scope.linearMappingAvailable()) {
                return true;
            }
        }
        else if (mappingType === 'nominal') {
            return true;
        }
        return false;
    };

    $scope.allowAddField = function() {
        var selectedVis = visDataService.visData[visDataService.selectedMarkGroup.val];
        return $scope.dataFieldsSelected.length === 0
            || ($scope.action === 'linear'
                &&  $scope.dataFieldsSelected.length <
                     _.keys(selectedVis.data).length);
    };

    $scope.selectMappingType = function(mappingType) {
        if (mappingType === 'linear') {
            $scope.action = 'linear';
            $scope.setupNewLinearMapping();
        }
        else if (mappingType === 'nominal') {
            $scope.action = 'nominal';
            $scope.setupNewNominalMapping();
        }
        else if (mappingType === '') {
            $scope.action = undefined;
        }
    };

    $scope.setupNewLinearMapping = function() {
        console.log("Setting up new linear mapping");
        console.log($scope.dataFieldsSelected);
        $scope.newLinearMappingData =
            Array.apply(null, new Array($scope.dataFieldsSelected.length+1))
                .map(Number.prototype.valueOf,0);
    };

    $scope.setupNewNominalMapping = function() {
        $scope.newNominalMappingData = {};
    };

    $scope.addNominalMapping = function($event) {
        if ($event.keyCode === 13) {
            var group = visDataService.getSelected();
            var dataField = $scope.dataFieldsSelected[0];
            var markAttr = $scope.attrSelected;
            var nominalMap = $scope.newNominalMappingData;

            console.log(nominalMap);

            _.each(_.keys(nominalMap), function(keyVal) {
                var keyInds = [];
                var keyIds = [];
                _.each(group.data[dataField], function(val, valInd) {
                    if (val.toString() === keyVal) {
                        keyInds.push(valInd);
                        keyIds.push(group.ids[valInd]);
                    }
                });

                visDataService.updateNodes(markAttr, nominalMap[keyVal], keyIds);
            });

            // Now add the mapping to the schema
            var mapping = {
                data: dataField,
                attr: markAttr,
                type: "nominal",
                params: nominalMap
            };
            group.mappings.push(mapping);
        }
    };

    $scope.addLinearMapping = function($event) {
        if ($event.keyCode === 13) {
            var group = visDataService.getSelected();
            var dataFields = $scope.dataFieldsSelected;
            var markAttr = $scope.attrSelected;
            var coeffs = $scope.newLinearMappingData;
            _.each(coeffs, function(coeff, ind) {
                coeffs[ind] = +coeffs[ind];
            });

            var attrMin = Number.MAX_VALUE;
            _.each(group.ids, function(id, ind) {
                var attrVal = 0;
                _.each(dataFields, function(dataField, dataFieldInd) {
                    attrVal += group.data[dataField][ind] * coeffs[dataFieldInd];
                });
                // Finally add the constant
                attrVal += coeffs[coeffs.length-1];
                if (attrVal < attrMin) {
                    attrMin = attrVal;
                }
            });

            var mapping = {
                type: 'linear',
                data: $scope.dataFieldsSelected,
                attr: $scope.attrSelected,
                params: {
                    attrMin: attrMin,
                    coeffs: $scope.newLinearMappingData
                }
            };
            group.mappings.push(mapping);
            visDataService.updateDataWithLinearMapping(mapping, $scope.selectedMarkGroup.val);
        }
    };

    $scope.addDataField = function(dataField, ind) {
        console.log(dataField);
        console.log(ind);
        if ($scope.dataFieldsSelected.length === ind) {
            $scope.dataFieldsSelected.push(dataField);
        }
        else {
            $scope.dataFieldsSelected[ind] = dataField;
        }

        if ($scope.action === "linear") {
            $scope.setupNewLinearMapping();
        }
    };

    $scope.attrSelectable = function(attr) {
        var selectedVis = visDataService.getSelected();
        return !($scope.action === "linear" &&
            typeof selectedVis.attrs[attr][0] !== "number");
    };

    $scope.actionDisplayName = function(action) {
        if (action === "nominal") {
            return "categorical";
        }
        return action;
    }

}]);