function a(test){alert(test)};
a.prototype = {hello:null, bye:function(){alert("Bye!")}};

var p = {hello:function(){alert("hello!")}};
var f = function(){
    alert("Hey!");
}
f.prototype = p

var b = $$$(a).extend(p).property("test", {
    value:"This is a test!", 
    configurable:false, 
    enumerable:false, 
    writable:false
});
var c = $$$(a).extend(f).properties({
    test:{
        configurable:false, 
        get:function(){alert("--getting test--"); return value;},
        set:function(v){alert("--setting test--"); value=v;}
    }
});


var d = b.new("Start test!");
d.hello();
alert(d.test);
d.bye();

var e = c.new("test");
var value;
e.hello();
e.test = "This is a test too!";
alert(e.test);
e.bye();


$.ready(function(){
    var a = $('#test-select');
    
    var b = a.get(0);
    
    
    //o.hasOwnProperty("onclick")
    
    //alert(b.getAttribute('name'));
    
    
    //alert(a.find(">option")[0].id);
    //alert(a.val());   

});