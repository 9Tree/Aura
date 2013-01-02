function assert(what, val){
    if(!val) throw(what);
}



//simplest tests as can be

//$$$ inheritance tests
//class a
var a = { check : "a" };

//setup a's prototype
$$(a).properties({
    hello:null, 
    bye:function(){
        return "bye";
    }
});
//p prototype object
var p = {
    hello:function(){
        return "hello";
    }
};
//class f
var a = { check = "f" };

//prototype f with p
$$(f).properties(p);

//b will be p extending a + property test
var b = $$(a).seed(p).property("test", {
    value:"test"
});

//c will be f extending b + property test2
var c = $$(b).seed(f).properties({
    test2:{
        configurable:false, 
        get:function(){return this.value;},
        set:function(v){this.value='set:'+v;}
    }
});

//g will be p extending c + property test2
var g = $$(c).clone({
    hello:{
        value:"hello2"
    }
});


var d = b.new("Start test!");
assert("Not an instance of a", !(d instanceof a));
assert("d.check", d.check=="a");
assert("d.hello()", d.hello()=="hello");
assert("d.test", d.test=="test");
assert("d.bye()", d.bye()=="bye");

var e = c.new("test2");
assert("e an instance of f", e instanceof f);
assert("e.check", e.check=="f");
assert("e.hello()", e.hello()=="hello");
assert("e.test", e.test=="test");

e.test2 = "test2";
assert("e.test2", e.test2=="set:test2");
assert("e.bye()", e.bye()=="bye");
    
var h = g.new("test2");
assert("h not an instance of f", !(h instanceof f));
assert("h.check", h.check=="f");
assert("h.hello", h.hello=="hello2");
assert("h.test", h.test=="test");

h.test2 = "test2";
assert("h.test2", h.test2=="set:test2");
assert("h.bye()", h.bye()=="bye");
