//Legacy replacements for javascript ecma5 defaults
(function(){
    //numOnly
    window.numOnly = function(n){
        if (!isNumeric(n) && n && n.replace) n = n.replace(/[^0-9.-]/, "");	//force string correction
        return parseFloat(n);
    };
    //isArray
    Array.isArray = function(obj) {
        return obj instanceof Array && obj['push'] != undefined; //ios 3.1.3 doesn't have Array.isArray
    };
    
})()