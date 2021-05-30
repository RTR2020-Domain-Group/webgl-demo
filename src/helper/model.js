function getTimeFraction(times, dt) {
    var segment = 0;
    while (dt > times[segment]) {
        segment++;

        // if the animation is longer than last keyframe just render the last 
        // keyframe for rest of the animation time
        if (segment == times.length) {
            segment--;
            // frac is hardcoded to 1.0 as we have already passed the last
            // timestamp of last keyframe, so clamping to 1.0 will avoid
            // unnecessary extrapolation
            return [segment, 1.0];
        }
    }

    segment = segment > 0 ? segment : 1;

    var start = times[segment - 1];
    var end = times[segment];
    var frac = (dt - start) / (end - start);
    return [segment, frac];
}

// resolve position for model at given time
// returns pose matrix array
function getPose(animData, skeleton, time, parentTransform, globalInverseTransform, output) {

    var btt = animData[skeleton.name];
    var dt = time % animData.duration;

    var globalTransform = parentTransform;

    if (btt.positions.length != 0) {
        // calculate interpolated position
        var fp = getTimeFraction(btt.positionsTime, dt);
        var position1 = btt.positions[fp[0] - 1];
        var position2 = btt.positions[fp[0]];
        var position = vec3.create();
        vec3.lerp(position, position1, position2, fp[1]);

        // calculate interpolated rotation
        fp = getTimeFraction(btt.rotationsTime, dt);
        var rotation1 = btt.rotations[fp[0] - 1];
        var rotation2 = btt.rotations[fp[0]];
        var rotation = quat.create();
        quat.slerp(rotation, rotation1, rotation2, fp[1]);

        // calculate interpolated scale
        fp = getTimeFraction(btt.scalesTime, dt);
        var scale1 = btt.scales[fp[0] - 1];
        var scale2 = btt.scales[fp[0]];
        var scale = vec3.create();
        vec3.lerp(scale, scale1, scale2, fp[1]);

        var localTransform = mat4.create();
        mat4.fromRotationTranslationScale(localTransform, rotation, position, scale);

        mat4.multiply(globalTransform, parentTransform, localTransform);
    }

    var m = mat4.create();
    mat4.multiply(m, globalInverseTransform, globalTransform);
    mat4.multiply(m, m, skeleton.offset);

    output[skeleton.id] = m;

    // update value for child bones
    for (var i = 0; i < skeleton.childs.length; i++) {
        getPose(animData, skeleton.childs[i], dt, globalTransform, globalInverseTransform, output);
    }
}
