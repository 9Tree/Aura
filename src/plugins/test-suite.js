//test suite
$$$.TestCase = function(name, f, timeout){
    this.errors=[];
    this.failed=false;
    this.f = f;
    this.name = name;
    this.timeout = timeout;
    this.run=function(){
        console.log("Start: "+this.name);
        this.f();
        if(!this.timeout) this.finish(); //sync
        else {  //async
            var that = this;
            this.timeoutHandler = setTimeout(function(){
                that.failed = true;
                that.errors[that.errors.length]="TestCase timed out ("+that.timeout+"ms)";
                that.finish();
            }, that.timeout);
        }
    }
    this.finish=function(){
        if(this.timeoutHandler) clearTimeout(this.timeoutHandler);
        if(this.failed) {
            for(var i=0;i<this.errors.length;i++){
                console.log("Failed assert: "+this.errors[i]);
            }
            throw "Error! Test failed: "+this.name;
        }
        else console.log("Passed: "+this.name);
    }
    this.assert=function(what, bool){
        if(!bool) {
            this.failed=true;
            this.errors[this.errors.length]=what;
        }
    }
}
$$.TestSuite = {
    tests:{},
    addTest:function(name, f){
        this.tests[name]=new $$$.TestCase(name, f);
    },
    addAsyncTest:function(name, f, timeout){
        timeout = timeout || 2500;
        this.tests[name]=new $$$.TestCase(name, f, timeout);
    },
    runAll:function(){
        console.log("Running all tests:");
        var that = this;
        for(el in this.tests) {
            setTimeout((function(f){
                return function(){f.run();}
            })(that.tests[el]),0); //run on "separate threads"
        }
    }
};