const PI_180 = Math.PI / 180.0;

function toRadians(angle) {
    return angle * PI_180;
}

// flat array of mat4 into float array
function flat(arr) {
    var a = [];
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0 ; j < 16; j++)
            a.push(arr[i][j]);
    }
    return a;
}
