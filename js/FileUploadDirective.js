var restylingApp = angular.module('restylingApp');

restylingApp.directive('fileUpload', [function() {
    return {
        scope: {
            fileUpload: "="
        },
        link: function(scope, element, attrs) {
            element.bind("change", function (event) {
                var groupData = {};
                var groupDataLength = 0;
                Papa.parse(event.target.files[0], {
                    dynamicTyping: true,
                    complete: function (csv) {
                        console.log(csv);
                        groupDataLength = csv.data.length;
                        for (var i = 1; i < csv.data.length; ++i) {
                            for (var j = 0; j < csv.data[0].length; ++j) {
                                var key = csv.data[0][j];
                                if (groupData[key]) {
                                    groupData[key].push(csv.data[i][j]);
                                }
                                else {
                                    groupData[key] = [csv.data[i][j]];
                                }
                            }
                        }
                        console.log(groupData);
                        scope.$apply(function() {
                            scope.$parent.loadedGroupData = groupData;
                            scope.$parent.loadedGroupDataLength = groupDataLength;
                        });
                    }
                });
            });
        }
    }
}]);