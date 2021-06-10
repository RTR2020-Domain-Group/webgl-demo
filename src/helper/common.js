const PI_180 = Math.PI / 180.0;

function toRadians(angle) {
    return angle * PI_180;
}

// flat array of mat4 into float array
function flat(arr) {
    var a = [];
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < 16; j++)
            a.push(arr[i][j]);
    }
    return a;
}

// load texture
function loadTexture(img) {
    let tex = gl.createTexture();
    tex.image = new Image();
    tex.image.src = img;
    tex.image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    return tex;
}

// create framebuffer with one color and one depth attachment
function createFramebuffer(width, height) {
    var fb = {};

    fb.FBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.FBO);

    fb.texColor = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fb.texColor);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fb.texColor, 0);

    fb.texDepth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, fb.texDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, fb.texDepth);
    var attachments = [gl.COLOR_ATTACHMENT0];
    gl.drawBuffers(attachments);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        alert('Framebuffer failed' + gl.checkFramebufferStatus(gl.FRAMEBUFFER));
        return null;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return fb;
}
