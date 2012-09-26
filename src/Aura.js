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
    function $(toSelect, what){
        //cases - TODO: make it logic and faster
        if (!toSelect) {
            return new $dom();
        } else if (!what){
            if(toSelect instanceof $dom){
                return toSelect;
            } else if (typeof toSelect == 'object') { //Single object or array
                return new $dom(toSelect);
            } else {
                 what = document;
            }
        } else {
            if (typeof toSelect == 'object' && isElement(what)) { //var tmp=$("span");  $("p").find(tmp);
                if (isElement(toSelect)) {
                    if (toSelect.parentNode == what)
                        return new $dom(toSelect);
                } else {
                    var a = [];
                    for (var i = 0; i < toSelect.length; i++){
                        if (toSelect[i].parentNode == what)
                            a[a.length] = toSelect[i];
                    }
                    return new $dom(a); 
                }
            } else if (what instanceof $dom) {
                return what.find(toSelect);
            }
        }
        
        
        //ok, selector it is
		toSelect=toSelect.trim();
        if (toSelect[0] === "#" && toSelect.indexOf(" ") === -1 && toSelect.indexOf(">") === -1) {  //id selector
            if (what == document){
                return new $dom(what.getElementById(toSelect.replace("#", "")));
            } else {
        		try{
        			return new $dom(what.querySelector(toSelect));
        		} catch(e){
        		    return new $dom();
        		}
            }
                
        } else if (toSelect[0] === "<" && toSelect[toSelect.length - 1] === ">") {  //html
            var tmp = document.createElement("div");
            tmp.innerHTML = toSelect.trim();
            return new $dom(slice.call(tmp.childNodes));
            
            
        } else if(toSelect.match(/^\.[a-zA-Z0-9_-]+$/)) { //single class
            return new $dom(slice.call(document.getElementsByClassName(c.replace(".", ""))));
            
            
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
    var isFunction, isObject, isNumeric, numOnly, isElement, clone, reverse, slice = [].slice, canLoop, isArray, proxy, asap;
	
	//
    //helper functions (+ compatibility replacements)
	//
	
	//javascript helpers
    $.isArray = isArray = Array.isArray; //Array
    
    //check for a loopable object
    $.canLoop = canLoop = function(obj) {return typeof obj == 'object' && obj && typeof obj.length == 'number' }; //Loopable object
    
    $.isFunction = isFunction = function(f){
        return typeof f === "function";
    };
    
    $.isObject = isObject = function(o){
        return typeof o === "object";
    };
    //check number
    $.isNumeric = isNumeric = function(n){
		return (n - 0) == n && n.length > 0;
    };
    //numOnly
    $.numOnly = numOnly = window.numOnly ? window.numOnly : function(n){
        if (!isNumeric(n) && n && n.replace) n = n.replace(/[^0-9.-]/, "");	//force string correction
        return parseFloat(n);
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
        for(var i = 0; i<arr.length; i++){
            n[arr.length-i-1] = arr[i];
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
	$.ready = function(f){
        if (document.readyState === "complete" || document.readyState === "loaded") asap(f);
        document.addEventListener("DOMContentLoaded", f, false);
        return this;
	}
    $.asap = asap = function(f){
        //TODO make this proper and set via postMessage
        setTimeout(function(){f();},0);
    }
    
    //internal functions and caches
    var classCache
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
        else if(isObject(c)) this.c = c;
        else if(!isFunction(c)) throw "$$$ - argument is not a class";
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
            if(p){
                Object.defineProperty(this.c.prototype, n, p);
                return this;
            } else {
                return Object.getOwnPropertyDescriptor(this.c.prototype, n);
            }
        },
        properties:function(p){
            if(p){  //add properties
                var cur = this.c.prototype;
                for(var el in p) Object.defineProperty(this.c.prototype, el, p[el]);
                return this;
            } else {
                var props = Object.getOwnPropertyNames(this.c.prototype);
                var result = {};
                for(var i =0;i<props.length;i++){
                    result[props[i]] = Object.getOwnPropertyDescriptor(this.c.prototype, props[i]);
                }
                return result;
            }
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
        extend:function(obj){
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
        if(!isObject(o) || isElement(o)) throw "$$$ - argument is not a valid javascript object";
        this.length = 0;
        if(!o) return;
        if(canLoop(o)) {
            for(var i=0;i<o.length;i++) {
                if(o[i]){
                    if(!o[i].__aura) o[i].__aura={};
                    this[this.length++]=o[i];
                }
            }
        } else {
            if(!o.__aura) o.__aura={};
            this[0]=o;
        }
    }
    $object.prototype = {
        bind:function(ev, f){	//bind events to object
            var objs, obj;
            ev = Array ? ev : [ev]; //set multiple events at once
            for(var i=0;i<this.length;i++){
                objs = this[i].__aura.events;
                objs = objs || {};
    			for(var j=0; j<ev.length; j++){
                    obj = objs[ev[j]];
    				obj = obj || [];
    				obj.push(f);
    			}
            }
			return this;
        },
        unbind:function(ev, f){	//unbind events in object
            var objs, obj;
            ev = (isArray(ev) || !ev) ? ev : [ev]; //set multiple events at once
            for(var i=0;i<this.length;i++){
                objs = this[i].__aura.events;
                //clear all events
                if(!ev || !objs) {
                    objs = {};
                    continue;
                }
                //clear matches
    			for(var j=0; j<ev.length; j++){
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
            for(var i=0;i<this.length;i++) Object.defineProperty(this[i], n, p);
            return this;
        },
        properties:function(p){
            for(var i=0;i<this.length;i++) Object.defineProperties(this[i], p);
            return this;
        },
        //common methods
        get:getter,
        map:mapper
    }
    
    //single DOM object class ($)
    function $dom(e){
        this.length = 0;
        if(e && !e.nodeType && canLoop(e)) {
            for(var i=0;i<e.length;i++) this[this.length++]=e[i]; 
        } else this[0]=e;
    }
    $dom.prototype = {
        attr : function(a, v){
            if(!v){
                return this[0][a];
            } else {
                for(var i=0;i<this.length;i++) this[i][a] = v;
				return this;
            }
        },
        removeAttr : function(a){
            for(var i=0;i<this.length;i++) this[i].removeAttribute(a);
            return this;
        },
        data : function(a,v){return this.attr('data-'+a,v);},    //still 3x faster than dataset
        
        find : function(toSelect){
            //TODO - review
            if (!this[0])
                return undefined;
            return $(toSelect, this[0]);
        },
        val : function(v){
            if(v!==undefined){  //setter
                
                for(var i=0;i<this.length;i++){
                    //special select case
                    if(this[i].tagName=="SELECT"){
                        var els = this[i].find("option");   //get options
                        v = isArray(v) ? v : [v];   //
                        //set selected
                        for(var j=0;j<els.length;j++){
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
            for(var i=0;i<this.length;i++) {
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
            for(var i=0;i<this.length;i++) this[i].className = this[i].className.replace(classRE(c), " ").trim();
            return this;
        },
        toggleClass:function(cName, newClass){
            for (var i = 0; i < this.length; i++) {
                this[i].className.replace(classRE(cname), " ");
                this[i].className = (this[i].className + newClass).trim();
            }
            return this;
        },
        css: function( name, value ) {
            //setter
            if(value || typeof name == 'object') return this.style(name, value);
            //getter (computedStyle property)
            if(name) return window.getComputedStyle(this[0])[name];
            //getter (full computedStyle)
            return window.getComputedStyle(this[0]);
        },
        style: function(name, value){
            if(value) name = {name:value};
            
            if(typeof name == 'object'){    //setter
                for(var i=0; i<this.length; i++)
                    for(el in name) this[i].style[el]=name[el];
                return this;
            } else {    //getter
                return this[0].style[name];
            }
        },
        show: function() {this.css('display', '')},
        hide: function() {},
        toggle: function() {
            for(var i=0;i<this.length;i++){
                //if(this[i].style.display)
            }
        },
        
        //common methods
        get:getter,
        map:mapper
    }
})()


