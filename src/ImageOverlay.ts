export async function getModifiedFavicon(url: string, color: string): Promise<string> {
    const resultCanvas = document.createElement("canvas") as HTMLCanvasElement
    const imageCanvas = document.createElement("canvas") as HTMLCanvasElement

    resultCanvas.width = 32
    resultCanvas.height = 32

    imageCanvas.width = 32
    imageCanvas.height = 32

    const resultCtx = resultCanvas.getContext("2d") as CanvasRenderingContext2D
    const imageCtx = imageCanvas.getContext("2d") as CanvasRenderingContext2D
    const original = new Image()

    original.src = url

    return new Promise((resolve, reject) => {
        original.onload = () => {
            original.width = 32
            original.height = 32

            imageCtx.drawImage(original, 0, 0)

            resultCtx.putImageData(imageCtx.getImageData(0, 0, 32, 32), 0, 0)
            resultCtx.globalAlpha = 0.2
            resultCtx.globalCompositeOperation = "color"
            resultCtx.lineWidth = 14
            resultCtx.strokeStyle = color
            resultCtx.strokeRect(0, 0, resultCanvas.width, resultCanvas.height)

            resultCtx.globalAlpha = 1

            resolve(resultCanvas.toDataURL("image/png"))
        }

        original.onerror = (err) => {
            reject(err)
        }
    })
}

//
// var original = new Image();
// var overlay = new Image();
// original.onload = overlay.onload = onload;
// original.src = "https://i.stack.imgur.com/vIKpI.png";
// overlay.src = "https://i.stack.imgur.com/10Tre.png";
//
// // list of blending modes.
// // Note that destination-over is a composite mode,
// //    which place the new drawings behind the already-there ones
// var currentMode = 0;
// var modes = ["destination-over", "lighter", "multiply", "screen", "overlay", "darken",
//   "lighten", "color-dodge", "color-burn", "hard-light", "soft-light",
//   "exclusion", "hue", "saturation", "color", "luminosity"];
//
// function draw() {
//   // switch between different Blending modes
//   var mode = modes[currentMode];
//   currentMode = (currentMode + 1) % (modes.length);
//   // clear previous
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   // draw our overlay
//   ctx.drawImage(overlay, 0, 0);
//   // this will keep new drawings only where we already have existing pixels
//   ctx.globalCompositeOperation = "source-atop";
//   ctx.fillStyle = "red";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   // now choose between the list of blending modes
//   ctx.globalCompositeOperation = mode;
//   // draw our original image
//   ctx.drawImage(original, 0, 0);
//   // go back to default
//   ctx.globalCompositeOperation = "source-over";
//   // just so we can know which one is shown
//   ctx.fillStyle = "black";
//   ctx.fillText(mode, 40, 40);
//   // do it again
//   setTimeout(draw, 1000);
//
// }
