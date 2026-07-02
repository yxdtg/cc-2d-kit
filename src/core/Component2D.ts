import {
    Collider2D,
    Color,
    Component,
    Contact2DType,
    director,
    DirectorEvent,
    EventKeyboard,
    EventMouse,
    EventTouch,
    Input,
    input,
    js,
    KeyCode,
    math,
    Node,
    NodeEventType,
    PhysicsSystem2D,
    UIRenderer,
    UITransform,
    Vec2,
    Vec3,
    type IPhysics2DContact,
} from "cc";

/**
 * 鼠标键
 */
export const MOUSE_BUTTON = {
    /**
     * 鼠标左键
     */
    Left: 0,
    /**
     * 鼠标中键
     */
    Middle: 1,
    /**
     * 鼠标右键
     */
    Right: 2,
} as const;
export type MOUSE_BUTTON = (typeof MOUSE_BUTTON)[keyof typeof MOUSE_BUTTON];

export class Component2D extends Component {
    private static _initd = false;
    private static _init(): void {
        if (this._initd) return;

        this._initd = true;

        director.on(DirectorEvent.AFTER_UPDATE, this._onAfterUpdate, this);

        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);

        input.on(Input.EventType.MOUSE_DOWN, this._onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this._onMouseUp, this);
        input.on(Input.EventType.MOUSE_WHEEL, this._onMouseWheel, this);

        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchCancel, this);

        if (PhysicsSystem2D !== undefined && PhysicsSystem2D.instance) {
            PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
            PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this._onEndContact, this);
            PhysicsSystem2D.instance.on(Contact2DType.PRE_SOLVE, this._onPreSolve, this);
            PhysicsSystem2D.instance.on(Contact2DType.POST_SOLVE, this._onPostSolve, this);
        }
    }

    private static _onAfterUpdate(): void {
        this._keyDownCodeSet.clear();
        this._keyUpCodeSet.clear();

        this._mouseButtonDownSet.clear();
        this._mouseButtonUpSet.clear();

        this._touchIdDownSet.clear();
        this._touchIdUpSet.clear();
    }

    /*----------------------------------- 按键 -----------------------------------*/
    private static _keyDownCodeSet = new Set<KeyCode>();
    private static _keyHoldCodeSet = new Set<KeyCode>();
    private static _keyUpCodeSet = new Set<KeyCode>();

    private static _globalKeyboardEventComponent2DSet = new Set<Component2D>();
    private static _addToGlobalKeyboardEventComponent2DSet(component2D: Component2D): void {
        this._globalKeyboardEventComponent2DSet.add(component2D);
    }
    private static _deleteFromGlobalKeyboardEventComponent2DSet(component2D: Component2D): void {
        this._globalKeyboardEventComponent2DSet.delete(component2D);
    }

    private static _onKeyDown(event: EventKeyboard): void {
        this._keyDownCodeSet.add(event.keyCode);
        this._keyHoldCodeSet.add(event.keyCode);

        for (const component2D of this._globalKeyboardEventComponent2DSet) {
            component2D.onGlobalKeyDown?.(event);
        }
    }
    private static _onKeyUp(event: EventKeyboard): void {
        this._keyDownCodeSet.delete(event.keyCode);
        this._keyHoldCodeSet.delete(event.keyCode);
        this._keyUpCodeSet.add(event.keyCode);

        for (const component2D of this._globalKeyboardEventComponent2DSet) {
            component2D.onGlobalKeyUp?.(event);
        }
    }

    /*----------------------------------- 鼠标 -----------------------------------*/
    private static _mouseLocation = new Vec2();
    private static _mouseLocationV3 = new Vec3();

    private static _mouseUILocation = new Vec2();
    private static _mouseUILocationV3 = new Vec3();

    private static _updateMouseLocation(event: EventMouse | EventTouch): void {
        this._mouseLocation.set(event.getLocation());
        this._mouseLocationV3.set(this._mouseLocation.x, this._mouseLocation.y);

        this._mouseUILocation.set(event.getUILocation());
        this._mouseUILocationV3.set(this._mouseUILocation.x, this._mouseUILocation.y);
    }

    private static _mouseButtonDownSet = new Set<number>();
    private static _mouseButtonHoldSet = new Set<number>();
    private static _mouseButtonUpSet = new Set<number>();

    private static _globalMouseComponent2DSet = new Set<Component2D>();
    private static _addToGlobalMouseComponent2DSet(component2D: Component2D): void {
        this._globalMouseComponent2DSet.add(component2D);
    }
    private static _deleteFromGlobalMouseComponent2DSet(component2D: Component2D): void {
        this._globalMouseComponent2DSet.delete(component2D);
    }

    private static _onMouseDown(event: EventMouse): void {
        const button = event.getButton();
        this._mouseButtonDownSet.add(button);
        this._mouseButtonHoldSet.add(button);

        this._updateMouseLocation(event);

        for (const component2D of this._globalMouseComponent2DSet) {
            component2D.onGlobalMouseDown?.(event);
        }
    }
    private static _onMouseMove(event: EventMouse): void {
        this._updateMouseLocation(event);

        for (const component2D of this._globalMouseComponent2DSet) {
            component2D.onGlobalMouseMove?.(event);
        }
    }
    private static _onMouseUp(event: EventMouse): void {
        const button = event.getButton();
        this._mouseButtonDownSet.delete(button);
        this._mouseButtonHoldSet.delete(button);
        this._mouseButtonUpSet.add(button);

        this._updateMouseLocation(event);

        for (const component2D of this._globalMouseComponent2DSet) {
            component2D.onGlobalMouseUp?.(event);
        }
    }
    private static _onMouseWheel(event: EventMouse): void {
        for (const component2D of this._globalMouseComponent2DSet) {
            component2D.onGlobalMouseWheel?.(event);
        }
    }

    /*----------------------------------- 触摸 -----------------------------------*/
    private static _touchIdDownSet = new Set<number>();
    private static _touchIdHoldSet = new Set<number>();
    private static _touchIdUpSet = new Set<number>();

    private static _globalTouchEventComponent2DSet = new Set<Component2D>();
    private static _addToGlobalTouchEventComponent2DSet(component2D: Component2D): void {
        this._globalTouchEventComponent2DSet.add(component2D);
    }
    private static _deleteFromGlobalTouchEventComponent2DSet(component2D: Component2D): void {
        this._globalTouchEventComponent2DSet.delete(component2D);
    }

    private static _onTouchStart(event: EventTouch): void {
        const touchId = event.getID();
        if (touchId !== null) {
            this._touchIdDownSet.add(touchId);
            this._touchIdHoldSet.add(touchId);
        }

        this._updateMouseLocation(event);

        for (const component2D of this._globalTouchEventComponent2DSet) {
            component2D.onGlobalTouchStart?.(event);
        }
    }
    private static _onTouchMove(event: EventTouch): void {
        this._updateMouseLocation(event);

        for (const component2D of this._globalTouchEventComponent2DSet) {
            component2D.onGlobalTouchMove?.(event);
        }
    }
    private static _onTouchEnd(event: EventTouch): void {
        const touchId = event.getID();
        if (touchId !== null) {
            this._touchIdDownSet.delete(touchId);
            this._touchIdHoldSet.delete(touchId);
            this._touchIdUpSet.add(touchId);
        }

        this._updateMouseLocation(event);

        for (const component2D of this._globalTouchEventComponent2DSet) {
            component2D.onGlobalTouchEnd?.(event);
        }
    }
    private static _onTouchCancel(event: EventTouch): void {
        const touchId = event.getID();
        if (touchId !== null) {
            this._touchIdDownSet.delete(touchId);
            this._touchIdHoldSet.delete(touchId);
            this._touchIdUpSet.add(touchId);
        }

        this._updateMouseLocation(event);

        for (const component2D of this._globalTouchEventComponent2DSet) {
            component2D.onGlobalTouchCancel?.(event);
        }
    }

    /*----------------------------------- 碰撞 -----------------------------------*/
    private static _collisionEventNodeToComponent2DSetWeakMap = new WeakMap<Node, Set<Component2D>>();
    private static _getCollisionEventNodeComponent2DSetWeakMap(node: Node) {
        return this._collisionEventNodeToComponent2DSetWeakMap.get(node);
    }
    private static _addToCollisionEventNodeComponent2DSetWeakMap(component2D: Component2D): void {
        let component2DSet = this._collisionEventNodeToComponent2DSetWeakMap.get(component2D.node);
        if (component2DSet === undefined) {
            component2DSet = new Set<Component2D>();
            this._collisionEventNodeToComponent2DSetWeakMap.set(component2D.node, component2DSet);
        }

        component2DSet.add(component2D);
    }
    private static _deleteFromCollisionEventNodeComponent2DSetWeakMap(component2D: Component2D): void {
        const component2DSet = this._collisionEventNodeToComponent2DSetWeakMap.get(component2D.node);
        component2DSet?.delete(component2D);
    }

    private static _onBeginContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {
        const selfColliderComponent2DSet = this._getCollisionEventNodeComponent2DSetWeakMap(selfCollider.node);
        if (selfColliderComponent2DSet !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2DSet) {
                selfColliderComponent2D.onBeginContact?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2DSet = this._getCollisionEventNodeComponent2DSetWeakMap(otherCollider.node);
        if (otherColliderComponent2DSet !== undefined) {
            for (const otherColliderComponent2D of otherColliderComponent2DSet) {
                otherColliderComponent2D.onBeginContact?.(otherCollider, selfCollider, contact);
            }
        }
    }
    private static _onEndContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {
        const selfColliderComponent2DSet = this._getCollisionEventNodeComponent2DSetWeakMap(selfCollider.node);
        if (selfColliderComponent2DSet !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2DSet) {
                selfColliderComponent2D.onEndContact?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2DSet = this._getCollisionEventNodeComponent2DSetWeakMap(otherCollider.node);
        if (otherColliderComponent2DSet !== undefined) {
            for (const otherColliderComponent2D of otherColliderComponent2DSet) {
                otherColliderComponent2D.onEndContact?.(otherCollider, selfCollider, contact);
            }
        }
    }
    private static _onPreSolve(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {
        const selfColliderComponent2DSet = this._getCollisionEventNodeComponent2DSetWeakMap(selfCollider.node);
        if (selfColliderComponent2DSet !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2DSet) {
                selfColliderComponent2D.onPreSolve?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2DSet = this._getCollisionEventNodeComponent2DSetWeakMap(otherCollider.node);
        if (otherColliderComponent2DSet !== undefined) {
            for (const otherColliderComponent2D of otherColliderComponent2DSet) {
                otherColliderComponent2D.onPreSolve?.(otherCollider, selfCollider, contact);
            }
        }
    }
    private static _onPostSolve(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {
        const selfColliderComponent2DSet = this._getCollisionEventNodeComponent2DSetWeakMap(selfCollider.node);
        if (selfColliderComponent2DSet !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2DSet) {
                selfColliderComponent2D.onPostSolve?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2DSet = this._getCollisionEventNodeComponent2DSetWeakMap(otherCollider.node);
        if (otherColliderComponent2DSet !== undefined) {
            for (const otherColliderComponent2D of otherColliderComponent2DSet) {
                otherColliderComponent2D.onPostSolve?.(otherCollider, selfCollider, contact);
            }
        }
    }

    /*----------------------------------- 缓存 -----------------------------------*/
    private static _nodeToComponentNameToCacheComponentMapWeakMap = new WeakMap<Node, Map<string, Component>>();

    private static _getCacheComponent<T extends Component>(
        node: Node,
        componentConstructor: ComponentConstructor<T>
    ): T | null;
    private static _getCacheComponent<T extends Component>(node: Node, componentName: string): T | null;
    private static _getCacheComponent<T extends Component>(
        node: Node,
        componentConstructorOrComponentName: ComponentConstructor<T> | string
    ): T | null {
        const componentName =
            typeof componentConstructorOrComponentName === "string"
                ? componentConstructorOrComponentName
                : js.getClassName(componentConstructorOrComponentName);

        let componentNameToCacheComponentMap = this._nodeToComponentNameToCacheComponentMapWeakMap.get(node);
        if (componentNameToCacheComponentMap === undefined) {
            componentNameToCacheComponentMap = new Map<string, Component>();
            this._nodeToComponentNameToCacheComponentMapWeakMap.set(node, componentNameToCacheComponentMap);
        }

        const cacheComponent = componentNameToCacheComponentMap.get(componentName);
        if (cacheComponent !== undefined) {
            return cacheComponent as T;
        }

        const component = node.getComponent(componentName);
        if (component !== null) {
            componentNameToCacheComponentMap.set(componentName, component);
            return component as T;
        }

        return null;
    }

    private static _deleteCacheComponent(node: Node, componentName: string): void {
        const componentNameToCacheComponentMap = this._nodeToComponentNameToCacheComponentMapWeakMap.get(node);
        if (componentNameToCacheComponentMap === undefined) return;

        componentNameToCacheComponentMap.delete(componentName);
    }

    /*----------------------------------- 方法 -----------------------------------*/

    /**
     * 批量设置对象属性
     * @param props 属性键值对
     */
    private static _setObjectProps<T extends object>(object: T, props: Partial<T>): T {
        for (const key in props) {
            (object as any)[key] = props[key];
        }

        return object;
    }

    /*----------------------------------- 实例 -----------------------------------*/

    private _uiTransform: UITransform = null!;
    /**
     * UITransform组件
     */
    public get uiTransform() {
        return this._uiTransform;
    }

    /**
     * @internal
     */
    public _register(): void {
        Component2D._init();

        this._tryGetUITransform();

        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.GlobalKeyboard)) {
            Component2D._addToGlobalKeyboardEventComponent2DSet(this);
        }
        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.GlobalMouse)) {
            Component2D._addToGlobalMouseComponent2DSet(this);
        }
        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.GlobalTouch)) {
            Component2D._addToGlobalTouchEventComponent2DSet(this);
        }
        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.Collision)) {
            Component2D._addToCollisionEventNodeComponent2DSetWeakMap(this);
        }

        this._registerEvents();
    }

    /**
     * @internal
     */
    public _unregister(): void {
        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.GlobalKeyboard)) {
            Component2D._deleteFromGlobalKeyboardEventComponent2DSet(this);
        }
        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.GlobalMouse)) {
            Component2D._deleteFromGlobalMouseComponent2DSet(this);
        }
        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.GlobalTouch)) {
            Component2D._deleteFromGlobalTouchEventComponent2DSet(this);
        }
        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.Collision)) {
            Component2D._deleteFromCollisionEventNodeComponent2DSetWeakMap(this);
        }

        this._unregisterEvents();
    }

    /*----------------------------------- 初始化 -----------------------------------*/
    private _registerEvents(): void {
        this.node.on(NodeEventType.COMPONENT_ADDED, this._onComponentAdded, this);
        this.node.on(NodeEventType.COMPONENT_REMOVED, this._onComponentRemoved, this);

        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.Mouse)) {
            if (this.onMouseDown) {
                this.node.on(NodeEventType.MOUSE_DOWN, this.onMouseDown, this);
            }
            if (this.onMouseMove) {
                this.node.on(NodeEventType.MOUSE_MOVE, this.onMouseMove, this);
            }
            if (this.onMouseUp) {
                this.node.on(NodeEventType.MOUSE_UP, this.onMouseUp, this);
            }
            if (this.onMouseWheel) {
                this.node.on(NodeEventType.MOUSE_WHEEL, this.onMouseWheel, this);
            }
            if (this.onMouseEnter) {
                this.node.on(NodeEventType.MOUSE_ENTER, this.onMouseEnter, this);
            }
            if (this.onMouseLeave) {
                this.node.on(NodeEventType.MOUSE_LEAVE, this.onMouseLeave, this);
            }
        }
        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.Touch)) {
            if (this.onTouchStart) {
                this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
            }
            if (this.onTouchMove) {
                this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
            }
            if (this.onTouchEnd) {
                this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
            }
            if (this.onTouchCancel) {
                this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this);
            }
        }
    }

    private _tryGetUITransform(): void {
        const uiTransform = this.getComponent(UITransform);
        if (uiTransform === null) {
            throw new Error("Component2D所属的节点不存在UITransform");
        }
        this._uiTransform = uiTransform;
    }

    private _onComponentAdded(component: Component): void {
        if (this._uiRenderer === null) {
            if (component instanceof UIRenderer) {
                this._uiRenderer = component;
                this._applyColor();
            }
        }
    }
    private _onComponentRemoved(component: Component): void {
        if (this._uiRenderer === component) {
            this._uiRenderer = null;
        }

        const componentName = js.getClassName(component);
        Component2D._deleteCacheComponent(this.node, componentName);
    }

    /*----------------------------------- 注销 -----------------------------------*/
    private _unregisterEvents(): void {
        this.node.off(NodeEventType.COMPONENT_ADDED, this._onComponentAdded, this);
        this.node.off(NodeEventType.COMPONENT_REMOVED, this._onComponentRemoved, this);

        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.Mouse)) {
            if (this.onMouseDown) {
                this.node.off(NodeEventType.MOUSE_DOWN, this.onMouseDown, this);
            }
            if (this.onMouseMove) {
                this.node.off(NodeEventType.MOUSE_MOVE, this.onMouseMove, this);
            }
            if (this.onMouseUp) {
                this.node.off(NodeEventType.MOUSE_UP, this.onMouseUp, this);
            }
            if (this.onMouseWheel) {
                this.node.off(NodeEventType.MOUSE_WHEEL, this.onMouseWheel, this);
            }
            if (this.onMouseEnter) {
                this.node.off(NodeEventType.MOUSE_ENTER, this.onMouseEnter, this);
            }
            if (this.onMouseLeave) {
                this.node.off(NodeEventType.MOUSE_LEAVE, this.onMouseLeave, this);
            }
        }
        if (getEventTypeEnabled(this, COMPONENT2D_EVENT_TYPE.Touch)) {
            if (this.onTouchStart) {
                this.node.off(NodeEventType.TOUCH_START, this.onTouchStart, this);
            }
            if (this.onTouchMove) {
                this.node.off(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
            }
            if (this.onTouchEnd) {
                this.node.off(NodeEventType.TOUCH_END, this.onTouchEnd, this);
            }
            if (this.onTouchCancel) {
                this.node.off(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this);
            }
        }
    }

    /*----------------------------------- 方法 -----------------------------------*/

    /**
     * 从缓存中获取指定节点组件
     * @param node 节点
     * @param componentConstructor 组件构造函数
     */
    public getTargetNodeCacheComponent<T extends Component>(
        node: Node,
        componentConstructor: ComponentConstructor<T>
    ): T | null;
    /**
     * 通过组件名称从缓存中获取指定节点组件
     * @param node 节点
     * @param componentName 组件名称
     */
    public getTargetNodeCacheComponent<T extends Component>(node: Node, componentName: string): T | null;
    public getTargetNodeCacheComponent<T extends Component>(
        node: Node,
        componentConstructorOrComponentName: ComponentConstructor<T> | string
    ): T | null {
        return Component2D._getCacheComponent(node, componentConstructorOrComponentName as ComponentConstructor<T>);
    }

    /**
     * 从缓存中获取自身节点组件
     * @param componentConstructor 组件构造函数
     */
    public getCacheComponent<T extends Component>(componentConstructor: ComponentConstructor<T>): T | null;
    /**
     * 通过组件名称从缓存中获取自身节点组件
     * @param componentName 组件名称
     */
    public getCacheComponent<T extends Component>(componentName: string): T | null;
    public getCacheComponent<T extends Component>(
        componentConstructorOrComponentName: ComponentConstructor<T> | string
    ): T | null {
        return this.getTargetNodeCacheComponent(
            this.node,
            componentConstructorOrComponentName as ComponentConstructor<T>
        );
    }

    /**
     * 批量设置指定节点属性
     * @param props 属性键值对
     */
    public setTargetNodeProps<T extends Node>(node: T, props: Partial<T>): T {
        return Component2D._setObjectProps<T>(node, props);
    }
    /**
     * 批量设置自身节点属性
     * @param props 属性键值对
     */
    public setNodeProps<T extends Node>(props: Partial<T>): T {
        return this.setTargetNodeProps(this.node as T, props);
    }
    /**
     * 批量设置自身属性
     * @param props 属性键值对
     */
    public setProps<T extends object = this>(props: Partial<T>): this {
        return Component2D._setObjectProps<this>(this, props as Partial<this>);
    }

    /*----------------------------------- 属性 -----------------------------------*/

    /**
     * x坐标
     */
    public get x() {
        return this.node.x;
    }
    public set x(value: number) {
        this.node.x = value;
    }

    /**
     * y坐标
     */
    public get y() {
        return this.node.y;
    }
    public set y(value: number) {
        this.node.y = value;
    }

    /**
     * 宽度
     */
    public get width() {
        return this._uiTransform.width;
    }
    public set width(value: number) {
        this._uiTransform.width = value;
    }

    /**
     * 高度
     */
    public get height() {
        return this._uiTransform.height;
    }
    public set height(value: number) {
        this._uiTransform.height = value;
    }

    /**
     * 缩放X轴
     */
    public get scaleX() {
        return this.node.scale.x;
    }
    public set scaleX(scaleX: number) {
        const scale = this.node.scale;
        this.node.setScale(scaleX, scale.y, scale.z);
    }

    /**
     * 缩放Y轴
     */
    public get scaleY() {
        return this.node.scale.y;
    }
    public set scaleY(scaleY: number) {
        const scale = this.node.scale;
        this.node.setScale(scale.x, scaleY, scale.z);
    }

    /**
     * 锚点Y轴
     */
    public get anchorX() {
        return this._uiTransform.anchorX;
    }
    public set anchorX(value: number) {
        this._uiTransform.anchorX = value;
    }

    /**
     * 锚点X轴
     */
    public get anchorY() {
        return this._uiTransform.anchorY;
    }
    public set anchorY(value: number) {
        this._uiTransform.anchorY = value;
    }

    /**
     * 旋转(角度)
     */
    public get angle() {
        return this.node.angle;
    }
    public set angle(value: number) {
        this.node.angle = value;
    }

    /**
     * 旋转(弧度)
     */
    public get rotation() {
        return math.toRadian(this.angle);
    }
    public set rotation(value: number) {
        this.angle = math.toDegree(value);
    }

    private _rotationVector = new Vec2();
    /**
     * 旋转向量(只读)
     */
    public get rotationVector(): Readonly<Vec2> {
        this._rotationVector.set(Math.cos(this.rotation), Math.sin(this.rotation));
        return this._rotationVector;
    }
    /**
     * 通过向量设置旋转
     * @param x
     * @param y
     */
    public setRotationByVector(x: number, y: number): void {
        this.rotation = Math.atan2(y, x);
    }

    private _color = Color.WHITE.clone();
    /**
     * 颜色(只读, 设置使用colorR/colorG/colorB/colorA属性或setColor方法)
     */
    public get color(): Readonly<Color> {
        return this._color;
    }
    public set color(value: Color) {
        this._color.set(value);
        this._applyColor();
    }

    public get colorR() {
        return this._color.r;
    }
    public set colorR(value: number) {
        this._color.r = value;
        this._applyColor();
    }

    public get colorG() {
        return this._color.g;
    }
    public set colorG(value: number) {
        this._color.g = value;
        this._applyColor();
    }

    public get colorB() {
        return this._color.b;
    }
    public set colorB(value: number) {
        this._color.b = value;
        this._applyColor();
    }

    public get colorA() {
        return this._color.a;
    }
    public set colorA(value: number) {
        this._color.a = value;
        this._applyColor();
    }

    public get colorHex(): string {
        return this._color.toHEX("#rrggbbaa");
    }
    public set colorHex(value: string) {
        this._color.fromHEX(value);
        this._applyColor();
    }

    /**
     * 设置颜色
     * @param r
     * @param g
     * @param b
     * @param a
     */
    public setColor(r: number = 255, g: number = 255, b: number = 255, a: number = 255): void {
        this._color.set(r, g, b, a);
        this._applyColor();
    }

    private _applyColor() {
        if (this.uiRenderer) {
            this.uiRenderer.color = this._color;
        }
    }

    private _uiRenderer: UIRenderer | null = null;
    /**
     * 获取UI渲染器组件
     */
    public get uiRenderer() {
        if (this._uiRenderer === null) {
            this._uiRenderer = this.getComponent(UIRenderer);
        }
        return this._uiRenderer;
    }

    /**
     * 将世界坐标系下的点转到本地坐标系(convertToNodeSpaceAR)
     * @param worldPoint 世界坐标系下的点
     * @param out
     * @returns
     */
    public toLocal(worldPoint: Vec3, out?: Vec3): Vec3 {
        return this._uiTransform.convertToNodeSpaceAR(worldPoint, out);
    }
    /**
     * 将本地坐标系下的点转到世界坐标系(convertToWorldSpaceAR)
     * @param localPoint 本地坐标系下的点
     * @param out
     * @returns
     */
    public toWorld(localPoint: Vec3, out?: Vec3) {
        return this._uiTransform.convertToWorldSpaceAR(localPoint, out);
    }

    /*----------------------------------- 轮询调用方法 -----------------------------------*/

    /**
     * 鼠标(触点)相对于左下角的位置
     */
    protected get mousePosition(): Readonly<Vec2> {
        return Component2D._mouseLocation;
    }
    /**
     * 鼠标(触点)相对于左下角的位置(Vec3)
     */
    protected get mousePositionV3(): Readonly<Vec3> {
        return Component2D._mouseLocationV3;
    }

    /**
     * 鼠标(触点)UI坐标系下的位置
     */
    protected get mouseUIPosition(): Readonly<Vec2> {
        return Component2D._mouseUILocation;
    }
    /**
     * 鼠标(触点)UI坐标系下的位置(Vec3)
     */
    protected get mouseUIPositionV3(): Readonly<Vec3> {
        return Component2D._mouseUILocationV3;
    }

    /**
     * 是否有任意按键按下(只在按下那一帧有效)
     */
    protected isGlobalKeyDown(): boolean;
    /**
     * 指定按键是否按下(只在按下那一帧有效)
     * @param keyCode
     */
    protected isGlobalKeyDown(keyCode: KeyCode): boolean;
    protected isGlobalKeyDown(keyCode?: KeyCode): boolean {
        if (keyCode !== undefined) {
            return Component2D._keyDownCodeSet.has(keyCode);
        }
        return Component2D._keyDownCodeSet.size > 0;
    }

    /**
     * 是否有任意按键按住
     */
    protected isGlobalKeyHold(): boolean;
    /**
     * 指定按键是否按住
     * @param keyCode
     */
    protected isGlobalKeyHold(keyCode: KeyCode): boolean;
    protected isGlobalKeyHold(keyCode?: KeyCode): boolean {
        if (keyCode !== undefined) {
            return Component2D._keyHoldCodeSet.has(keyCode);
        }
        return Component2D._keyHoldCodeSet.size > 0;
    }

    /**
     * 是否有任意按键松开(只在松开的那一帧有效)
     */
    protected isGlobalKeyUp(): boolean;
    /**
     * 指定按键是否松开(只在松开的那一帧有效)
     * @param keyCode
     */
    protected isGlobalKeyUp(keyCode: KeyCode): boolean;
    protected isGlobalKeyUp(keyCode?: KeyCode): boolean {
        if (keyCode !== undefined) {
            return Component2D._keyUpCodeSet.has(keyCode);
        }
        return Component2D._keyUpCodeSet.size > 0;
    }

    /**
     * 是否有任意鼠标键按下(只在按下那一帧有效)
     */
    protected isGlobalMouseDown(): boolean;
    /**
     * 指定鼠标键是否按下(只在按下那一帧有效)
     * @param button
     */
    protected isGlobalMouseDown(button: number): boolean;
    protected isGlobalMouseDown(button?: number): boolean {
        if (button !== undefined) {
            return Component2D._mouseButtonDownSet.has(button);
        }
        return Component2D._mouseButtonDownSet.size > 0;
    }

    /**
     * 是否有任意鼠标键按住
     */
    protected isGlobalMouseHold(): boolean;
    /**
     * 指定鼠标键是否按住
     * @param button
     */
    protected isGlobalMouseHold(button: number): boolean;
    protected isGlobalMouseHold(button?: number): boolean {
        if (button !== undefined) {
            return Component2D._mouseButtonHoldSet.has(button);
        }
        return Component2D._mouseButtonHoldSet.size > 0;
    }

    /**
     * 是否有任意鼠标键松开(只在松开那一帧有效)
     */
    protected isGlobalMouseUp(): boolean;
    /**
     * 指定鼠标键是否松开(只在松开的那一帧有效)
     * @param button
     */
    protected isGlobalMouseUp(button: number): boolean;
    protected isGlobalMouseUp(button?: number): boolean {
        if (button !== undefined) {
            return Component2D._mouseButtonUpSet.has(button);
        }
        return Component2D._mouseButtonUpSet.size > 0;
    }

    /**
     * 是否有任意触摸按下(只在按下那一帧有效)
     */
    protected isGlobalTouchDown(): boolean;
    /**
     * 指定触摸ID是否按下(只在按下那一帧有效)
     * @param touchId
     */
    protected isGlobalTouchDown(touchId: number): boolean;
    protected isGlobalTouchDown(touchId?: number): boolean {
        if (touchId !== undefined) {
            return Component2D._touchIdDownSet.has(touchId);
        }
        return Component2D._touchIdDownSet.size > 0;
    }

    /**
     * 是否有任意触摸按住
     */
    protected isGlobalTouchHold(): boolean;
    /**
     * 指定触摸ID是否按住
     * @param touchId
     */
    protected isGlobalTouchHold(touchId: number): boolean;
    protected isGlobalTouchHold(touchId?: number): boolean {
        if (touchId !== undefined) {
            return Component2D._touchIdHoldSet.has(touchId);
        }
        return Component2D._touchIdHoldSet.size > 0;
    }

    /**
     * 是否有任意触摸松开(只在松开那一帧有效)
     */
    protected isGlobalTouchUp(): boolean;
    /**
     * 指定触摸ID是否松开(只在松开那一帧有效)
     * @param touchId
     */
    protected isGlobalTouchUp(touchId: number): boolean;
    protected isGlobalTouchUp(touchId?: number): boolean {
        if (touchId !== undefined) {
            return Component2D._touchIdUpSet.has(touchId);
        }
        return Component2D._touchIdUpSet.size > 0;
    }

    /*----------------------------------- 可选注册事件方法 -----------------------------------*/

    /**
     * 鼠标在节点区域内按下时触发
     * @param event
     */
    protected onMouseDown?(event: EventMouse): void;
    /**
     * 鼠标在节点区域内移动时触发(不论是否按下)
     * @param event
     */
    protected onMouseMove?(event: EventMouse): void;
    /**
     * 鼠标在节点区域内松开时触发
     * @param event
     */
    protected onMouseUp?(event: EventMouse): void;
    /**
     * 鼠标在节点区域内滚轮滚动时触发(不论是否按下)
     * @param event
     */
    protected onMouseWheel?(event: EventMouse): void;
    /**
     * 鼠标移入目标节点区域内时触发(不论是否按下)
     * @param event
     */
    protected onMouseEnter?(event: EventMouse): void;
    /**
     * 鼠标移出目标节点区域内时触发(不论是否按下)
     * @param event
     */
    protected onMouseLeave?(event: EventMouse): void;

    /**
     * 手指在节点区域内触摸开始时触发
     * @param event
     */
    protected onTouchStart?(event: EventTouch): void;
    /**
     * 手指在节点区域内触摸移动时触发
     * @param event
     */
    protected onTouchMove?(event: EventTouch): void;
    /**
     * 手指在节点区域内触摸结束时触发
     * @param event
     */
    protected onTouchEnd?(event: EventTouch): void;
    /**
     * 手指在节点区域外触摸取消时触发
     * @param event
     */
    protected onTouchCancel?(event: EventTouch): void;

    /**
     * 碰撞体开始接触时触发(只在两个碰撞体开始接触时触发一次)
     * @param selfCollider
     * @param otherCollider
     * @param contact
     */
    protected onBeginContact?(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void;
    /**
     * 碰撞体结束接触时触发(只在两个碰撞体结束接触时触发一次)
     * @param selfCollider
     * @param otherCollider
     * @param contact
     */
    protected onEndContact?(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void;
    /**
     * 每次将要处理碰撞体接触逻辑时被调用
     * @param selfCollider
     * @param otherCollider
     * @param contact
     */
    protected onPreSolve?(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void;
    /**
     * 每次处理完碰撞体接触逻辑时被调用
     * @param selfCollider
     * @param otherCollider
     * @param contact
     */
    protected onPostSolve?(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void;

    /**
     * 按键按下时触发(持续触发)
     * @param event
     */
    protected onGlobalKeyDown?(event: EventKeyboard): void;
    /**
     * 按键松开时触发
     * @param event
     */
    protected onGlobalKeyUp?(event: EventKeyboard): void;

    /**
     * 鼠标按下时触发
     * @param event
     */
    protected onGlobalMouseDown?(event: EventMouse): void;
    /**
     * 鼠标移动时触发(不论是否按下)
     * @param event
     */
    protected onGlobalMouseMove?(event: EventMouse): void;
    /**
     * 鼠标在松开时触发
     * @param event
     */
    protected onGlobalMouseUp?(event: EventMouse): void;
    /**
     * 鼠标在滚轮滚动时触发(不论是否按下)
     * @param event
     */
    protected onGlobalMouseWheel?(event: EventMouse): void;

    /**
     * 手指在触摸开始时触发
     * @param event
     */
    protected onGlobalTouchStart?(event: EventTouch): void;
    /**
     * 手指在触摸移动时触发
     * @param event
     */
    protected onGlobalTouchMove?(event: EventTouch): void;
    /**
     * 手指在触摸结束时触发
     * @param event
     */
    protected onGlobalTouchEnd?(event: EventTouch): void;
    /**
     * 手指在触摸取消时触发
     * @param event
     */
    protected onGlobalTouchCancel?(event: EventTouch): void;
}

export interface Component2D {
    _eventTypeEnabledSet?: Set<COMPONENT2D_EVENT_TYPE>;
}

type ComponentConstructor<T extends Component> = new (...args: any[]) => T;

/**
 * Component2D事件类型
 */
export const COMPONENT2D_EVENT_TYPE = {
    /**
     * 鼠标事件
     */
    Mouse: "Mouse",
    /**
     * 触摸事件
     */
    Touch: "Touch",
    /**
     * 碰撞事件
     */
    Collision: "Collision",

    /**
     * 全局鼠标事件
     */
    GlobalMouse: "GlobalMouse",
    /**
     * 全局触摸事件
     */
    GlobalTouch: "GlobalTouch",
    /**
     * 全局键盘事件
     */
    GlobalKeyboard: "GlobalKeyboard",
} as const;
export type COMPONENT2D_EVENT_TYPE = (typeof COMPONENT2D_EVENT_TYPE)[keyof typeof COMPONENT2D_EVENT_TYPE];

function getEventTypeEnabled(
    component2D: Component2D,
    eventType: (typeof COMPONENT2D_EVENT_TYPE)[keyof typeof COMPONENT2D_EVENT_TYPE]
): boolean {
    return component2D._eventTypeEnabledSet?.has(eventType) ?? false;
}

interface RegisterComponent2DOptions {
    enableEvents?: COMPONENT2D_EVENT_TYPE[];
}

export function registerComponent2D(options?: RegisterComponent2DOptions): Function {
    return function (target: typeof Component2D) {
        const onLoad = target.prototype["onLoad"];
        target.prototype["onLoad"] = function () {
            this._register();
            onLoad?.call(this);
        };

        const onDestroy = target.prototype["onDestroy"];
        target.prototype["onDestroy"] = function () {
            onDestroy?.call(this);
            this._unregister();
        };

        target.prototype._eventTypeEnabledSet = new Set([
            ...[...(target.prototype._eventTypeEnabledSet ?? [])],
            ...(options?.enableEvents ?? []),
        ]);
    };
}
