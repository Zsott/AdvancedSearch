class AdvancedSearch{
    constructor(div, url, searchField, map, params){
        
        //Obligatory parameters
        this.div = div;
        this.url = url;
        this.searchField = searchField;
        this.map = map;
        
        //Optional parameters
        if("num" in params){
            this.num = params.num;
        }
        else{
            this.num = 6;
        }
        if("orderByFields" in params){
            this.orderByFields = params.orderByFields;
        }
        if("outFields" in params){
            this.outFields = params.outFields;
        }
        if("placeHolder" in params){
            this.placeHolder = params.placeHolder;
        }
        else{
            this.placeHolder = "Keresés..."
        }
        if("divCss" in params){
            this.divCss = params.divCss;
        }
        else{
            this.divCss = {
                "position" : "absolute",
                "top" : "10px",
                "left" : "50px",
                "z-index" : "1",
                "width" : "200px",
                "height" : "34px"
            }
        }
        if("inputCss" in  params){
            this.inputCss = params.inputCss;
        }
        else{
            this.inputCss = {
                "position" : "relative",
                "display" : "block",
                "z-index" : "1",
                "border" : "1px solid #999999",
                "border-radius" : "5px",
                "padding" : "2px 5px",
                "font-size" : "14px",
                "line-height" : "28px"
            }
        }
        if("resultsCss" in params){
            this.resultsCss = params.resultsCss;
        }
        else{
            this.resultsCss = {
                "position": "relative",
                "display": "block",
                "z-index" : "1000",
                //"margin-top" : "10px",
                "background" : "#ffffff",
                "border" : "1px solid #999999",
                "border-radius" : "5px"
            }
        }
        if("noResultText" in params){
            this.noResultText = params.noResultText;
        }
        else{
            this.noResultText = "Nincs találat";
        }
    }
    
    startup(){
        var idOk = false;
        var idNum = 0;
        var inputId = "searchInputBox";
        var resultId = "searchBoxResults";
        var searchQuery;
        var searchQueryTask;
        
        // Chooses an unused ID for the input box
        while(!idOk){                
            if($("#" + inputId).length > 0){
                inputId = inputId + "_" + idNum;
                idNum = idNum + 1;
            }
            else{
                idOk = true;
            }
        }
        
        // Chooses an unused ID for the result box
        idOk = false;
        idNum = 0;
        while(!idOk){                
            if($("#" + resultId).length > 0){
                resultId = resultId + "_" + idNum;
                idNum = idNum + 1;
            }
            else{
                idOk = true;
            }
        }
        
        //Format the search div
        $("#" + this.div).css(this.divCss);
        
        // Creates an input box for search
        $("#" + this.div).append('<input id="' + inputId + '" type="text" placeholder="'+ this.placeHolder +'">');
        
        // Styling the input box
        $("#" + inputId).css(this.inputCss);
        
        // Creates the query object
        var qOutFields = this.outFields;
        var qOrderByFields = this.orderByFields;
        var qUrl = this.url;
        var qNum = this.num;
        
        require(
            [
            "esri/tasks/query",
            "esri/tasks/QueryTask"
            ],
            function(
                Query,
                QueryTask
            ){
                searchQuery = new Query();
                searchQuery.returnGeometry = true;
                searchQuery.outFields = qOutFields;
                searchQuery.orderByFields = qOrderByFields;
                searchQueryTask = new QueryTask(qUrl);
            });                
        
        // Creates and attaches a keyup event to the input box
        var qSearchField = this.searchField;
        var qDiv = this.div;
        var qResultsCss = this.resultsCss;
        var qNoResultText = this.noResultText;
        var qMap = this.map;
        $("#" + inputId).keyup(function(){
            $("#" + resultId).remove();
            
            var searchResults = [];
            var isNotOver = true;
            
            searchQuery.num = qNum;
            // Setting the where condition depending on the input value
            searchQuery.where = "lower(" + qSearchField + ") like '" + $("#" + inputId).val().toLowerCase() + "%'";
            
            searchQueryTask.execute(searchQuery,processResult);
            
            //
            function processResult(featureSet){
                featureSet.features.forEach(function(feat){
                    var onList = false;                    
                    searchResults.forEach(function(res){
                        if(res.name == feat.attributes[qSearchField]){
                            onList = true;
                        }
                    });
                    if(!onList && searchResults.length < qNum){
                        var obj = {};
                        obj.name = feat.attributes[qSearchField];
                        obj.geometry = feat.geometry;
                        searchResults.push(obj);
                    }
                });
                var srLength = searchResults.length;
                if(srLength == qNum){
                    isNotOver = false;
                }
                if(!isNotOver){
                    createResults(searchResults);
                }                
                if(srLength < qNum && isNotOver){
                    isNotOver = false;
                    searchQuery.where = "lower(" + qSearchField + ") like '%" + $("#" + inputId).val().toLowerCase() + "%'";
                    searchQueryTask.execute(searchQuery, processResult);
                }                
            }
            
            //
            function createResults(arr){
                $("#" + resultId).remove();
                $("#" + qDiv).append('<div id="' + resultId + '"></div>');
                $("#" + resultId).css(qResultsCss);
                $("#" + resultId).css({
                    "left" : $("#" + qDiv + " input").css("left"),
                    "max-width" : $("#" + qDiv + " input").outerWidth() - 2,
                    "padding" : $("#" + qDiv + " input").css("padding")
                });
                $("#" + resultId).focus();                

                if(arr.length > 0){
                    var rHtml = '<ul>';
                    arr.forEach(function(item){
                        item.name = item.name.replace($("#" + inputId).val(), '<strong>' + $("#" + inputId).val() + '</strong>');
                        var titleCaseSearchInput = $("#" + inputId).val().substr(0,1).toUpperCase() + $("#" + inputId).val().substr(1);
                        item.name = item.name.replace(titleCaseSearchInput, '<strong>' + titleCaseSearchInput + '</strong>');                        
                        rHtml = rHtml + '<li class="searchResultsItem searchResultItemActive" tabindex="0">' + item.name + '</li>';
                    });
                    
                    // for(var i = 0; i < arr.length; i++){
                        // arr[i].name = arr[i].name.replace($("#" + inputId).val(), '<strong>' + $("#" + inputId).val() + '</strong>');
                        // var titleCaseSearchInput = $("#" + inputId).val().substr(0,1).toUpperCase() + $("#" + inputId).val().substr(1);
                        // arr[i].name = arr[i].name.replace(titleCaseSearchInput, '<strong>' + titleCaseSearchInput + '</strong>');                        
                        // rHtml = rHtml + '<li class="searchResultsItem searchResultItemActive" tabindex="' + i + '">' + arr[i].name + '</li>';
                    // }
                    
                    rHtml = rHtml + '</ul>';
                    $("#" + resultId).html(rHtml);
                    
                   
                    $(".searchResultItemActive").hover(function(){$(this).css({"background" : "#dddddd"})},
                                                  function(){$(this).css({"background" : "#ffffff"})});
                    $(".searchResultItemActive").focusin(function(){$(this).css({"background" : "#dddddd"});});
                    $(".searchResultItemActive").focusout(function(){$(this).css({"background" : "#ffffff"});});
                    $(".searchResultItemActive").click(function(){
                        zoomToSelected($(this).html());
                    });
                }
                else{
                    $("#" + resultId).html('<ul><li class="searchResultsItem">' + qNoResultText + '</li></ul>');
                }
                // Format the result box
                $("#" + resultId + " ul").css({
                    "padding" : "0",
                    "margin" : "0"
                });                 
                $(".searchResultsItem").css({
                    "list-style" : "none",
                    "padding" : "6px 12px",
                    "border-radius" : "5px",
                    "cursor" : "pointer",
                    "font-size" : "14px"
                });                
            }
            
            //
            function zoomToSelected(item){
                searchResults.forEach(function(obj){
                    if(obj.name == item){
                        var newExtent = obj.geometry.getExtent().expand(2);
                        qMap.setExtent(newExtent)
                    }
                });  
            }
        });
        
        $("#" + resultId).focusout(function(){
            $("#" + resultId).remove();
        });
        $("#" + qDiv).on("focus focusin focusout blur",function(e){
             console.log("SER");
             console.log(e.type);
        });        
        $("#" + resultId).on("focus focusin focusout blur",function(e){
             console.log("RES");
             console.log(e.type);
        });
    }
}