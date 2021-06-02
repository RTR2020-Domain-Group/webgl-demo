// init all shaders
function initShaders() {
    if (!PBRshader.init()) return false;

    return true;
}

// uninit all shaders
function uninitShaders() {
    PBRshader.uninit();
}
