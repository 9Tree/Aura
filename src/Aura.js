// $$() - Object / Class Wrapper;

//not strict, but allows voodoo namespace compatibility
var oldAura$$ = typeof $$ != "undefined" ? $$ : undefined;

AuraNamespace = typeof AuraNamespace == "string" ? AuraNamespace : "$$";
AuraScope = typeof AuraScope == "object" && AuraScope ? AuraScope : window;

//Actual Aura code
$$ = (function(){
    //"use strict";
    
    //get an id for cache, every Object
    

    //Object wrapper
    function $$(o){
        //return itself or a new instance
        var type = typeof o;
        //parse json objects
        if(type == 'string'){
            try{
                o = JSON.parse(o);
            } catch(e){}
            type = typeof o;
        }
        //return object
        if(o && (type == 'object' || type == 'function')){
            return o instanceof $object ? o : new $object(o);
        }
        
        return $object(null); //parent prototype
    }
    
	//
	//the main class
	//

    //object handler ($$)
    var objectCache={};
    function $object(o){
        this.obj = o;
    }
    
    function normalise_options(props){
        if(!props || typeof props != "object") return;
        
        var names = Object.keys(props), i=names.length, prop;
        while(i--){
            prop = props[names[i]];
            
            props[names[i]] = normalise_option(prop);
        }
    }
    function normalise_option(prop){
        if( !prop || typeof prop != "object" ||
            typeof prop.value == "undefined" && typeof prop.get == "undefined" && typeof prop.set == "undefined"
            ){

            //doesn't look like a valid property descriptor
            //let's set it like a default
            return {
                value : prop,
                configurable:true,
                writable:true,
                enumarable:true
            }
        }
        return prop;
    }
    
    //$$ wrapper prototype
    $object.prototype = {
        
        // ES5 PROPERTIES //
        
        //ES5 property
        property:function(n, p){  
            if(p){
                p=normalise_option(p);
                Object.defineProperty(this.obj, n, p);
                return this;
            } else {
                return Object.getOwnPropertyDescriptor(this.obj, n);
            }
        },
        //ES5 properties
        properties:function(p){
            var i;
            if(p){  //add properties
                normalise_options(p);
                for(i in p) 
                    Object.defineProperty(this.obj, i, p[i]);
                return this;
            } else {
                var props = Object.getOwnPropertyNames(this.obj);
                var result = {};
                for(i=0;i<props.length;i++){   //order may be relevant
                    result[props[i]] = Object.getOwnPropertyDescriptor(this.obj, props[i]);
                }
                return result;
            }
        },
        //ES5 replace properties
        propertize:function(p){   
            normalise_options(p);
            Object.defineProperties(this.obj, p); 
            return this; 
        },
        
        
        
        // ES5 INHERITANCE //
        
        //ES5 shallow clone
        replica:function(extraProps){
			var props;
            normalise_options(extraProps);
            
            //object with same prototype and clone own properties
            //deep copy own properties
            var names = Object.getOwnPropertyNames(this.obj), el, type;
            props = {};
            for(i=0;i<names.length;i++){   //order may be relevant
                //ignore properties that will be overriden
                if(!extraProps || !extraProps[names[i]]){
                    props[names[i]] = Object.getOwnPropertyDescriptor(this.obj, names[i]);
                }
            }
            
            $$(props).absorb(extraProps);
            
            return Object.create(Object.getPrototypeOf(this.obj), props); 
        },
        //ES5 deep clone
        deep_replica:function(extraProps){
			var props;
            normalise_options(extraProps);
                        
            //object with same prototype and clone own properties
            //deep copy own properties
            var names = Object.getOwnPropertyNames(this.obj), el, type;
            props = {};
            for(i=0;i<names.length;i++){   //order may be relevant
                //ignore properties that will be overriden
                if(!extraProps || !extraProps[names[i]]){
                    el = Object.getOwnPropertyDescriptor(this.obj, names[i]);
                    //if it is an object, clone its contents
                    type = typeof el.value;
                    if(el.value && (type=="object" || type=="function")){
                        //WARNING - recursion
                        el.value = $$(el.value).deep_replica(); //make a deep copy
                    }
                    props[names[i]] = el;
                }
            }
            
            $$(props).absorb(extraProps);
            
            return Object.create(Object.getPrototypeOf(this.obj), props); 
        },
        
        //ES5 spawn - new instance using this object as a base prototype
        spawn: function(props){
            normalise_options(props);
            return Object.create(this.obj, props); 
        },
        
        seal:function(){
            Object.seal(this.obj);
        },
        freeze:function(){
            Object.freeze(this.obj); 
        },

        
        //toStrings
		stringify:function(){	//stringify object FIXME
            if(!this.obj) return null;
			//remove aura stuff to stringify
			hideAura(this);
			var str = JSON.stringify(this.obj);
			resetAura(this);
			return str;
		},
		querystring:function(urlEncode){	//convert to http GET/POST querystring
			//TODO
		},
        
        //getter - just in case
        get:function() {
            return this.obj;
        },
        
        //classic object merging
        absorb:function(){
            var i,el, obj;
            for(i=0;i<arguments.length;i++) {
                obj = arguments[i];
                if(!obj) continue;
                for(el in obj){
                    this.obj[el]=obj[el];
                }
            }
            return this;
        },
        deep_absorb:function(){
            var i,el, obj;
            for(i=0;i<arguments.length;i++) {
                obj = arguments[i];
                if(!obj) continue;
                for(el in obj){
                    if(obj[el] && typeof obj[el]=="object"){
                        //WARNING - recursion
                        $$(this.obj[el]).deep_absorb(obj[el]);
                    } else {
                        this.obj[el]=obj[el];
                    }
                }
            }
            return this;
        },
        collect:function(){
            var i, el, obj;
            for(i=0;i<arguments.length;i++) {
                obj = arguments[i];
                if(!obj) continue;
                for(el in obj){
                    if(typeof this.obj[el]=="undefined") this.obj[el]=obj[el];
                }
            }
            return this;
        },
        deep_collect:function(){
            var i, el, obj;
            for(i=0;i<arguments.length;i++) {
                obj = arguments[i];
                if(!obj) continue;
                for(el in obj){
                    var type = typeof this.obj[el];
                    var newType = typeof obj[el];
                    
                    if (this.obj[el] && type=="object" && obj[el] && newType=="object"){
                        //WARNING - recursion
                        $$(this.obj[el]).deep_collect(obj[el]);
                    } else if(type=="undefined") this.obj[el]=obj[el];
                    
                }
            }
            return this;
        }
        
        //function only methods
    }
    
    return $$;
})();

if(this){
    //window properties setup
    Object.defineProperty(this, AuraNamespace, {value:$$}); //attach to current global namespace
    //delete from current scope
    if(AuraNamespace!="$$") $$ = oldAura$$;
    if(AuraNamespace) AuraNamespace=undefined;
    if(AuraScope) AuraScope=undefined;
}

oldAura$$ = undefined;