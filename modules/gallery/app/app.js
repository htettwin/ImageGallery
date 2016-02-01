var ImageServices = function () {

    this.getImageList = function ( callback ) {
        var url = 'https://api.flickr.com/services/rest/?method=flickr.galleries.getPhotos&api_key=45d9501675535fbb4747395acd8152c5&gallery_id=72157663337771571&extras=owner_name%2C+url_sq%2C+url_t%2C+url_s%2C+url_q%2C+url_m%2C+url_n%2C+url_z%2C+url_c%2C+url_l%2C+url_o&format=json&nojsoncallback=1';
        sentRequest( 'GET', url, callback );
    };

    function sentRequest( requestType, requestUrl, callback ) {

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var data = JSON.parse(xmlhttp.responseText);
                callback(data);
            }
        };
        xmlhttp.open( requestType, requestUrl, true);
        xmlhttp.send();
    }
};

var ImageGallery = function () {
    var parentElem;
    var imageList;
    var lightbox, lightboxImg, lightboxInfo, paddleLeft, paddleRight, currentImgInd; // keep track. We need to destroy this when it closes

    this.show = function( elem ) {
        parentElem = document.getElementById('gallery');
        getImages();
    };

    function showImages( list ) {
        if( list && list.photos && list.photos.photo ) {
            imageList = list.photos.photo;

            for( var i in imageList ) {
                addThumbnail(i, imageList[i].url_q, imageList[i].title);
            }
        } else {
            var p = getElem('p');
            var txt = document.createTextNode("No image found");
            p.appendChild(txt);
            parentElem.appendChild(p);
        }
    }

    /*
     * The following code creates
     *
     * <div class='thumbnail'>
     *    <img src='...' title='...'>
     *    <div class='shim'>
     *        <button>View Image</button>
     *    </div>
     * </div>
     */
    function addThumbnail( i, url, title ) {
        var div = getElem(parentElem, 'div', 'thumbnail');

        var img = getElem(div, 'img');
        img.src = url;
        img.alt = title;
        div.appendChild(img);

        var shim = getElem(div, 'div', 'shim');

        var btn = getElem(shim, "button");
        var txt = document.createTextNode("View Image");
        btn.appendChild(txt);
        btn.onclick = function( ev ) {
            console.log( " ON Click:: ", ev, " i:: ", i );
            showFullImage(i);
        };

        shim.appendChild(btn);
    }

    function getImages() {
        var service = new ImageServices();
        service.getImageList( showImages );
    }

    /*
     * The following code creates
     * <div class='lightbox'>
     *     <div class='imageCtn'>
     *         <img src='...' alt='...'>
     *     </div>
     *     <button class='paddle left'><span class='sr-only'>Previous Image</span></button>
     *     <button class='paddle right'><span class='sr-only'>Next Image</span></button>
     *     <p>...</p>
     * </div>
     *
     */
    function showFullImage( ind ) {
        console.log( "Show Full Image For ", ind );
        currentImgInd = parseInt(ind);
        var selectedImgInfo = imageList[ind];

        lightbox = getElem( document.body, 'div', 'lightbox');
        document.body.className = 'fixed';

        var btnCtn = getElem(lightbox, 'div', 'btnCtn' );
        var content = getElem(lightbox, 'div', 'contentCtn' );

        // children in btn ctn
        var close = getElem(btnCtn, 'button', 'close');
        close.onclick = function( ev ) {
            document.body.removeChild(lightbox);
            document.body.className = '';
        };

        var imageCtn = getElem(content, 'div', 'imageCtn' );

        // paddle
        paddleLeft = getPaddle( imageCtn, ind, 'left', "Previous Image", showPrev );

        // children in content ctn
        lightboxImg = getElem(imageCtn, 'img');
        lightboxImg.src = selectedImgInfo.url_c;
        lightboxImg.alt = selectedImgInfo.title;
        imageCtn.appendChild(lightboxImg);

        var p = getElem(imageCtn, 'p', 'infoCtn' );

        // children for info ctn
        lightboxInfo = document.createTextNode(selectedImgInfo.title);
        p.appendChild(lightboxInfo);

        content.appendChild(imageCtn);

        paddleRight = getPaddle( imageCtn, ind, 'right', "Next Image", showNext );

        updatePaddleState( paddleLeft, ind, 'left' );
        updatePaddleState( paddleRight, ind, 'right' );
    }

    function showPrev() {

        if( currentImgInd > 0 ) {
            currentImgInd = currentImgInd - 1 ;
        }

        if( currentImgInd < 0 ) {
            currentImgInd = 0;
        }

        swapImage(currentImgInd);
        updatePaddleState( paddleLeft, currentImgInd, 'left' );
        updatePaddleState( paddleRight, currentImgInd, 'right' );
    }

    function showNext() {
        if( currentImgInd < imageList.length ) {
            currentImgInd = currentImgInd + 1 ;
        }

        if( currentImgInd > imageList.length - 1 ) {
            currentImgInd = imageList.length - 1;
        }

        swapImage(currentImgInd);
        updatePaddleState( paddleLeft, currentImgInd, 'left' );
        updatePaddleState( paddleRight, currentImgInd, 'right' );
    }

    function swapImage( ind ) {
        var selectedImgInfo = imageList[ind];

        lightboxImg.src = selectedImgInfo.url_c;
        lightboxImg.alt = selectedImgInfo.title;

        lightboxInfo.nodeValue = selectedImgInfo.title;
    }

    function getElem( parent, type, className ) {
        var obj = document.createElement( type );

        if( className ) {
            obj.className = className;
        }

        if( parent ) {
            parent.appendChild(obj);
        }

        return obj;
    }

    function getPaddle( parentCtn, ind, className, ariaText, callback ) {

        var paddleBtn = getElem(parentCtn, 'button', 'paddle ' + className);
        paddleBtn.onclick = callback;

        var span = getElem(paddleBtn, 'span', 'sr-only');
        var txt = document.createTextNode(ariaText);
        span.appendChild(txt);

        return paddleBtn;
    }

    function updatePaddleState( obj, ind, type ) {
        if( type === 'left' ) {
            if( ind <= 0 ) {
                obj.disabled = true;
            } else {
                obj.disabled = false;
            }

        } else if( type === 'right' ) {
            if( ind >= imageList.length - 1 ) {
                obj.disabled = true;
            } else {
                obj.disabled = false;
            }
        }
    }
};

(function() {
    var gallery = new ImageGallery();
    gallery.show('gallery');
})();

/*


 <div id="lightbox">
 <div class="paddle left"><span class="sr-only">Previous Image</span></div>
 <div class="paddle right"><span class="sr-only">Next Image</span></div>
 </div>
 */