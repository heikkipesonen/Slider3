function SliderEvents(){};

SliderEvents.prototype.on = function(type, method, scope, context) { 
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