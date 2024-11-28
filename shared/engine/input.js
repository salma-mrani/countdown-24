

export function createInput(pixelRatio) {

    let inputX = 0
    let inputY = 0
    let isPressed = false;
    let inputStarted = false;
    const options = {

    }
    window.addEventListener("mousedown", e => {

        isPressed = true;
    }, options)
    window.addEventListener("mouseup", e => {

        isPressed = false;
    }, options)
    window.addEventListener("mouseenter", e => {

        inputX = e.clientX
        inputY = e.clientY
        inputStarted = true
    }, options)
    window.addEventListener("mousemove", e => {

        inputX = e.clientX
        inputY = e.clientY
        inputStarted = true
    }, options)

    return {
        getX: () => inputX * pixelRatio,
        getY: () => inputY * pixelRatio,
        isPressed: () => isPressed,
        hasStarted: () => inputStarted
    }
}