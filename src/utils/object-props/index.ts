export function getObjectProps<T extends object, const P extends keyof T>(object: T, propNames: P[]): Pick<T, P> {
    const props = {} as Pick<T, P>;

    for (const propName of propNames) {
        props[propName] = object[propName];
    }

    return props;
}

export function setObjectProps<T extends object>(object: T, props: Partial<T>): void {
    for (const key in props) {
        (object as any)[key] = props[key];
    }
}
