TestSuite.addTest("$$$ inheritance", function(){
    //$$$ inheritance tests
    //class a
    function a(test){
        this.check = "a";
    };
    //setup a's prototype
    $$$(a).proto({
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
    var f = function(){
        this.check = "f";
    }
    //prototype f with p
    $$$(f).proto(p);
    //b will be p extending a + property test
    var b = $$$(a).seed(p).property("test", {
        value:"test"
    });
    //c will be f extending b + property test2
    var c = $$$(b).seed(f).properties({
        test2:{
            configurable:false, 
            get:function(){return this.value;},
            set:function(v){this.value='set:'+v;}
        }
    });
    //g will be p extending c + property test2
    var g = $$$(c).seed({}).properties({
        hello:{
            value:"hello2"
        }
    });


    var d = b.new("Start test!");
    this.assert("Not an instance of a", !(d instanceof a));
    this.assert("d.check", d.check=="a");
    this.assert("d.hello()", d.hello()=="hello");
    this.assert("d.test", d.test=="test");
    this.assert("d.bye()", d.bye()=="bye");

    var e = c.new("test2");
    this.assert("e an instance of f", e instanceof f);
    this.assert("e.check", e.check=="f");
    this.assert("e.hello()", e.hello()=="hello");
    this.assert("e.test", e.test=="test");
    e.test2 = "test2";
    this.assert("e.test2", e.test2=="set:test2");
    this.assert("e.bye()", e.bye()=="bye");
    
    var h = g.new("test2");
    this.assert("h not an instance of f", !(h instanceof f));
    this.assert("h.check", h.check=="f");
    this.assert("h.hello", h.hello=="hello2");
    this.assert("h.test", h.test=="test");
    h.test2 = "test2";
    this.assert("h.test2", h.test2=="set:test2");
    this.assert("h.bye()", h.bye()=="bye");
});


TestSuite.addAsyncTest("$.ready", function(){
    var that = this;

    $.ready(function(){
        that.finish();
    });
});



TestSuite.runAll();

// var __color = {red:0,green:0,blue:0,alpha:1};
// function createGetMethod(prop){
//     return function(){return __color[prop]};
// }
// function createSetMethod(prop){
//     return function(val){__color[prop]=val};
// }
// function createDescritorProperty(prop){
//     return {
//         get: createGetMethod(prop),
//         set: createSetMethod(prop)
//     }
// }
// 
// var _color_descriptor = {
//     red:createDescritorProperty('red'),
//     green:createDescritorProperty('green'),
//     blue:createDescritorProperty('blue'),
//     alpha:createDescritorProperty('alpha'),
//     length:{
//         value:4,
//         writable:false,
//         enumerable : true
//     }
// }
// //setup numbered values
// _color_descriptor[0]=createDescritorProperty('red');
// _color_descriptor[1]=createDescritorProperty('green');
// _color_descriptor[2]=createDescritorProperty('blue');
// _color_descriptor[3]=createDescritorProperty('alpha');
// 
// var _color = Object.create(Array.prototype, _color_descriptor); //extends array
// 
// 
// Object.defineProperty(window, 'color', {
//     get: function() {
//         return _color;
//     },
//     set: function(val) {
//         _color.red = val[0];
//         _color.green = val[1];
//         _color.blue = val[2];
//         _color.alpha = val[3];
//     }
// });
// 
// window.color = [255,255,255,0];
// alert(window.color);
// window.color.red=10;
// alert(window.color);
