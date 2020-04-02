/* @author Florian Fries (contact@florianfries.me) */
function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}

function init() {
    gapi.client.setApiKey("AIzaSyCvpfnEPwSpeIQNAZl_ZhYmAhNJS5I2VZk");
    gapi.client.load("youtube", "v3", function(){
        //youtube api is ready
        console.log("youtube api is ready");
    });
}

$(document).ready(function(){

    $("form").on("submit", function(e){
        e.preventDefault();
        //prepare the request
        var request = gapi.client.youtube.channels.list({
            part: "contentDetails",
            type: "channel",
            forUsername: "SHOOTAWAYdotCOM",
            //q: encodeURIComponent($("#search").val()).replace(/%20/g, "+"),
            maxResults: 50,
            //order: "viewCount",
            //publishedAfter: "2019-01-01T00:00:00Z"
        });
    
        //execute the request
        request.execute(function(response){
            console.log(response)
            var pid = response.result.items[0].contentDetails.relatedPlaylists.uploads;
            getVids(pid);
            next=$('#pagetoken').text(); 
            console.log('After call: ' + next);
        });
    });

    function getVids(pid, page){
        var request = gapi.client.youtube.playlistItems.list({
            part: "snippet, contentDetails",
            maxResults: 20,
            playlistId: pid,
            pageToken: page
        });
    
        //execute the request
        request.execute(function(response){
            $('#pagetoken').html(response.nextPageToken);
            var result = response.result;
            result.items.forEach(element => {
                $('#app').empty();
                $.get('./item.html', function(data){
                    $('#app').append(tplawesome(data, [{"title": element.snippet.title, "videoid": element.snippet.resourceId.videoId}]));
                });
            });
        });
    }

});

