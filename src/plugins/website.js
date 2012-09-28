//Aura Website manager

//when running #urls will ajax load themselves into main section
//should work with iframes for full pages and elements for partial
//implement some way to refresh on back when necessary

(function(){
    var website = {
        automate:function(){
            var that = this;
            $.ready(function(){
                captureClicks();
            });
        },
        load:function(url, selector){
            selector = selector || document.body;
            if($$(this).trigger('load', [links[0]])){
                //ok, no preventDefault, let's load it
                $.ajax({
                    url:url,
                    success:function(str){
                        processData(str, selector);
                    },
                    failure:function(e){
                        
                    }
                })
            }
        },
        ,
         window.onpopstate = function(e){
             if(e.state){
                 var html = parseHTML(e.state.html);
                 //check if a full html file
                 
                 var el = 
                 $(document.body).inject();
                 document.getElementById("content").innerHTML = e.state.html;
                 document.title = e.state.pageTitle;
             }
         };
    }
    function captureClicks(){
        $(document).bind('click', function(e){
            var links = $(e.target).parents('a');
            if(links && links[0]){
                $.asap(function(){
                    website.load(links[0].getAttribute("href"));
                });
                e.preventDefault();
            }
        }, true);
    }
    function processAjaxData(response, selector){
        var html = parseHTML(response);
         ("content").innerHTML = response.html;
         document.title = response.pageTitle;
         window.history.pushState({"html":response.html,"pageTitle":response.pageTitle},"", urlPath);
    }
    function wrapHTML(html){
         if(html.indexOf('<!DOCTYPE')!=-1 || html.indexOf('<html')!=-1 || html.indexOf('<HTML')!=-1){
             html = '<section class="selected unwrap"><iframe>'+html+'</iframe></section>';
         } else {
             html = '<section class="selected unwrap"><div>'+html+'</div></section>';
         }
         return html;
    }
    
    //
    $$($$).addProperty({value:website})
})()