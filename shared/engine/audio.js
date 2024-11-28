
export function createAudio() {

    document.addEventListener('touchstart', async () => {

        var a = getAudioContext()
        if (a.state === "suspended")
            await a.resume() // fix audio on iOS

    }, { capture: true }); // add a dummy listener to fix touch in iframes on iOS

    return {
        play: () => {
            // TO DO
        }
    }
}
