
export function createRenderer(pixelRatio) {

    const canvas = document.createElement("canvas")

    const ctx = canvas.getContext("2d")

    function resize() {

        const h = canvas.clientHeight * pixelRatio
        const w = canvas.clientWidth * pixelRatio
        if (h != canvas.height ||
            w != canvas.width
        ) {
            canvas.width = w
            canvas.height = h
        }
    }


    return {
        canvas,
        ctx,
        resize
    }
}


