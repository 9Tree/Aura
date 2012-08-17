//1,2,3 - Diga la outra vez!
var $, $$, $$$;
//the STUFF
(function(){
    "use strict"
    
    //declarations
    $ = selector;
    $$ = function(o){return new $object(o);}
    $$$ = function(c){return new $class(c);}
    
    //vars we will be using
    var isFunction, isObject, isElement, clone, reverse, slice = [].slice, isArray;
    
    //helper functions
    $$.isArray = isArray = Array.isArray;
    $$.clone = isFunction = function(f){
        return typeof f === "function";
    };
    $$.isObject = isObject = function(o){
        return typeof o === "object";
    };
    $.isElement = isElement = function(o){
        return o instanceof HTMLElement;
    };
    $$.clone = clone = function(obj) {
        if (!obj) return null;
        var n = {};
        for (var i in obj) {
            n[i] = typeof (obj[i]) == 'object' ? clone(obj[i]) : obj[i];
        }
        return n;
    };
    $$.reverse = reverse = function(arr){
        var n = [];
        for(var i = 0; i<arr.length; i++){
            n[arr.length-i-1] = arr[i];
        }
        return n;
    };
    
    
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
            if(func) $$$(func).addPrototype(proto);
            func.prototype.constructor = func;
            return new $class(func);
        },
        get:function(){return this.c;}
    }
    
    
    //object handler ($$) - TODO - implement methods
    function $object(o){
        if(!isObject(o) || isElement(o)) throw "$$$ - argument is not a valid javascript object";
        this.o = o;
    }
    $object.prototype = {
        bind:function(){
            
        },
        unbind:function(){
            
        }
    }
    
    //single DOM object class ($)
    function $dom(e){
        this.i=0;
        if(e && !e.length){
            this[0] = e;
            this.length=1;
        } else this.length=0;
    }
    var domP = {
        find : function(toSelect){
            //TODO - review
            if (!this[this.i])
                return undefined;
            return $(toSelect, this[i]);
        },
        get : function(index){
            return this[index?index:this.i];
        }
    }
    $dom.prototype = domP;


    
    //multiple DOM object ($) - Voodoo stuff
    function $doms(objs){
        this.length = 0;
        this.i=0;
        for (var i = 0; i < objs.length; i++)
            this[this.length++] = objs[i];
    }
    //proxy all $dom methods for multiple elements
    var f = function(p){
        return function(){
            for(var j = 0; j<this.length; j++){
                this.i = j;
                p.apply(this, arguments);
            }
            this.i = 0;
            return this;
        }
    }
    for(var n in domP) {
        $doms.prototype[n] = f(domP[n]);
    }
    //except get
    $doms.prototype.get = domP.get;
    
    
    //main selector - very Voodoo!
    function selector(toSelect, what){
        //cases - TODO: make it faster
        if (!toSelect) {
            return new $dom();
        } else if ((toSelect instanceof $dom || toSelect instanceof $doms) && what == undefined) {
            return toSelect;
        } else if (isArray(toSelect) && toSelect.length != undefined) { //Passing in an array or object
            return toSelect.length>1 ? new $doms(toSelect) : new $dom(toSelect);
        } else if (isObject(toSelect) && isObject(what)) { //var tmp=$("span");  $("p").find(tmp);
            if (toSelect.length == undefined) {
                if (toSelect.parentNode == what)
                    return new $dom(toSelect);
            } else {
                var a = [];
                for (var i = 0; i < toSelect.length; i++){
                    if (toSelect[i].parentNode == what)
                        a[a.length] = toSelect[i];
                }
                return new $doms(a); 
            }
            return new $dom();
        } else if ($.isObject(toSelect) && what == undefined) { //Single object
            return new $dom(toSelect);
        } else if (what !== undefined) {
            if ((what instanceof $dom || what instanceof $doms)) {
                return what.find(toSelect);
            }
        } else {
            what = document;
        }
        
        
        //ok, selector it is
		toSelect=toSelect.trim();
        if (toSelect[0] === "#" && toSelect.indexOf(" ") === -1 && toSelect.indexOf(">") === -1) {  //id selector
            if (what == document){
                return new $dom(what.getElementById(toSelect.replace("#", "")));
            } else {
        		try{
        			return new $(what.querySelector(toSelect));
        		} catch(e){
        			return new $dom();
        		}
            }
                
        } else if (toSelect[0] === "<" && toSelect[toSelect.length - 1] === ">") {  //html
            var tmp = document.createElement("div");
            tmp.innerHTML = toSelect.trim();
            return $(reverse(slice.call(tmp.childNodes)));
            
            
        } else {    //css query selector all
    		try{
    			return new $(reverse(slice.call(what.querySelectorAll(toSelect))));
    		} catch(e){
    			return new $dom();
    		}
        }
    }
})()
