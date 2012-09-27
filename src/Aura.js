// $() - DOM Wrapper;       $.func - helper functions;
// $$() - Object Wrapper;   $$.obj - objects;
// $$() - Class Wrapper;    $$$.klass - object classes;

//the STUFF
(function(){
    "use strict"
    
    //window properties setup
    Object.defineProperties(window, {
        $:{value:$},
        $$:{value:$$},
        $$$:{value:$$$}
    });
    
    //get an id for cache, every Element
    Object.defineProperty(Element.prototype, "_auraId", {
        value:null,
        writable:true
    })
    
    //main DOM selector - very Voodoo!
    function $(toSelect, scope){
        scope = scope || window;
        //cases - TODO: make it logic and faster
        if (!toSelect) {
            return new $dom();
        } else if(toSelect instanceof $dom){
            return toSelect;
        } else if (typeof toSelect == 'object') { //Single object or array
            return new $dom(toSelect);
        }
        
        //ok, string it is
		toSelect=toSelect.trim();
        if (toSelect[0] === "#" && toSelect.indexOf(" ") === -1 && toSelect.indexOf(">") === -1) {  //id selector
            
            return new $dom(scope.document.getElementById(toSelect.replace("#", "")));
              
        } else if (toSelect[0] === "<" && toSelect[toSelect.length - 1] === ">") {  //html
            
            var tmp = document.createElement("div");
            tmp.innerHTML = toSelect.trim();
            return new $dom(tmp.children);
            
            
        } else if(toSelect.match(/^\.[a-zA-Z0-9_-]+$/)) { //single class
            
            return new $dom(document.getElementsByClassName(c.replace(".", "")));
            
        } else {    //css query selector all
            
            var e = [];
    		try{
                e = what.querySelectorAll(toSelect);
    		} catch(e){}
            return new $dom(slice.call(e));
            
        }
    }

    //Object wrapper
    function $$(o){
        //return itself or a new instance
        return o instanceof $object ? o : new $object(o);
    }
    //Class wrapper
    function $$$(c){
        //return itself or a new instance
        return c instanceof $class ? c : new $class(c);
    }
    
    //vars we will be using
    var isNumeric, isElement, clone, reverse, slice = [].slice, canLoop, proxy, asap;
	
	//
    //helper functions (+ compatibility replacements)
	//
    
    //check for a loopable object
    $.canLoop = canLoop = function(obj) {return typeof obj == 'object' && obj && typeof obj.length == 'number' }; //Loopable object
    
    $.isFunction = function(f){
        return typeof f === "function";
    };
    
    $.isObject = function(o){
        return typeof o === "object";
    };
    //check number
    $.isNumeric = isNumeric = function(n){
		return (n - 0) == n && n.length > 0;
    };
    //clone an object recursively - Note: currently does not avoid infinite loop
    $.clone = clone = function(obj) {
        if (!obj) return null;
        var n = {};
        for (var i in obj) {
            n[i] = typeof (obj[i]) == 'object' ? clone(obj[i]) : obj[i];
        }
        return n;
    };
    //reverse an array
    $.reverse = reverse = function(arr){
        var n = [];
        for(var i = arr.length-1; i>=0; i--){
            n[i+1-arr.length] = arr[i];
        }
        return n;
    };
    //proxy a method
	$.proxy = proxy = function(f, c, args){
       	return args ? 
            function(){return f.apply(c, args);} : //use provided arguments
            function(){return f.apply(c, arguments)} ;	//use scope function call arguments
	}
	//check if object is a DOM element
    $.isElement = isElement = function(o){
        return !!(o && o.nodeType == 1);
    };
    //run stuff when DOM is ready
	$.ready = function(f, scope){
        scope = scope || window;
        if (scope.document.readyState === "complete" || scope.document.readyState === "loaded") asap(f);
        scope.document.addEventListener("DOMContentLoaded", f, false);
	}
    $.asap = asap = function(f){
        //TODO make this proper and set via postMessage
        setTimeout(function(){f();},0);
    }
    
    //internal functions and caches
    var classCache;
    function classRE(name) {
        return classCache[name] ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }
    
    
    
    
    
	//
	//the main classes
	//
    
    
    //common class methods
    function getter( i ) {
        return i == null ? slice.call(this) : ( i < 0 ? this[ this.length + i ] : this[ i ] );
    }
    function mapper(f){
        for(var i=0;i<this.length;i++){
            var tmp = f.call(this[i], i, this[i]);
            if(tmp) this[i] = tmp;
        }
        return this;
    }
    function adder(e){
        
    }
    

    
    // class handler ($$$)
    function $class(c){
        if(!c) this.c = {};
        else if(typeof c == 'object') this.c = c;
        else if(!(typeof c == 'function')) throw "$$$ - argument is not a class";
        else {
            this.hasOwnConstructor = true;
            this.c=c;
        }
    }
    $class.prototype = {
        hasOwnConstructor:false,
        proto:function(p){
            if(p){  //add stuff to proto
                var cur = this.c.prototype;
                for(var el in p) if(el!="constructor") cur[el]=p[el];   //add all except constructor
                return this;
            } else {
                return this.c.prototype;
            }
        },
        setProto:function(p){   //replace proto
            this.c.prototype=p;
            if(this.hasOwnConstructor) this.c.prototype.constructor=this.c;
            return this;
        },
        
        //ECMA 5 properties support
        property:function(n, p){ 
            var ret = $$(this.c.prototype).property(n, p);
            return p ? this : ret;
        },
        properties:function(p){
            var ret = $$(this.c.prototype).properties(p);
            return p ? this : ret;
        },
        setProperties:function(p){   //replace properties
          Object.defineProperties(this.c.prototype, p); 
          return this; 
        },
        //ECMA5 create instance
        new:function(){
            var o = Object.create(this.c.prototype, this.properties());
            if(this.hasOwnConstructor) this.c.prototype.constructor.apply(o, arguments);
            return o;
        },
        
        inherit:function(c){
            c = $$$(c);
            var thisProto = this.properties();
            this.properties(c.properties());
            this.properties(thisProto);
            return this;
        },
        seed:function(obj){
            var func;
            //classify obj
            if(!isFunction(obj) && this.hasOwnConstructor) {
                var construct = this.c;
                func = $$$(function(){construct.apply(this,arguments);});
                func.setProto(obj);
            } else {
                func = $$$(obj);
            }
            //inherit
            return func.inherit(this);
        },
        
        //common methods
        get:function(){return this.c;}
    }
    
    
    //object handler ($$)
    function $object(o){
        if(!(typeof o == 'object') || isElement(o)) throw "$$$ - argument is not a valid javascript object";
        this.length = 0;
        if(o) {
            if(canLoop(o)) {
                for(var i=0;i<o.length;i++) {   //order is important here
                    if(o[i]){
                        if(!o[i].__aura) o[i].__aura={};
                        this[this.length++]=o[i];
                    }
                }
            } else {
                if(!o.__aura) o.__aura={};
                this[0]=o;
                this.length=1;
            }
        }
    }
    $object.prototype = {
        bind:function(ev, f){	//bind events to object
            var objs, obj;
            ev = Array ? ev : [ev]; //set multiple events at once
            for(var i=this.length-1;i>=0;i--){
                objs = this[i].__aura.events;
                objs = objs || {};
    			for(var j=this.length-1;j>=0;j--){
                    obj = objs[ev[j]];
    				obj = obj || [];
    				obj.push(f);
    			}
            }
			return this;
        },
        unbind:function(ev, f){	//unbind events in object
            var objs, obj;
            ev = (canLoo(ev) || !ev) ? ev : [ev]; //set multiple events at once
            for(var i=this.length-1;i>=0;i--){
                objs = this[i].__aura.events;
                //clear all events
                if(!ev || !objs) {
                    objs = {};
                    continue;
                }
                //clear matches
    			for(var j=this.length-1;j>=0;j--){
                    obj = objs[ev[j]];
                    //clear all callbacks
                    if(!f || !obj) {
                        obj = [];
                        continue;
                    }
                    //remove function f
    				for(var k=0;k<obj.length;k++) if(obj[k]==j) delete obj[k];
    			}
            }
			return this;
        },
        seal:function(){
            for(var i=this.length-1;i>=0;i--) 
                Object.seal(this[i]);
        },
        freeze:function(){
            for(var i=this.length-1;i>=0;i--) 
                Object.freeze(this[i]);
        },
		delegate:function(){	//delegate events to another object
			//TODO
			return this;
		},
		stringify:function(){	//stringify object
            if(!this[0]) return null;
			//remove aura stuff to stringify
			var tmp = this[0].__aura;
			delete this[0].__aura;
			var str = JSON.stringify(this[0]);
			this[0].__aura = tmp;
			return tmp;
		},
		querystring:function(){	//convert to http GET/POST querystring
			//TODO
		},
        property:function(n, p){  //ECMA 5 properties
            if(p){
                for(var i=this.length-1;i>=0;i--) 
                    Object.defineProperty(this[i], n, p);
                return this;
            } else {
                return Object.getOwnPropertyDescriptor(this[0], n);
            }
        },
        properties:function(p){
            if(p){  //add properties
                for(var i=this.length-1;i>=0;i--) 
                    for(var el in p) 
                        Object.defineProperty(this[i], el, p[el]);
                return this;
            } else {
                var props = Object.getOwnPropertyNames(this[0]);
                var result = {};
                for(var i=props.length-1;i>=0;i--){   //order is irrelevant for the return
                    result[props[i]] = Object.getOwnPropertyDescriptor(this[0], props[i]);
                }
                return result;
            }
        },
        //common methods
        get:getter,
        map:mapper
    }
    
    //single DOM object class ($)
    function $dom(e, scope){
        this.scope = scope;
        this.length = 0;
        if(e){
            if(!e.nodeType && canLoop(e)) {
                for(var i=0;i<e.length;i++) this[this.length++]=e[i]; //order matters
            } else {
                this[0]=e;
                this.length=1;
            }  
        }
    }
    $dom.prototype = {
        attr : function(a, v){
            if(!v){
                return this[0][a];
            } else {
                for(var i=this.length-1;i>=0;i--) this[i].setAttribute(a, v);
				return this;
            }
        },
        removeAttr : function(a){
            for(var i=this.length-1;i>=0;i--) this[i].removeAttribute(a);
            return this;
        },
        data : function(a,v){return this.attr('data-'+a,v);},    //still 3x faster than dataset
        
        find : function(toSelect){
            //TODO - review
            if (!this[0])
                return undefined;
                
            if (typeof what == 'object') { //var tmp=$("span");  $("p").find(tmp);
                if (toSelect.length == undefined) {
                    if (toSelect.parentNode == what)
                        return new $dom(toSelect);
                    else return new $dom();
                } else {
                    var a = [];
                    for (var i = 0; i < toSelect.length; i++){
                        if (toSelect[i].parentNode == what)
                            a[a.length] = toSelect[i];
                    }
                    return new $dom(a);
                }
            }
            
            //ok, selector it is
    		toSelect=toSelect.trim();
            if (toSelect[0] === "#" && toSelect.indexOf(" ") === -1 && toSelect.indexOf(">") === -1) {  //id selector
                
        		try{
        			return new $dom(this[0].querySelector(toSelect));
        		} catch(e){}
                
            } else {    //css query selector all
                
        		try{
                    return new $dom(this[0].querySelectorAll(toSelect));
        		} catch(e){}
                
            }
            return new $dom();
        },
        val : function(v){
            if(v!==undefined){  //setter
                
                for(var i=this.length-1;i>=0;i--){
                    //special select case
                    if(this[i].tagName=="SELECT"){
                        var els = this[i].find("option");   //get options
                        v = canLoop(v) ? v : [v];   //
                        //set selected
                        for(var i=els.length-1;i>=0;i--){
                            els[j].selected = v.indexOf(els[j].value)!=-1;
                        }
                    } else this[i].value = v;
                }
                return this;
                
            } else if(this[0]){ //getter
                
                if(this[0].tagName=="SELECT"){
                    //special select case
                    //TODO improve to ignore disabled optgroups
                    return this.find('option[selected]:not([disabled])').val();
                } else if (this.length>1){
                    //array case
                    var values = [];
                    for(var i=0;i<this.length;i++){
                        //special select case
                        values.push(this[i].value);
                    }
                    return values;
                } else {
                    //single value
                    return this[0].value;
                }
                
            } else return null;
        },
        //TODO s
        addClass:function(c){
            for(var i=this.length-1;i>=0;i--) {
                var cName = this[i].className;
                if(!classRE(c).test(this[i].className)) {
                    this[i].className = cName ? cName+' '+c.trim() : c.trim();
                }
                    
            } 
        },
        hasClass:function(c){
            return this.length>0 ? classRE(c).test(this[0].className) : false;
        },
        removeClass:function(c){
            for(var i=this.length-1;i>=0;i--) this[i].className = this[i].className.replace(classRE(c), " ").trim();
            return this;
        },
        toggleClass:function(cName, newClass){
            for (var i=this.length-1;i>=0;i--) {
                this[i].className.replace(classRE(cname), " ");
                this[i].className = (this[i].className + newClass).trim();
            }
            return this;
        },
        css: function( name, value ) {
            //setter
            if(value || typeof name == 'object') return this.style(name, value);
            //getter (computedStyle property)
            if(name) return this.scope.getComputedStyle(this[0])[name];
            //getter (full computedStyle)
            return this.scope.getComputedStyle(this[0]);
        },
        style: function(name, value){
            if(value) name = {name:value};
            
            if(typeof name == 'object'){    //setter
                for(var i=this.length-1;i>=0;i--)
                    for(el in name) this[i].style[el]=name[el];
                return this;
            } else {    //getter
                return this[0].style[name];
            }
        },
        show: function() {this.css('display', '')},
        hide: function() {},
        toggle: function() {
            for(var i=this.length-1;i>=0;i--){
                //if(this[i].style.display)
            }
        },
        
        //common methods
        get:getter,
        map:mapper
    }
})()


