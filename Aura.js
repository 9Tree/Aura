//DOM Wrapper, Object Wrapper, Class Wrapper
var $, $$, $$$;

//the STUFF
(function(){
    "use strict"
    
    //declarations
    $ = selector;
    $$ = function(o){
        //return itself or a new instance
        return o && o instanceof $object ? o : new $object(o);
    }
    $$$ = function(c){
        //return itself or a new instance
        return c && c instanceof $class ? c : new $class(c);
    }
    
    //vars we will be using
    var isFunction, isObject, isNumeric, numOnly, isElement, clone, reverse, slice = [].slice, isArray, proxy;
    
	
	//
    //helper functions (+ compatibility replacements)
	//
	
	//javascript helpers
    $$.isArray = isArray = Array.isArray ? Array.isArray : function(){function(obj) {return obj && obj instanceof Array};
	
    $$.isFunction = isFunction = function(f){
        return typeof f === "function";
    };
    $$.isObject = isObject = function(o){
        return typeof o === "object";
    };
    $$.isNumeric = isNumeric = function(n){
        //return !isNaN(parseFloat(n)) && isFinite(n);
		return (n - 0) == n && n.length > 0;
    };
    $$.numOnly = numOnly = window.numOnly ? window.numOnly : function(n){
        if (!isNumeric(n) && n && n.replace) n = n.replace(/[^0-9.-]/, "");	//force string correction
        return parseFloat(n);
    };
    //clone an object recursively - Note: currently does not avoid infinite loop
    $$.clone = clone = function(obj) {
        if (!obj) return null;
        var n = {};
        for (var i in obj) {
            n[i] = typeof (obj[i]) == 'object' ? clone(obj[i]) : obj[i];
        }
        return n;
    };
    //reverse an array
    $$.reverse = reverse = function(arr){
        var n = [];
        for(var i = 0; i<arr.length; i++){
            n[arr.length-i-1] = arr[i];
        }
        return n;
    };
    //proxy a method
	$$.proxy = proxy = function(f, c, args){
       	return args ? 
            function(){return f.apply(c, args);} : //use provided arguments
            function(){return f.apply(c, arguments)} ;	//use scope function call arguments
	}
	
	
	//DOM related helpers
    $.isElement = isElement = function(o){
        return !!(obj && obj.nodeType == 1);
    };
	$.ready = function(f){
        if (document.readyState === "complete" || document.readyState === "loaded")
            f();
        document.addEventListener("DOMContentLoaded", f, false);
        return this;
	}
    
	
	
	
	
	//
	//the classes
	//
	
	
    
    // class handler ($$$)
    function $class(c){
        if(!c) this.c = function(){};
        else if(isObject(c)) this.c = $$(c).getClass();
        else if(!isFunction(c)) throw "$$$ - argument is not a class";
        else this.c=c;
    }
    $class.prototype = {
        setPrototype:function(p){
            this.c.prototype=p;
            this.c.prototype.constructor=this.c;
        },
        addPrototype:function(proto){
            var cur = this.c.prototype;
            for(var el in proto) cur[el]=proto[el];
            cur.constructor=this.c;
        },
        getPrototype:function(p){return this.c.prototype;},
        addProperty:function(n,m){
            this.c.prototype[n]=m;
        },
        extend:function(obj){
            var func, proto;
            //classify p
            if(!isFunction(obj)) {
                var construct = this.c;
                func = function(){construct.apply(this,arguments);};
                proto = obj;
            } else {
                func = obj;
                proto = obj.prototype;
            }
            proto.constructor = null;
            //inherit
            var thisProto = this.c.prototype;
            function n() {};
            n.prototype = thisProto;
            func.prototype = new n();
            func.prototype.constructor = func;
            var c = new $class(func);
            if(proto) c.addPrototype(proto);
            return c;
        },
        get:function(){return this.c;}
    }
    
    
    //object handler ($$)
    function $object(o){
        if(!isObject(o) || isElement(o)) throw "$$$ - argument is not a valid javascript object";
        this.length = 0;
        if(isArray(o)) {
            for(var i=0;i<o.length;i++) {
                if(!o[i].__aura) o[i].__aura={};
                this[this.length++]=o[i];
            }
        } else {
            if(!o.__aura) o.__aura={};
            this[0]=o;
        }
    }
    $object.prototype = {
        bind:function(ev, f){	//bind events to object
            var objs, obj;
            ev = $.isArray(ev) ? ev : [ev]; //set multiple events at once
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
            ev = ($.isArray(ev) || !ev) ? ev : [ev]; //set multiple events at once
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
			//remove aura stuff to stringify
			var tmp = this[0].__aura;
			delete this[0].__aura;
			var str = JSON.stringify(this[0]);
			this[0].__aura = tmp;
			return tmp;
		},
		querystring:function(){	//convert to http GET/POST querystring
			//TODO
		}
    }
    
    //single DOM object class ($)
    function $dom(e){
        this.length = 0;
        if(isArray(e)) {
            for(var i=0;i<e.length;i++) this[this.length++]=e[i]; 
        } else this[0]=e;
    }
    $dom.prototype = {
        attr : function(a, v){
            if(!v){
                return this[0].getAttribute(a);
            } else {
                for(var i=0;i<this.length;i++) this[i].setAttribute(a, v);
				return this;
            }
        },
        data : function(a,v){return this.attr('data-'+a,v);},    //still 3x faster than dataset
        
        find : function(toSelect){
            //TODO - review
            if (!this[0])
                return undefined;
            return $(toSelect, this[i]);
        },
        get : function(index){
            return this[index?index:0];
        }
    }

    
    
    //main selector - very Voodoo!
    function selector(toSelect, what){
        //cases - TODO: make it logic and faster
        var noWhat = what == undefined;
        if (!toSelect) {
            return new $dom();
        } else if (toSelect instanceof $dom && noWhat) {
            return toSelect;
        } else if (isArray(toSelect)) { //Passing in an array
            return new $dom(toSelect);
        } else if (isObject(toSelect) && isElement(what)) { //var tmp=$("span");  $("p").find(tmp);
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
        } else if ($.isObject(toSelect) && noWhat) { //Single object
            return new $dom(toSelect);
        } else if (noWhat) {
            what = document;
        } else if (what instanceof $dom) {
            return what.find(toSelect);
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
            return new $dom(reverse(slice.call(tmp.childNodes)));
            
            
        } else if(toSelect.match(/^\.[a-zA-Z0-9_-]+$/)) { //single class
            return new $dom(reverse(slice.call(document.getElementsByClassName(c.replace(".", "")))));
            
            
        } else {    //css query selector all
            var e = [];
    		try{
                e = what.querySelectorAll(toSelect);
    		} catch(e){}
            return new $dom(reverse(slice.call(e)));
        }
    }
})()
