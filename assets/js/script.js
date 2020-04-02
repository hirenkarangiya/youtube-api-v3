/* @author Florian Fries (contact@florianfries.me) */
function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}

let previouspage = "", nextpage = "";
let key = "your_key";
let playlistId = "";
let part = "id,snippet,contentDetails";
let pageLength = 21;
let username = "enter your youtube user name";
let channelURL = "https://www.googleapis.com/youtube/v3/channels?key="+key+"&part="+part+"&forUsername="+username;
let channelID = null;

//This function will fetch channel ID and additional information using username.
fetch(channelURL)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        //console.log(response);
        channelID = response.items[0].id;
        playlistId = response.items[0].contentDetails.relatedPlaylists.uploads;
    })
    .finally( () => {
        console.log(playlistId);
        getVids();
    })
    .catch( (error) => {
        console.log('Error:'+ error);
    });

function getPlaylist(pagetoken=""){
    let pageToken = pagetoken || "";
    let playlistURL = "https://www.googleapis.com/youtube/v3/playlists?key="+key+"&part="+part+"&channelId="+channelID+"&maxResults="+pageLength+"&pageToken="+pageToken;

    //This function will fetch playlist of current channel using channel id.
    fetch(playlistURL)
        .then( (response) => {
            return response.json();
        })
        .then( (response) => {
            //console.log(response);
            response.items.forEach( (element) => {
                $('#app').empty();
                $.get('./playlistitem.html', function(data){
                    $('#app').append(tplawesome(data, [{"id": element.id,"title": element.snippet.title, "thumbnails": element.snippet.thumbnails.medium.url, "totalitems": element.contentDetails.itemCount}]));
                });
            });

            //Pagetoken value will be append
            pagetokenadd(response);
            

        })
        .finally( () => {
            videolightboxpopupHandler();
        })
        .catch( (error) => {
            console.log('Error:'+ error);
            $('.toast').toast('show');
            $('.toast-body').text(error);
        });
}
function getVids(pagetoken=""){
    let pageToken = pagetoken || "";
    let url = 'https://www.googleapis.com/youtube/v3/playlistItems?key='+ key +'&part='+ part +'&maxResults='+ pageLength +'&playlistId='+playlistId+'&pageToken='+pageToken;
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then((response) => {
        //console.log(response);
        response.items.forEach(element => {
            $('#app').empty();
            let date = moment(element.snippet.publishedAt).format('YYYY-MM-DD');
            let videoId = element.contentDetails.videoId;
            let videoUrl = "https://www.googleapis.com/youtube/v3/videos?id="+ videoId +"&key="+key+"&part=contentDetails,statistics,status";
            fetch(videoUrl)
            .then( (response) => response.json())
            .then( (response) => {
                //console.log(response);
                let views = response.items[0].statistics.viewCount;
                let likes = response.items[0].statistics.likeCount;
                let dislikes = response.items[0].statistics.dislikeCount;
                let duration = moment.duration(response.items[0].contentDetails.duration, 'minutes').humanize();
                $.get('./item.html', function(data){
                    $('#app').append(tplawesome(data, [{"title": element.snippet.title, "videoid": element.snippet.resourceId.videoId, "views": views, "likes": likes, "dislikes": dislikes,"thumbnails": element.snippet.thumbnails.medium.url, "uploadedAt": date, "duration": duration}]));
                });
            })
            .catch( (error) => { console.log('Error', error) });
            
        });
        
        //Pagetoken value will be append
        pagetokenadd(response);
    })
    .catch((error) => {
        console.error('Error:', error);
        $('.toast').toast('show');
        $('.toast-body').text(error);
    });
}

function pagetokenadd(response){
    if(response.prevPageToken){
        previouspage = response.prevPageToken;
        $('#prevpage').attr('data-id', previouspage);
        $('#prevpage').attr('disabled', false);
    } else {
        $('#prevpage').attr('data-id', '');
        $('#prevpage').attr('disabled', true);
    }
    if(response.nextPageToken){
        nextpage = response.nextPageToken;
        $('#nextpage').attr('data-id', nextpage);
        $('#nextpage').attr('disabled', false);
    } else {
        $('#nextpage').attr('data-id', '');
        $('#nextpage').attr('disabled', true);
    }
}

$('#nextpage').on('click', function(e){
    e.preventDefault();
    let pagetoken = e.target.getAttribute('data-id');
    if($('#getVideos').hasClass('active')){
        getVids(pagetoken);
    }
    if($('#getPlaylist').hasClass('active')){
        getPlaylist(pagetoken);
    }
});

$('#prevpage').on('click', function(e){
    e.preventDefault();
    let pagetoken = e.target.getAttribute('data-id');
    if($('#getVideos').hasClass('active')){
        getVids(pagetoken);
    }
    if($('#getPlaylist').hasClass('active')){
        getPlaylist(pagetoken);
    }
});

$('#getVideos').on('click', function(e){
    e.preventDefault();
    getVids();
});

$('#getPlaylist').on('click', function(e){
    e.preventDefault();
    getPlaylist();
});

$('.nav .nav-item .nav-link').on('click', function(e){
    e.preventDefault();
    $('.nav-link').removeClass("active");
    $(this).addClass("active");
});

function videolightboxpopupHandler(){
    console.log('Video Lightbox');
    $('#app').on('click', '.videos', function(e){
        e.preventDefault();
        console.log('clicked');
        let data = [];
        let playlistId = $(this).attr('data-id');
        let playlistItemsURL = "https://www.googleapis.com/youtube/v3/playlistItems?key="+key+"&part="+part+"&maxResults=50&playlistId="+playlistId;
        fetch(playlistItemsURL)
            .then( (response) => {
                return response.json();
            })
            .then( (response) => {
                $('#videosLightbox').empty();
            
                response.items.forEach( (element) => {
                    let dataDict = {};
                    $('#videosLightbox').append('<a class="fancygallery" href="https://www.youtube.com/embed/'+ element.contentDetails.videoId +'?rel=0" rel="gallery"></a>');
                    dataDict['src'] = 'https://www.youtube.com/embed/'+ element.contentDetails.videoId;
                    data.push(dataDict);
                    //console.log(data);
                });
            })
            .finally( () => {
                console.log(data);
                $.fancybox.open(data,{
                    loop: true,
                    thumbs: {
                        autoStart : true
                    }
                });
            })
            .catch( (error) => {
                console.log('Error: '+ error);
            });
    });
}
