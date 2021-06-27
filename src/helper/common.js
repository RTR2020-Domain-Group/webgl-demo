const { vec2, vec3, mat3, mat4, quat } = glMatrix;
const PI_180 = Math.PI / 180.0;
const DEPTH_MAP_SIZE = 2048;

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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
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

function createShadowFramebuffer() {
    var fb = {};

    fb.FBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.FBO);

    fb.texDepth = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fb.texDepth);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, DEPTH_MAP_SIZE, DEPTH_MAP_SIZE, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, fb.texDepth, 0);
    gl.drawBuffers([gl.NONE]);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        alert('Shadow Framebuffer failed ' + gl.checkFramebufferStatus(gl.FRAMEBUFFER));
        return null;
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return fb;
}

function createNoiseTexture() {
    var w = 1024;
    var noiseTex = new Uint8Array(w * w * 4);
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < w; j++) {
            var c = Math.random() * 255;
            noiseTex[((i * w) + j) * 4 + 0] = Math.max(200, c);
            noiseTex[((i * w) + j) * 4 + 1] = Math.max(200, c);
            noiseTex[((i * w) + j) * 4 + 2] = Math.max(200, c);
            noiseTex[((i * w) + j) * 4 + 3] = 255;
        }
    }

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, w, 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseTex);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return tex;
}
