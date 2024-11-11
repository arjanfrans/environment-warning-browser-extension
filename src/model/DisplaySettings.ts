import { TextPositionEnum } from "./TextPositionEnum"

export class DisplaySettings {
    constructor(public readonly textPosition: TextPositionEnum, public readonly opacity: number) {}

    static fromObject(object: { textPosition?: string; opacity?: number }): DisplaySettings {
        object.textPosition = object.textPosition || TextPositionEnum.Center
        object.opacity = object.opacity === undefined || object.opacity === null ? 50 : object.opacity

        return new DisplaySettings(object.textPosition as TextPositionEnum, object.opacity)
    }
}
