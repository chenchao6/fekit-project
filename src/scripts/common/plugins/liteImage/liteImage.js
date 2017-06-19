;
(function($, window, undefined) {
    "use strict";
    var noop = function() {},
        MegaPixImage,
        dataURLtoBlob,
        waterfall,
        transferScale,
        translateSize,
        downScaleImage,
        oneM = 1024 * 1024,
        iURL = window.URL || window.webkitURL;

    // test support resize img
    var resizeFlg = !!(window.File && window.FileReader && window.FileList && window.Blob);

    // quality参数是否可配置
    var qualityFlg = true;
    try {
        new Blob(['test'], {
            type: 'image/png'
        });
    } catch (e) {
        //异常的话，canvas.toDataURL('image/jpeg', quality) 时，不能降低图片质量
        qualityFlg = false;
    }

    var iOSFlg = /iphone|iPad/i.test(window.navigator.userAgent);

    /**
     @method liteImage
     @chainable
     @requires jQuery or Zepto
     @param param={} {Object}
     @return this
     */
    $.fn.liteImage = function(param) {
        //only support input file
        if(this.attr('type') !== 'file' || this.attr('tagName').toLowerCase() !== 'input'){
            return this;
        }

        param = param || {};
        //e.g 'image/gif, image/jpeg'
        this.attr('accept', param.accept || 'image/*');

        if (!this.attr('multiple') && !!param.multiple) {
            this.attr('multiple', '');
        }
        //property
        var maxSize = translateSize(param.maxSize) || 20 * oneM; //default 20mb
        var singleSize = translateSize(param.singleSize) || 10 * oneM; //default 10mb
        var perCount = param.perCount || false; // 限制选择文件数
        var scale = param.scale; // scale = target width / source width ==> scale > 0 && scale < 1 or like 720 or 1080
        var quality = param.quality; //图片质量参数 quality > 0 && quality < 1

        //handler
        var error = $.isFunction(param.error) ? param.error : noop;
        var before = $.isFunction(param.before) ? param.before : noop;
        var after = $.isFunction(param.after) ? param.after : noop;
        var complete = $.isFunction(param.complete) ? param.complete : noop;

        //private
        var sizeCounter = 0;

        this.bind('change', function(e) {
            e.preventDefault();
            var resultList = [],
                len = this.files.length;

            //if beyond perCount
            if (perCount && len > perCount) {
                error({
                    type: 'perCount',
                    data: {
                        count: len,
                        perCount: perCount
                    }
                });
                this.files.length = perCount;
                len = perCount;
            }

            //check resize file has completed
            var check = checkCompleted(resultList, complete, len);

            for (var i = 0; i < len; i++) {
                var file = this.files[i],
                    size = file.size;
                sizeCounter += size;

                //if beyond singleSize
                if (size > singleSize) {
                    error({
                        type: 'singleSize',
                        data: {
                            size: size,
                            singleSize: singleSize,
                            file: file,
                            index: i
                        }
                    });
                    check(i);
                    sizeCounter -= size;
                    continue;
                }

                //if beyond maxSize
                if (sizeCounter > maxSize) {
                    error({
                        type: 'maxSize',
                        data: {
                            maxSize: maxSize,
                            curTotalSize: sizeCounter,
                            index: i
                        }
                    });
                    for (var j = i; j < len; j++) {
                        check(j);
                    }
                    break;
                }

                // can change quality or scale; also can delete file
                before({
                    index: i,
                    file: file
                });

                if (!file) {
                    check(i);
                    continue;
                }

                var dataURL = iURL.createObjectURL(file);
                //if unsupport img resize
                if(!resizeFlg){
                    var rlt = {
                        source: {
                            index: i,
                            file: file
                        },
                        file: file,
                        dataURL: dataURL
                    };
                    after(rlt);
                    check(i, rlt);
                    continue;
                }

                var queue = [];

                //down quality
                if (qualityFlg && quality < 1 && quality > 0) {
                    queue.push(qualityCallback(file, quality, dataURL));
                }

                //down scale
                if (scale < 1 && scale > 0 || scale > 1) {
                    queue.push(scaleCallback(file, scale, dataURL));
                }

                if(!queue.length){
                    check(i);
                    continue;
                }

                waterfall(queue, (function(s, f) {
                    return function(err, result) {
                        if (err) {
                            f(err);
                            return;
                        }
                        s(result);
                    };
                })(success(file, i, after, check, dataURL),
                    fail(file, i, error, check, dataURL)));
            }
        });

        this.setHandler = function(type, handler) {
            if (!$.isFunction(handler)) return;
            switch (type) {
                case 'complete':
                    complete = handler;
                    break;
                case 'error':
                    error = handler;
                    break;
                case 'before':
                    before = handler;
                    break;
                case 'after':
                    after = handler;
                    break;
            }
            return this;
        };

        this.setProperty = function(name, value) {
            if (!value) return;
            switch (name) {
                case 'maxSize':
                    maxSize = translateSize(value) || 20 * oneM;
                    break;
                case 'singleSize':
                    singleSize = translateSize(value) || 10 * oneM;
                    break;
                case 'perCount':
                    perCount = value;
                    break;
                case 'scale':
                    scale = value;
                    break;
                case 'quality':
                    quality = value;
                    break;
            }
            return this;
        };

        this.getProperty = function(name) {
            var value;
            switch (name) {
                case 'maxSize':
                    value = maxSize;
                    break;
                case 'singleSize':
                    value = singleSize;
                    break;
                case 'perCount':
                    value = perCount;
                    break;
                case 'scale':
                    value = scale;
                    break;
                case 'quality':
                    value = quality;
                    break;
            }
            return value;
        };

        return this;
    };

    function checkCompleted(resultList, complete, len) {
        var count = len;
        return function(index, value) {
            resultList[index] = value || null;
            !(--count) && complete(resultList);
        };
    }

    function qualityCallback(file, quality, dataURL) {
        return function(next) {
            var img = new Image();
            img.onload = function() {
                var canvas = convertImageToCanvas(this);
                var qDataURL = canvas.toDataURL('image/jpeg', quality);
                //iphone safari 处理大图(3m以上)时，会返回' data,'
                if(qDataURL.length < 7){
                    qDataURL = dataURL;
                }
                next(null, {
                    quality: {
                        quality: quality,
                        canvas: canvas,
                        dataURL: qDataURL
                    },
                    dataURL: qDataURL
                });
                this.onload = this.error = null;
            };
            img.onerror = function() {
                next({
                    quality: {
                        quality: quality
                    }
                });
                this.onload = this.error = null;
            };
            img.src = dataURL;
        };
    }

    function scaleCallback(file, scale, dataURL) {
        return function(param, next) {
            if ($.isFunction(param)) {
                next = param;
                param = null;
            }
            var img = new Image(),
                src;
            if(param){
                src = param.dataURL;
            }else{
                src = dataURL;
                param = {};
            }
            img.onload = function() {
                var canvas = downScaleImage(this, scale);
                var dataURL = canvas.toDataURL('image/jpeg');
                param.scale = {
                    scale: scale,
                    canvas: canvas,
                    dataURL: dataURL
                };
                param.dataURL = dataURL;
                next(null, param);
                this.onload = this.error = null;
            };
            img.onerror = function() {
                param.scale = {
                    scale: scale
                };
                next(param);
                this.onload = this.error = null;
            };
            img.src = src;
        };
    }

    function success(file, index, after, check, dataURL) {
        return function(result) {
            var curfile = dataURLtoBlob(result.dataURL);
            result.source = {
                index: index,
                file: file
            };
            // alert(curfile.size +":"+ file.size)
            if(curfile.size < file.size){
                result.file = curfile;
            }else{
                result.file = file;
                result.dataURL = dataURL;
            }
            after(result);
            check(index, result);
            iURL.revokeObjectURL(dataURL);
        };
    }

    function fail(file, index, error, check, dataURL) {
        return function(err) {
            error({
                type: 'fail',
                data: {
                    index: index,
                    file: file,
                    error: err,
                    dataURL: dataURL
                }
            });
            check(index);
            iURL.revokeObjectURL(dataURL);
        };
    }

    transferScale = iOSFlg ? function(scale, img) {
        var w,h, ow = img.width, oh = img.height;
        if(scale > 1){
            if(ow > oh){
                w = scale;
                h = oh/ow * w;
            }else{
                h = scale;
                w = ow/oh * h;
            }
        }else{
            w = ow * scale;
            h = oh * scale;
        }
        return {
            width : w,
            height : h
        };
    } : function(scale, img) {
        if(scale > 1){
            var w = img.width,
                h = img.height,
                tmp = w > h ? w : h;
            if(scale < tmp){
                scale = scale/tmp;
            }else{
                scale = 0.999999;
            }
        }
        return scale;
    };

    translateSize = (function() {
        var unitMap = {
            k: 1,
            m: 2,
            g: 3,
            t: 4,
            p: 5,
            e: 6,
            z: 7,
            y: 8
        };
        return function(size) {
            var tmp = 0;
            switch (typeof size) {
                case 'string':
                    tmp = size.match(/(\d+)([kmgtpezy])/i);
                    tmp = tmp ? tmp[1] * Math.pow(1024, unitMap[tmp[2].toLowerCase()]) : parseInt(size, 10);
                    break;
                case 'number':
                    tmp = size;
                    break;
            }
            return tmp;
        };
    })();

    // --------------------------------

    // scales the image by (float) scale < 1
    // returns a canvas containing the scaled image.
    downScaleImage = iOSFlg ? function(img, scale) {
        var tmp = transferScale(scale, img);
        var canvas = convertImageToCanvas(img);
        var mpImg = new MegaPixImage(img);
        mpImg.render(canvas, {maxHeight: tmp.height, maxWidth: tmp.width});
        return canvas;
    } : function(img, scale) {
        return downScaleCanvas(convertImageToCanvas(img), transferScale(scale, img));
    };

    function convertImageToCanvas(image) {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas;
    }

    // from http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality
    // scales the canvas by (float) scale < 1
    // returns a new canvas containing the scaled image.
    function downScaleCanvas(cv, scale) {
        if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
        var sqScale = scale * scale; // square scale = area of source pixel within target
        var sw = cv.width; // source image width
        var sh = cv.height; // source image height
        var tw = Math.ceil(sw * scale); // target image width
        var th = Math.ceil(sh * scale); // target image height
        var sx = 0,
            sy = 0,
            sIndex = 0; // source x,y, index within source array
        var tx = 0,
            ty = 0,
            yIndex = 0,
            tIndex = 0; // target x,y, x,y index within target array
        var tX = 0,
            tY = 0; // rounded tx, ty
        var w = 0,
            nw = 0,
            wx = 0,
            nwx = 0,
            wy = 0,
            nwy = 0; // weight / next weight x / y
        // weight is weight of current source point within target.
        // next weight is weight of current source point within next target's point.
        var crossX = false; // does scaled px cross its current px right border ?
        var crossY = false; // does scaled px cross its current px bottom border ?
        var sBuffer = cv.getContext('2d').getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
        var tBuffer = new Float32Array(3 * sw * sh); // target buffer Float32 rgb
        var sR = 0,
            sG = 0,
            sB = 0; // source's current point r,g,b
        /* untested !
        var sA = 0;  //source alpha  */
        for (sy = 0; sy < sh; sy++) {
            ty = sy * scale; // y src position within target
            tY = 0 | ty; // rounded : target pixel's y
            yIndex = 3 * tY * tw; // line index within target array
            crossY = (tY != (0 | ty + scale));
            if (crossY) { // if pixel is crossing botton target pixel
                wy = (tY + 1 - ty); // weight of point within target pixel
                nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
            }
            for (sx = 0; sx < sw; sx++, sIndex += 4) {
                tx = sx * scale; // x src position within target
                tX = 0 | tx; // rounded : target pixel's x
                tIndex = yIndex + tX * 3; // target pixel index within target array
                crossX = (tX != (0 | tx + scale));
                if (crossX) { // if pixel is crossing target pixel's right
                    wx = (tX + 1 - tx); // weight of point within target pixel
                    nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
                }
                sR = sBuffer[sIndex]; // retrieving r,g,b for curr src px.
                sG = sBuffer[sIndex + 1];
                sB = sBuffer[sIndex + 2];

                /* !! untested : handling alpha !!
                   sA = sBuffer[sIndex + 3];
                   if (!sA) continue;
                   if (sA != 0xFF) {
                       sR = (sR * sA) >> 8;  // or use /256 instead ??
                       sG = (sG * sA) >> 8;
                       sB = (sB * sA) >> 8;
                   }
                */
                if (!crossX && !crossY) { // pixel does not cross
                    // just add components weighted by squared scale.
                    tBuffer[tIndex] += sR * sqScale;
                    tBuffer[tIndex + 1] += sG * sqScale;
                    tBuffer[tIndex + 2] += sB * sqScale;
                } else if (crossX && !crossY) { // cross on X only
                    w = wx * scale;
                    // add weighted component for current px
                    tBuffer[tIndex] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // add weighted component for next (tX+1) px
                    nw = nwx * scale;
                    tBuffer[tIndex + 3] += sR * nw;
                    tBuffer[tIndex + 4] += sG * nw;
                    tBuffer[tIndex + 5] += sB * nw;
                } else if (crossY && !crossX) { // cross on Y only
                    w = wy * scale;
                    // add weighted component for current px
                    tBuffer[tIndex] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // add weighted component for next (tY+1) px
                    nw = nwy * scale;
                    tBuffer[tIndex + 3 * tw] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                } else { // crosses both x and y : four target points involved
                    // add weighted component for current px
                    w = wx * wy;
                    tBuffer[tIndex] += sR * w;
                    tBuffer[tIndex + 1] += sG * w;
                    tBuffer[tIndex + 2] += sB * w;
                    // for tX + 1; tY px
                    nw = nwx * wy;
                    tBuffer[tIndex + 3] += sR * nw;
                    tBuffer[tIndex + 4] += sG * nw;
                    tBuffer[tIndex + 5] += sB * nw;
                    // for tX ; tY + 1 px
                    nw = wx * nwy;
                    tBuffer[tIndex + 3 * tw] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                    // for tX + 1 ; tY +1 px
                    nw = nwx * nwy;
                    tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                    tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                    tBuffer[tIndex + 3 * tw + 5] += sB * nw;
                }
            } // end for sx
        } // end for sy

        // create result canvas
        var resCV = document.createElement('canvas');
        resCV.width = tw;
        resCV.height = th;
        var resCtx = resCV.getContext('2d');
        var imgRes = resCtx.getImageData(0, 0, tw, th);
        var tByteBuffer = imgRes.data;
        // convert float32 array into a UInt8Clamped Array
        var pxIndex = 0; //
        for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
            tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
            tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
            tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
            tByteBuffer[tIndex + 3] = 255;
        }
        // writing result to canvas.
        resCtx.putImageData(imgRes, 0, 0);
        return resCV;
    }


    //Runs the tasks array of functions in series, each passing their results to the next in the array.
    //However, if any of the tasks pass an error to their own callback, the next function is not executed,
    //and the main callback is immediately called with the error.
    waterfall = (function() {
        var _isArray = Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };

        var aSetImmediate = function(fn) {
            setTimeout(fn, 0);
        };

        var aIterator = function(tasks) {
            var makeCallback = function(index) {
                var fn = function() {
                    if (tasks.length) {
                        tasks[index].apply(null, arguments);
                    }
                    return fn.next();
                };
                fn.next = function() {
                    return (index < tasks.length - 1) ? makeCallback(index + 1) : null;
                };
                return fn;
            };
            return makeCallback(0);
        };

        return function(tasks, callback) {
            callback = callback || function() {};
            if (!_isArray(tasks)) {
                var err = new Error('First argument to waterfall must be an array of functions');
                return callback(err);
            }
            if (!tasks.length) {
                return callback();
            }
            var wrapIterator = function(iterator) {
                return function(err) {
                    if (err) {
                        callback.apply(null, arguments);
                        callback = function() {};
                    } else {
                        var args = Array.prototype.slice.call(arguments, 1);
                        var next = iterator.next();
                        if (next) {
                            args.push(wrapIterator(next));
                        } else {
                            args.push(callback);
                        }
                        aSetImmediate(function() {
                            iterator.apply(null, args);
                        });
                    }
                };
            };
            wrapIterator(aIterator(tasks))();
        };
    })();

    //from https://github.com/blueimp/JavaScript-Canvas-to-Blob
    dataURLtoBlob = qualityFlg ? function(dataURL) {
        return new Blob([dataURL], {
            type: 'image/jpeg'
        });
    } : (function() {
        var CanvasPrototype = window.HTMLCanvasElement &&
            window.HTMLCanvasElement.prototype,
            hasBlobConstructor = window.Blob && (function() {
                try {
                    return Boolean(new Blob());
                } catch (e) {
                    return false;
                }
            }()),
            hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array &&
            (function() {
                try {
                    return new Blob([new Uint8Array(100)]).size === 100;
                } catch (e) {
                    return false;
                }
            }()),
            BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
            window.MozBlobBuilder || window.MSBlobBuilder,
            fn = (hasBlobConstructor || BlobBuilder) && window.atob &&
            window.ArrayBuffer && window.Uint8Array && function(dataURI) {
                var byteString,
                    arrayBuffer,
                    intArray,
                    i,
                    mimeString,
                    bb;
                if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                    // Convert base64 to raw binary data held in a string:
                    byteString = atob(dataURI.split(',')[1]);
                } else {
                    // Convert base64/URLEncoded data component to raw binary data:
                    byteString = decodeURIComponent(dataURI.split(',')[1]);
                }
                // Write the bytes of the string to an ArrayBuffer:
                arrayBuffer = new ArrayBuffer(byteString.length);
                intArray = new Uint8Array(arrayBuffer);
                for (i = 0; i < byteString.length; i += 1) {
                    intArray[i] = byteString.charCodeAt(i);
                }
                // Separate out the mime component:
                mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                // Write the ArrayBuffer (or ArrayBufferView) to a blob:
                if (hasBlobConstructor) {
                    return new Blob(
                        [hasArrayBufferViewSupport ? intArray : arrayBuffer], {
                            type: mimeString
                        }
                    );
                }
                bb = new BlobBuilder();
                bb.append(arrayBuffer);
                return bb.getBlob(mimeString);
            };
        return fn;
    })();

    /**
     * Mega pixel image rendering library for iOS6 Safari
     *
     * Fixes iOS6 Safari's image file rendering issue for large size image (over mega-pixel),
     * which causes unexpected subsampling when drawing it in canvas.
     * By using this library, you can safely render the image with proper stretching.
     *
     * Copyright (c) 2012 Shinichi Tomita <shinichi.tomita@gmail.com>
     * Released under the MIT license
     */
    MegaPixImage = (function() {

        /**
         * Detect subsampling in loaded image.
         * In iOS, larger images than 2M pixels may be subsampled in rendering.
         */
        function detectSubsampling(img) {
            var iw = img.naturalWidth,
                ih = img.naturalHeight;
            if (iw * ih > 1024 * 1024) { // subsampling may happen over megapixel image
                var canvas = document.createElement('canvas');
                canvas.width = canvas.height = 1;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, -iw + 1, 0);
                // subsampled image becomes half smaller in rendering size.
                // check alpha channel value to confirm image is covering edge pixel or not.
                // if alpha value is 0 image is not covering, hence subsampled.
                return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
            } else {
                return false;
            }
        }

        /**
         * Detecting vertical squash in loaded image.
         * Fixes a bug which squash image vertically while drawing into canvas for some images.
         */
        function detectVerticalSquash(img, iw, ih) {
            var canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = ih;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var data = ctx.getImageData(0, 0, 1, ih).data;
            // search image edge pixel position in case it is squashed vertically.
            var sy = 0;
            var ey = ih;
            var py = ih;
            while (py > sy) {
                var alpha = data[(py - 1) * 4 + 3];
                if (alpha === 0) {
                    ey = py;
                } else {
                    sy = py;
                }
                py = (ey + sy) >> 1;
            }
            var ratio = (py / ih);
            return (ratio === 0) ? 1 : ratio;
        }

        /**
         * Rendering image element (with resizing) and get its data URL
         */
        function renderImageToDataURL(img, options, doSquash) {
            var canvas = document.createElement('canvas');
            renderImageToCanvas(img, canvas, options, doSquash);
            return canvas.toDataURL("image/jpeg", options.quality || 0.8);
        }

        /**
         * Rendering image element (with resizing) into the canvas element
         */
        function renderImageToCanvas(img, canvas, options, doSquash) {
            var iw = img.naturalWidth,
                ih = img.naturalHeight;
            var width = options.width,
                height = options.height;
            var ctx = canvas.getContext('2d');
            ctx.save();
            transformCoordinate(canvas, ctx, width, height, options.orientation);
            var subsampled = detectSubsampling(img);
            if (subsampled) {
                iw /= 2;
                ih /= 2;
            }
            var d = 1024; // size of tiling canvas
            var tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = tmpCanvas.height = d;
            var tmpCtx = tmpCanvas.getContext('2d');
            var vertSquashRatio = doSquash ? detectVerticalSquash(img, iw, ih) : 1;
            var dw = Math.ceil(d * width / iw);
            var dh = Math.ceil(d * height / ih / vertSquashRatio);
            var sy = 0;
            var dy = 0;
            while (sy < ih) {
                var sx = 0;
                var dx = 0;
                while (sx < iw) {
                    tmpCtx.clearRect(0, 0, d, d);
                    tmpCtx.drawImage(img, -sx, -sy);
                    ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh);
                    sx += d;
                    dx += dw;
                }
                sy += d;
                dy += dh;
            }
            ctx.restore();
            tmpCanvas = tmpCtx = null;
        }

        /**
         * Transform canvas coordination according to specified frame size and orientation
         * Orientation value is from EXIF tag
         */
        function transformCoordinate(canvas, ctx, width, height, orientation) {
            switch (orientation) {
                case 5:
                case 6:
                case 7:
                case 8:
                    canvas.width = height;
                    canvas.height = width;
                    break;
                default:
                    canvas.width = width;
                    canvas.height = height;
            }
            switch (orientation) {
                case 2:
                    // horizontal flip
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    break;
                case 3:
                    // 180 rotate left
                    ctx.translate(width, height);
                    ctx.rotate(Math.PI);
                    break;
                case 4:
                    // vertical flip
                    ctx.translate(0, height);
                    ctx.scale(1, -1);
                    break;
                case 5:
                    // vertical flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.scale(1, -1);
                    break;
                case 6:
                    // 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(0, -height);
                    break;
                case 7:
                    // horizontal flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(width, -height);
                    ctx.scale(-1, 1);
                    break;
                case 8:
                    // 90 rotate left
                    ctx.rotate(-0.5 * Math.PI);
                    ctx.translate(-width, 0);
                    break;
                default:
                    break;
            }
        }


        /**
         * MegaPixImage class
         */
        function MegaPixImage(srcImage) {
            if (window.Blob && srcImage instanceof Blob) {
                var img = new Image();
                var URL = window.URL && window.URL.createObjectURL ? window.URL :
                    window.webkitURL && window.webkitURL.createObjectURL ? window.webkitURL :
                    null;
                if (!URL) {
                    throw Error("No createObjectURL function found to create blob url");
                }
                img.src = URL.createObjectURL(srcImage);
                this.blob = srcImage;
                srcImage = img;
            }
            if (!srcImage.naturalWidth && !srcImage.naturalHeight) {
                var _this = this;
                srcImage.onload = function() {
                    var listeners = _this.imageLoadListeners;
                    if (listeners) {
                        _this.imageLoadListeners = null;
                        for (var i = 0, len = listeners.length; i < len; i++) {
                            listeners[i]();
                        }
                    }
                };
                this.imageLoadListeners = [];
            }
            this.srcImage = srcImage;
        }

        /**
         * Rendering megapix image into specified target element
         */
        MegaPixImage.prototype.render = function(target, options) {
            if (this.imageLoadListeners) {
                var _this = this;
                this.imageLoadListeners.push(function() {
                    _this.render(target, options)
                });
                return;
            }
            options = options || {};
            var imgWidth = this.srcImage.naturalWidth,
                imgHeight = this.srcImage.naturalHeight,
                width = options.width,
                height = options.height,
                maxWidth = options.maxWidth,
                maxHeight = options.maxHeight,
                doSquash = !this.blob || this.blob.type === 'image/jpeg';
            if (width && !height) {
                height = (imgHeight * width / imgWidth) << 0;
            } else if (height && !width) {
                width = (imgWidth * height / imgHeight) << 0;
            } else {
                width = imgWidth;
                height = imgHeight;
            }
            if (maxWidth && width > maxWidth) {
                width = maxWidth;
                height = (imgHeight * width / imgWidth) << 0;
            }
            if (maxHeight && height > maxHeight) {
                height = maxHeight;
                width = (imgWidth * height / imgHeight) << 0;
            }
            var opt = {
                width: width,
                height: height
            };
            for (var k in options) opt[k] = options[k];

            var tagName = target.tagName.toLowerCase();
            if (tagName === 'img') {
                target.src = renderImageToDataURL(this.srcImage, opt, doSquash);
            } else if (tagName === 'canvas') {
                renderImageToCanvas(this.srcImage, target, opt, doSquash);
            }
            if (typeof this.onrender === 'function') {
                this.onrender(target);
            }
        };

        return MegaPixImage;

    })();

})(this.jQuery || this.Zepto, this);