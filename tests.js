// function a(test){alert(test)};
// 
// var b = $$$(a).extend({hello:function(){alert("hello!")}}).get();
// 
// var c = new b("test");
// 
// c.hello();

$.ready(function(){
    var a = $('#test-select');
    
    //alert(a.find(">option")[0].id);
    
    
    alert(a.val());   
});