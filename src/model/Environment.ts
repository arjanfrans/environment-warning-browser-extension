import { EnvironmentTypeEnum } from "./EnvironmentTypeEnum"

export class Environment {
    constructor(public readonly pattern: string, public readonly type: EnvironmentTypeEnum) {}

    public getExpression(): RegExp {
        return new RegExp(this.pattern.replace("*", ".+"))
    }

    public matches(url: string): boolean {
        if (url.startsWith(this.pattern)) {
            return true
        }

        const matches = url.match(this.getExpression())

        return (matches && matches[0] && matches[0] !== "") || false
    }

    static fromObject(object: { pattern: string; type: string }): Environment {
        return new Environment(object.pattern, object.type as EnvironmentTypeEnum)
    }
}
