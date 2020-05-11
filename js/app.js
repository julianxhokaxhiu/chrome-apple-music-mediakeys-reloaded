var currentSong;

function getDataUri(url, callback) {
    var image = new Image();

    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

        canvas.getContext('2d').drawImage(this, 0, 0);

        callback(canvas.toDataURL('image/png'));
    };

    image.crossOrigin = "Anonymous"
    image.src = url
}

function notify() {
    chrome.storage.sync.get("notifications", function (obj) {
        var song = document.querySelector(".web-chrome-playback-lcd__song-name-scroll-inner-text-wrapper").textContent.trim();

        if (obj.notifications && song !== currentSong) {
            getDataUri(
                document.querySelector('.web-chrome-playback-lcd__artwork-container img').currentSrc,
                function (cover) {
                    chrome.runtime.sendMessage({
                        artist: document.querySelector('.web-chrome-playback-lcd__sub-copy-scroll-inner-text-wrapper').textContent.split('—')[0].trim(),
                        song: song,
                        cover: cover
                    });
                    currentSong = song;
                }
            )
        }
    });
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse){
    var click_event = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });

    switch(request.action){
        case 'NEXT-MK':
            document.querySelector(".web-chrome-playback-controls__main [data-test-playback-control-next]").dispatchEvent(click_event);
            break;
        case 'PREV-MK':
            document.querySelector(".web-chrome-playback-controls__main [data-test-playback-control-previous]").dispatchEvent(click_event);
            break;
        case 'STOP-MK':
            document.querySelector(".web-chrome-playback-controls__main [data-test-playback-control-pause]").dispatchEvent(click_event);
            break;
        case 'PLAY-PAUSE-MK':
            if (document.querySelector(".web-chrome-playback-controls__main [data-test-playback-control-pause]"))
                document.querySelector(".web-chrome-playback-controls__main [data-test-playback-control-pause]").dispatchEvent(click_event);
            else
                document.querySelector(".web-chrome-playback-controls__main [data-test-playback-control-play]").dispatchEvent(click_event);
            break;
    }
});

if (!currentSong) setInterval(notify, 1000);
