var Scene = {
    scenes: [],
    idx: 0,
};

function addScene(scene) {
    Scene.scenes.push(scene);
}

function initScenes() {
    for (let index = 0; index < Scene.scenes.length; index++) {
        Scene.scenes[index].init();
    }
}

function uninitScenes() {
    for (let index = 0; index < Scene.scenes.length; index++) {
        Scene.scenes[index].uninit();
    }
}

function nextScene() {
    if (Scene.idx < Scene.scenes.length - 1) {
        Scene.idx = Scene.idx + 1;
    }
}

function prevScene() {
    if (Scene.idx > 0) {
        Scene.idx = Scene.idx - 1;
    }
}

