// global variables
var canvas = null;
var gl = null; // WebGL context
var bFullscreen = false;
var canvas_original_height;
var canvas_original_width;

var prevMouseX = 0,
    prevMouseY = 0;
var mouseX = 0,
    mouseY = 0;
var firstMouse = true;
var mouseClicked = false;
var spaceKeyPressed = false;
var audioWAV;
var frameCount = 1;

// all inside this are const, as this is const
const WebGLMacros = {
    AMC_ATTRIBUTE_VERTEX: 0,
    AMC_ATTRIBUTE_COLOR: 1,
    AMC_ATTRIBUTE_NORMAL: 2,
    AMC_ATTRIBUTE_TEXCOORD0: 3,
    AMC_ATTRIBUTE_BONEIDS: 4,
    AMC_ATTRIBUTE_BONEWEIGHTS: 5,
};

// to start animation: to have requestAnimatiomFrame() to be called "cross-browser" compatible
var requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequsetAnimationFrame ||
    window.mozRequestAnumationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnumationFrame ||
    null;

// to stop animation: to have cancelAnimationFrame() to be called "cross-browser" compatible
var cancelAnimationFrame =
    window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.msCancelAnimationFrame ||
    null;

// onload function
function main() {
    // get canvas element
    canvas = document.getElementById("AMC");
    if (!canvas) console.log("Obtaining canvas failed..");
    else console.log("Obtaining canvas successful..");

    canvas_original_width = canvas.width;
    canvas_original_height = canvas.height;

    // register keyboard's keydown event handler
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("resize", resize, false);
    window.addEventListener("mousemove", mouseMove, false);
    window.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mouseup", mouseUp, false);

    // initialize WebGL
    init();

    // start drawing here as warming-up
    resize();
    draw();
}

function toggleFullsreen() {
    // code
    var fullscreen_element =
        document.fullscreenElement ||
        document.webkitFullscreen ||
        document.mozFullScreenElement ||
        document.msFullscreen ||
        null;

    // if not fullscreen
    if (fullscreen_element == null) {
        if (canvas.requestFullscreen) canvas.requestFullscreen();
        else if (canvas.mozRequestFullScreen) canvas.mozRequestFullScreen();
        else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();
        else if (canvas.msRequestFullscreen) canvas.msRequestFullscreen();
        bFullscreen = true;
    } else {
        // if already fullscreen
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        bFullscreen = false;
    }
}

function init() {
    // code
    // get WebGL 2.0 context
    gl = canvas.getContext("webgl2");
    if (gl == null) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    // set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // enable depth
    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // init all shaders
    if (!initShaders()) {
        console.log("initShaders() failed...");
    }

    //audio
    audioWAV = document.createElement("audio");
    audioWAV.src = "res/audio/SarJoTeraChakraye.wav";
    //audioWAV.play();

    // add scenes
    addScene(sceneIntro);
    addScene(sceneOne);
    addScene(sceneCredits);

    // init all scenes
    initScenes();

    // init camera
    camera.init(
        vec3.fromValues(-3.28, 8.06, -22.98),
        vec3.fromValues(0.0, 1.0, 0.0),
        vec3.fromValues(0.25, -0.11, 0.96),
        75.00, 0.0);

    // initialize projection matrix
    perspectiveProjectionMatrix = mat4.create();
}

function resize() {
    // code
    if (bFullscreen == true) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log("full with " + canvas.width + " " + canvas.height);
    } else {
        canvas.width = canvas_original_width;
        canvas.height = canvas_original_height;
    }

    console.log("resize with " + canvas.width + " " + canvas.height);

    // set the viewport to match
    gl.viewport(0, 0, canvas.width, canvas.height);

    resizeScenes();
}

function draw() {
    // code
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (spaceKeyPressed == true) {
        Scene.scenes[Scene.idx].display();
        // animation loop
        update();
        frameCount++;
    }
    requestAnimationFrame(draw, canvas);
}

function update() {
    if (Scene.scenes[Scene.idx].update()) {
        if (!nextScene()) {
            uninitialize();
        }
    }
}

function uninitialize() {
    // uninit all scenes
    uninitScenes();

    // uninit all shaders
    uninitShaders();

    window.close();
}

function keyDown(event) {
    // code
    console.log("Key", event.key, event.keyCode);
    switch (event.keyCode) {
        case 27: // escape
            uninitialize();
            // close application's tab
            window.close(); // may not work in firefox
            break;

        case 70: // for 'F' and 'f'
            toggleFullsreen();
            break;

        case 76: // for 'L' and 'l'
            camera.print();
            break;

        case 32:  //for space (demo begin)
            if (spaceKeyPressed == false) {
                spaceKeyPressed = true;
                audioWAV.play();
            }
            else {
                spaceKeyPressed = false;
                audioWAV.pause();
            }
            break;

        // camera movements
        case 87:
        case 38:
            camera.processKeyboard(FORWARD);
            break;

        case 65:
        case 37:
            camera.processKeyboard(LEFT);
            break;

        case 68:
        case 39:
            camera.processKeyboard(RIGHT);
            break;

        case 83:
        case 40:
            camera.processKeyboard(BACKWARD);
            break;
    }
}

function mouseDown(event) {
    // code
    mouseClicked = true;
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
    console.log("mouse down");
}

function mouseUp() {
    // code
    console.log("mouse up");
    mouseClicked = false;
}

function mouseMove(event) {
    if (mouseClicked == true) {
        mouseX = event.clientX;
        mouseY = event.clientY;

        if (firstMouse) {
            prevMouseX = mouseX;
            prevMouseY = mouseY;
            firstMouse = false;
        }

        camera.processMouse(mouseX - prevMouseX, mouseY - prevMouseY);
        prevMouseX = event.clientX;
        prevMouseY = event.clientY;
    }
}
