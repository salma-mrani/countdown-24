
export function createLoop(func) {

    let lastTime = 0
    let handle = undefined
    function update(time) {

        handle = requestAnimationFrame(update)

        const deltaTime = (time - lastTime) / 1000

        func(deltaTime);

        lastTime = time
    }
    handle = requestAnimationFrame(update)

    function stop() {

        cancelAnimationFrame(handle)
        handle = undefined
    }

    return {
        stop,

    }
}