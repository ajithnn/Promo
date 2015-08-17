angular.module('starter.services', [])

.service('socketService', ['$rootScope',
    function($rootScope) {
        this.socket;
        this.server = "http://gentle-castle-7593.herokuapp.com";
        this.Id;
        this.ImgSrc = "";
        this.openSocket = function() {
            this.socket = io(this.server);
            var that = this;
            this.socket.on('connect', function() {
                that.Id = that.socket.io.engine.id;
            });
        }
        this.setupSocketEvents = function() {
            var that = this;
            this.socket.on('OpenUrl', function(data) {
                that.ImgSrc = that.server + data;
                $rootScope.$broadcast("ImageMod",data);
            });
            this.socket.on('Error', function(data) {
                $rootScope.$broadcast("Error",data);
            });
        }
    }
]);
