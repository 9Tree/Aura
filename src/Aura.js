// $$() - Object / Class Wrapper;

//the STUFF
var $$ = (function(){
    "use strict";
    
    //get an id for cache, every Object
    Object.defineProperty(Object.prototype, "__aura", {
        value:undefined,
        writable:true
    });

    //Object wrapper
    function $$(o){
        //return itself or a new instance
        var type = typeof o;
        if(o && (type == 'object' || type == 'function')){
            return o instanceof $object ? o : new $object(o);
        }
        
        throw new Error("$$ - argument is not a valid javascript object or function");
    }
    
	//
	//the main class
	//
    function instanceAura(){
        if(!o.__aura) {
            o.__aura={
                events:{}
            }
        }
    }

    //object handler ($$)
    var objectCache={};
    function $object(o){
        this.obj = o;
    }
    $object.prototype = {
        //ECMA5 create instance
        copy:function(deep){
			if(!deep) return this.clone();
            
            //TODO - deep object copy
            var props = this.properties(), i;
            for()
        },
        clone:function(p){
			var aura = this.obj.__aura, o;
			this.obj.__aura=undefined;
            o = Object.create(this.obj, p);
			this.obj.__aura=aura;
            return $$(o);
        }
        //ECMA5 inherit properties
        inherit:function(c){
            var aura = this.obj.__aura;
            this.obj.__aura=undefine;
            this.propertize($$(c).clone(this.properties()));
            this.obj.__aura=aura;
            return this;
        },
        //ECMA5 seed properties
        seed:function(o){
            $$(o).inherit(c);
            return this;
        },
        bind:function(ev, f){	//bind events to object
            instanceAura(this.obj);
            var objs = this.obj.__aura.events, obj, i;
            
            ev = Array.isArray(ev) ? ev : [ev]; //set multiple events at once
            
			for(i=ev.length-1;i>=0;i--){
                obj = objs[ev[i]];
				obj = obj || [];
				obj.push(f);
			}
			return this;
        },
        unbind:function(ev, f){	//unbind events in object
            instanceAura(this.obj);
            var objs = this.obj.__aura.events, obj, i, j;
            
            //clear all events
            if(!ev) {
                this.obj.__aura.events = {};
                return;
            }
            
            ev = Array.isArray(ev) ? ev : [ev]; //set multiple events at once
            
            //clear matches
			for(i=ev.length-1;i>=0;i--){
                obj = objs[ev[i]];
                
                //clear all callbacks
                if(!f || !obj) {
                    objs[ev[i]] = null;
                    continue;
                }
                
                //remove function f
				for(j=obj.length-1;j>=0;j--) if(obj[j]==f) delete obj[k];
			}
            
			return this;
        },
        trigger:function(ev, args){
            instanceAura(this.obj);
            var objs = this.obj.__aura.events, obj, i, j;
            
            ev = Array.isArray(ev) ? ev : [ev]; //set multiple events at once
            
            //clear matches - loops orders are relevant
			for(i=0;i<ev.length;i++){
                obj = objs[ev[i]];
                
                //clear all callbacks
                if(!obj) {
                    continue;
                }
                
                //fire function f
				for(j=0;j<obj.length;j++) obj[k].apply(this, args);
			}
            
			return this;
        },
        seal:function(){
            Object.seal(this.obj);
        },
        freeze:function(){
            instanceAura(this.obj); //otherwise events can not work after freeze
            Object.freeze(this.obj); 
        },
		delegate:function(){	//delegate events to another object
			//TODO
			return this;
		},
		stringify:function(){	//stringify object FIXME
            if(!this.obj) return null;
			//remove aura stuff to stringify
			var aura = this.obj.__aura;
			this.obj.__aura=undefined;
			var str = JSON.stringify(this.obj);
			this.obj.__aura=aura;
			return str;
		},
		querystring:function(urlEncode){	//convert to http GET/POST querystring
			//TODO
		},
        property:function(n, p){  //ECMA 5 properties
            if(p){
                Object.defineProperty(this.obj, n, p);
                return this;
            } else {
                return Object.getOwnPropertyDescriptor(this.obj, n);
            }
        },
        properties:function(p){
            if(p){  //add properties
                for(var el in p) 
                    Object.defineProperty(this.obj, el, p[el]);
                return this;
            } else {
                var props = Object.getOwnPropertyNames(this.obj);
                var result = {};
                for(var i=props.length-1;i>=0;i--){   //order is irrelevant for the return
                    result[props[i]] = Object.getOwnPropertyDescriptor(this.obj, props[i]);
                }
                return result;
            }
        },
        propertize:function(p){   //replace properties
          Object.defineProperties(this.obj, p); 
          return this; 
        },
        get:function() {
            return this.obj;
        }
        
        //function only methods
    }
    
    
})();

if(window){
    //window properties setup
    Object.defineProperties(window, {
        $$:{value:$$}
    });
    //delete from current scope
    delete $$;
}
