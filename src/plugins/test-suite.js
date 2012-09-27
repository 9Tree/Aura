//test suite
//Pure javascript, no dependencies with Aura itself, so we can test it properly
TestCase = function(name, f, timeout){
    this.failed=false;
    this.f = f;
    this.name = name;
    this.timeout = timeout;
    this.run=function(){
        console.log("Start: "+this.name);
        try {
            this.f();
        } catch(e){
            this.failed = true;
            TestSuite.exception(e);
        }
        if(!this.timeout) this.finish(); //sync
        else {  //async
            var that = this;
            this.timeoutHandler = setTimeout(function(){
                that.failed = true;
                TestSuite.exception("TestCase timed out ("+that.timeout+"ms)");
                that.finish();
            }, that.timeout);
        }
    }
    this.finish=function(){
        if(this.timeoutHandler) clearTimeout(this.timeoutHandler);
        if(this.failed) {
            TestSuite.exception("Error! Test failed: "+this.name);
        }
        else TestSuite.log("Passed: "+this.name);
        TestSuite.dumpLog();
    }
    this.assert=function(what, bool){
        if(!bool) {
            this.failed=true;
            TestSuite.exception(what);
        }
    }
}
TestSuite = {
    tests:{},
    logStack:[],
    dumpingLog:false,
    addTest:function(name, f){
        this.tests[name]=new TestCase(name, f);
    },
    addAsyncTest:function(name, f, timeout){
        timeout = timeout || 2500;
        this.tests[name]=new TestCase(name, f, timeout);
    },
    runAll:function(){
        console.log("Running all tests:");
        var that = this;
        for(el in this.tests) {
            setTimeout((function(f){
                return function(){f.run();}
            })(that.tests[el]),0); //run on "separate threads"
        }
    },
    dumpLog:function(){
        if(this.dumpingLog) return;
        var that = this;
        var interval = setInterval(function(){
            if(that.logStack.length==0) {
                clearInterval(interval);
                return;
            }
            //avoid problems in the stack
            setTimeout((function(e){
                return function(){
                    if(e.exception){
                        throw e.value;
                    } else {
                        console.log(e.value);
                    }
                }
            })(that.logStack.shift()),0);
        }, 25);
    },
    exception:function(e){
        this.logStack[this.logStack.length] = {exception:true, value:e}
    },
    log:function(e){
        this.logStack[this.logStack.length] = {exception:false, value:e}
    }
};