function Template(str){
    this.content = str;
    this.replacements = [];
}
Template.prototype = {
    render : function(){
        for(var e in this.replacements){
            this.content.replace("{{"+e+"}}", this.replacements[e]);
        }
        return this.content;
    }
}