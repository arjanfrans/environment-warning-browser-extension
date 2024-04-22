export async function getModifiedFavicon(url: string, color: string, width = 32, height = 32): Promise<string> {
    const resultCanvas = document.createElement("canvas") as HTMLCanvasElement
    const imageCanvas = document.createElement("canvas") as HTMLCanvasElement

    resultCanvas.width = width
    resultCanvas.height = height

    imageCanvas.width = width
    imageCanvas.height = height

    const resultCtx = resultCanvas.getContext("2d") as CanvasRenderingContext2D
    const imageCtx = imageCanvas.getContext("2d") as CanvasRenderingContext2D
    const original = new Image()

    original.src = url
    original.crossOrigin = "Anonymous"

    return new Promise((resolve, reject) => {
        original.onload = () => {
            original.width = width
            original.height = height

            imageCtx.drawImage(original, 0, 0)

            resultCtx.putImageData(imageCtx.getImageData(0, 0, width, height), 0, 0)
            resultCtx.globalAlpha = 0.4
            resultCtx.globalCompositeOperation = "color-burn"
            resultCtx.lineWidth = 6
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
