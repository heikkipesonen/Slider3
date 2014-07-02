/*
function SliderEvents(){};

SliderEvents.prototype.on = function(type, method, scope, context) {

    if (typeof(type) === 'object'){
        for (var i in type){
            this.on(i, type[i],scope ? scope : this, context ? context : this);
        }
    } else {
        var listeners, handlers, scope;

        if (!(listeners = this.__listeners)) {
            listeners = this.__listeners = {};
        }
        if (!(handlers = listeners[type])){
            handlers = listeners[type] = [];
        }

        scope = (scope ? scope : window);
        handlers.push({
            method: method,
            scope: scope,
            context: (context ? context : scope)
        });
    }
};

SliderEvents.prototype.fire = function(type, data, context) {
    var listeners, handlers, i, n, handler, scope;
    if (!(listeners = this.__listeners)) {
        return;
    }
   
    handlers = listeners[type];
    if (!handlers){
        return;
    }

    for (i = 0, n = handlers.length; i < n; i++){
        handler = handlers[i];

        if (typeof(context)!=="undefined"){
            if (handler.method.call(
                context, data, this, type
            )===false) {
                return false;
            }
        }
    }
    return true;
};
*/
function Events(){};

Events.prototype = {
    on:function(listeners){
        if (!this._listeners) this._listeners = {};
        for (var i in listeners){
            if (!this._listeners[i]) this._listeners[i] = [];
            this._listeners[i].push( listeners[i] );
        }
    },
    fire:function(evt, data, ctx){
        if (!this._listeners) this._listeners = {};
        if (this._listeners[evt]){
            for (var i in this._listeners[evt]){
                this._listeners[evt][i].call(ctx || this, data)
            }
        }
    },
}