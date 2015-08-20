angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.ShowMenuIcon = false;

    $scope.$on("InView", function() {
        $scope.ShowMenuIcon = true;
    })

    $scope.$on("NotInView", function() {
        $scope.ShowMenuIcon = false;
    })

    $scope.GotoPhoto = function() {
        $state.go('app.photo');
    }
})

.controller('PhotoCtrl', ['$scope', '$ionicLoading', '$state', '$http', 'socketService',
    function($scope, $ionicLoading, $state, $http, sock) {
        $scope.$emit("NotInView");
        $scope.ShowCamera = true;
        sock.openSocket();
        $scope.PicUpload = function() {
            $scope.ShowCamera = false;
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            navigator.camera.getPicture($scope.Upload, $scope.onFail, {
                quality: 20,
                cameraDirection: navigator.camera.Direction.FRONT,
                destinationType: navigator.camera.DestinationType.FILE_URI
            });
        }
        $scope.dummy = function() {}
        $scope.alertDismissed = function(data) {
            if (data == "done") {
                $state.go('app.view');
            } else if (data == "Fail") {
                navigator.notification.alert(
                    'There was an error in processing the image, Pls try again.', // message
                    $scope.dummy, // callback
                    'Try Again', // title
                    'Done' // buttonName
                );
            }
        }
        $scope.Upload = function(fileURL) {
            sock.setupSocketEvents();
            var win = function(r) {
                $scope.alertDismissed(r);
                console.log("Code = " + r.responseCode);
                console.log("Response = " + r.response);
                console.log("Sent = " + r.bytesSent);
                $http.get(sock.server + "/runpy?id=" + sock.Id).success($scope.alertDismissed).error(function() {});
            }
            var fail = function(error) {
                alert("An error has occurred: Code = " + error.code);
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
                navigator.notification.alert(
                    'Check network connetin and try again.', // message
                    $scope.dummy, // callback
                    'Try Again', // title
                    'Done' // buttonName
                );
            }

            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";
            options.params = {};

            var ft = new FileTransfer();
            ft.upload(fileURL, encodeURI(sock.server + "/PostPhoto/"), win, fail, options);

        }

        $scope.onFail = function() {
            navigator.notification.alert(
                'No Upload Try again later.', // message
                $scope.alertDismissed, // callback
                'Try Again', // title
                'Done' // buttonName
            );
        }
    }
])

.controller('ViewCtrl', ['$scope','$sce','$stateParams', '$ionicLoading', 'socketService',
    function($scope,$sce, $stateParams, $ionicLoading, sock) {
        $scope.$emit("InView");
        $scope.imgSrc = sock.ImgSrc;
        $scope.$on('ImageMod', function(event, data) {
            $ionicLoading.hide();
            ref = window.open($sce.trustAsResourceUrl(data), '_system', 'location=yes');         
        });
        $scope.$on('Error', function(event, data) {
            navigator.notification.alert(
                data, // message
                $scope.dummy, // callback
                'Try Again', // title
                'Done' // buttonName
            );
            $ionicLoading.hide();
        })
    }
]);