function assert(what, val){
    if(!val) throw(what);
    else console.log("passed "+what);
}



//simplest tests as can be

//SIMPLE OBJECTS METHODS
//$$().absorb()
var a = { check : "a" };
$$(a).absorb({
    deep:{
        val:null
    },
    hello:null, 
    bye:function(){
        return "bye";
    }
});
assert("$$().absorb()", a.check=="a"&&a.hello==null&&a.bye()=="bye");

//$$().deep_absorb()
$$(a).deep_absorb({
    deep:{
        val:1
    }
});
assert("$$().deep_absorb()", a.deep.val == 1);

//$$().collect()
$$(a).collect({
    yo:"yo", 
    bye:"bye"
});
assert("$$().collect()", a.yo=="yo"&&a.bye()=="bye");

//$$().deep_collect()
$$(a).deep_collect({
    deep:{
            val:2,
            check:true
    }
});
assert("$$().deep_collect()", a.deep.check && a.deep.val==1);

//OBJECTS ES5 PROPERTIES
//$$().property()
$$(a).property("hello", {value:"hello"});
assert("$$().property()", a.hello=="hello");

//$$().properties()
$$(a).properties({hi:{value:"hi"}, bye:{value:"bye"}});
assert("$$().properties()", a.hi=="hi"&&a.bye=="bye");

//$$().propertize()
var b = {};
$$(b).propertize({hi:{value:"bye", configurable:true}});
$$(b).propertize({hi:{value:"hi"}, bye:{value:"bye"}});
assert("$$().propertize()", b.hi=="hi"&&b.bye=="bye");

//OBJECTS ES5 INHERATANCE
//$$().replica()
var e = {ze:"ze", deep:{hi:"myHi"}};
var f = $$(e).replica({test:"yeah!"});
assert("$$().replica()", f.ze=="ze"&&f.deep.hi=="myHi"&&f.test=="yeah!");

//$$().deep_replica()
var g = $$(e).deep_replica({test:"yeah!"});
e.deep.hi = "hi";
assert("$$().deep_replica()", g.deep.hi=="myHi"&&f.deep.hi=="hi"&&g.test=="yeah!");

//$$().spawn()
var c = $$(b).spawn({ze2:{value:"ze2"}, hi2:"myHi2"});
assert("$$().spawn()", c.hi=="hi"&&c.ze2=="ze2"&&Object.getPrototypeOf(c)==b);