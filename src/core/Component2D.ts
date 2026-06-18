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
    KeyCode,
    math,
    Node,
    NodeEventType,
    PhysicsSystem2D,
    UIRenderer,
    UITransform,
    Vec3,
    type IPhysics2DContact,
} from "cc";

/**
 * 鼠标按钮枚举
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

        if (PhysicsSystem2D.instance) {
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

    /************************************ 按键 ************************************/
    private static _keyDownCodeSet = new Set<KeyCode>();
    private static _keyHoldCodeSet = new Set<KeyCode>();
    private static _keyUpCodeSet = new Set<KeyCode>();

    private static _globalKeyboardEventComponent2Ds: Component2D[] = [];
    private static _addToGlobalKeyboardEventComponent2Ds(component2D: Component2D): void {
        this._globalKeyboardEventComponent2Ds.push(component2D);
    }
    private static _removeFromGlobalKeyboardEventComponent2Ds(component2D: Component2D): void {
        this._globalKeyboardEventComponent2Ds.splice(this._globalKeyboardEventComponent2Ds.indexOf(component2D), 1);
    }

    private static _onKeyDown(event: EventKeyboard): void {
        this._keyDownCodeSet.add(event.keyCode);
        this._keyHoldCodeSet.add(event.keyCode);

        for (const component2D of this._globalKeyboardEventComponent2Ds) {
            component2D.onGlobalKeyDown?.(event);
        }
    }
    private static _onKeyUp(event: EventKeyboard): void {
        this._keyDownCodeSet.delete(event.keyCode);
        this._keyHoldCodeSet.delete(event.keyCode);
        this._keyUpCodeSet.add(event.keyCode);

        for (const component2D of this._globalKeyboardEventComponent2Ds) {
            component2D.onGlobalKeyUp?.(event);
        }
    }

    /************************************ 鼠标 ************************************/
    private static _mouseButtonDownSet = new Set<number>();
    private static _mouseButtonHoldSet = new Set<number>();
    private static _mouseButtonUpSet = new Set<number>();

    private static _globalMouseComponent2Ds: Component2D[] = [];
    private static _addToGlobalMouseComponent2Ds(component2D: Component2D): void {
        this._globalMouseComponent2Ds.push(component2D);
    }
    private static _removeFromGlobalMouseComponent2Ds(component2D: Component2D): void {
        this._globalMouseComponent2Ds.splice(this._globalMouseComponent2Ds.indexOf(component2D), 1);
    }

    private static _onMouseDown(event: EventMouse): void {
        const button = event.getButton();
        this._mouseButtonDownSet.add(button);
        this._mouseButtonHoldSet.add(button);

        for (const component2D of this._globalMouseComponent2Ds) {
            component2D.onGlobalMouseDown?.(event);
        }
    }
    private static _onMouseMove(event: EventMouse): void {
        for (const component2D of this._globalMouseComponent2Ds) {
            component2D.onGlobalMouseMove?.(event);
        }
    }
    private static _onMouseUp(event: EventMouse): void {
        const button = event.getButton();
        this._mouseButtonDownSet.delete(button);
        this._mouseButtonHoldSet.delete(button);
        this._mouseButtonUpSet.add(button);

        for (const component2D of this._globalMouseComponent2Ds) {
            component2D.onGlobalMouseUp?.(event);
        }
    }
    private static _onMouseWheel(event: EventMouse): void {
        for (const component2D of this._globalMouseComponent2Ds) {
            component2D.onGlobalMouseWheel?.(event);
        }
    }

    /************************************ 触摸 ************************************/
    private static _touchIdDownSet = new Set<number>();
    private static _touchIdHoldSet = new Set<number>();
    private static _touchIdUpSet = new Set<number>();

    private static _globalTouchEventComponent2Ds: Component2D[] = [];
    private static _addToGlobalTouchEventComponent2Ds(component2D: Component2D): void {
        this._globalTouchEventComponent2Ds.push(component2D);
    }
    private static _removeFromGlobalTouchEventComponent2Ds(component2D: Component2D): void {
        this._globalTouchEventComponent2Ds.splice(this._globalTouchEventComponent2Ds.indexOf(component2D), 1);
    }

    private static _onTouchStart(event: EventTouch): void {
        const touchId = event.getID();
        if (touchId !== null) {
            this._touchIdDownSet.add(touchId);
            this._touchIdHoldSet.add(touchId);
        }

        for (const component2D of this._globalTouchEventComponent2Ds) {
            component2D.onGlobalTouchStart?.(event);
        }
    }
    private static _onTouchMove(event: EventTouch): void {
        for (const component2D of this._globalTouchEventComponent2Ds) {
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

        for (const component2D of this._globalTouchEventComponent2Ds) {
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

        for (const component2D of this._globalTouchEventComponent2Ds) {
            component2D.onGlobalTouchCancel?.(event);
        }
    }

    /************************************ 碰撞 ************************************/
    private static _collisionEventNodeToComponent2DsWeakMap = new WeakMap<Node, Component2D[]>();
    private static _getCollisionEventNodeComponent2DsWeakMap(node: Node) {
        return this._collisionEventNodeToComponent2DsWeakMap.get(node);
    }
    private static _addToCollisionEventNodeComponent2DsWeakMap(component2D: Component2D): void {
        const component2Ds = this._collisionEventNodeToComponent2DsWeakMap.get(component2D.node);
        if (component2Ds !== undefined) {
            component2Ds.push(component2D);
        } else {
            this._collisionEventNodeToComponent2DsWeakMap.set(component2D.node, [component2D]);
        }
    }
    private static _removeFromCollisionEventNodeComponent2DsWeakMap(component2D: Component2D): void {
        const component2Ds = this._collisionEventNodeToComponent2DsWeakMap.get(component2D.node);
        if (component2Ds !== undefined) {
            component2Ds.splice(component2Ds.indexOf(component2D), 1);
        }
    }

    private static _onBeginContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {
        const selfColliderComponent2Ds = this._getCollisionEventNodeComponent2DsWeakMap(selfCollider.node);
        if (selfColliderComponent2Ds !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2Ds) {
                selfColliderComponent2D.onBeginContact?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2Ds = this._getCollisionEventNodeComponent2DsWeakMap(otherCollider.node);
        if (otherColliderComponent2Ds !== undefined) {
            for (const otherColliderComponent2D of otherColliderComponent2Ds) {
                otherColliderComponent2D.onBeginContact?.(otherCollider, selfCollider, contact);
            }
        }
    }
    private static _onEndContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {
        const selfColliderComponent2Ds = this._getCollisionEventNodeComponent2DsWeakMap(selfCollider.node);
        if (selfColliderComponent2Ds !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2Ds) {
                selfColliderComponent2D.onEndContact?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2Ds = this._getCollisionEventNodeComponent2DsWeakMap(otherCollider.node);
        if (otherColliderComponent2Ds !== undefined) {
            for (const otherColliderComponent2D of otherColliderComponent2Ds) {
                otherColliderComponent2D.onEndContact?.(otherCollider, selfCollider, contact);
            }
        }
    }
    private static _onPreSolve(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {
        const selfColliderComponent2Ds = this._getCollisionEventNodeComponent2DsWeakMap(selfCollider.node);
        if (selfColliderComponent2Ds !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2Ds) {
                selfColliderComponent2D.onPreSolve?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2Ds = this._getCollisionEventNodeComponent2DsWeakMap(otherCollider.node);
        if (otherColliderComponent2Ds !== undefined) {
            for (const otherColliderComponent2D of otherColliderComponent2Ds) {
                otherColliderComponent2D.onPreSolve?.(otherCollider, selfCollider, contact);
            }
        }
    }
    private static _onPostSolve(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {
        const selfColliderComponent2Ds = this._getCollisionEventNodeComponent2DsWeakMap(selfCollider.node);
        if (selfColliderComponent2Ds !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2Ds) {
                selfColliderComponent2D.onPostSolve?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2Ds = this._getCollisionEventNodeComponent2DsWeakMap(otherCollider.node);
        if (otherColliderComponent2Ds !== undefined) {
            for (const otherColliderComponent2D of otherColliderComponent2Ds) {
                otherColliderComponent2D.onPostSolve?.(otherCollider, selfCollider, contact);
            }
        }
    }

    /************************************ 实例 ************************************/

    private _uiTransform: UITransform = null!;
    public get uiTransform() {
        return this._uiTransform;
    }

    protected onLoad(): void {
        Component2D._init();

        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.GlobalKeyboard)) {
            Component2D._addToGlobalKeyboardEventComponent2Ds(this);
        }
        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.GlobalMouse)) {
            Component2D._addToGlobalMouseComponent2Ds(this);
        }
        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.GlobalTouch)) {
            Component2D._addToGlobalTouchEventComponent2Ds(this);
        }
        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.Collision)) {
            Component2D._addToCollisionEventNodeComponent2DsWeakMap(this);
        }

        this.__tryGetUITransform();
        this.__registerEvents();
    }
    protected onDestroy(): void {
        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.GlobalKeyboard)) {
            Component2D._removeFromGlobalKeyboardEventComponent2Ds(this);
        }
        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.GlobalMouse)) {
            Component2D._removeFromGlobalMouseComponent2Ds(this);
        }
        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.GlobalTouch)) {
            Component2D._removeFromGlobalTouchEventComponent2Ds(this);
        }
        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.Collision)) {
            Component2D._removeFromCollisionEventNodeComponent2DsWeakMap(this);
        }

        this.__unregisterEvents();
    }

    /************************************ 初始化 ************************************/
    private __registerEvents(): void {
        this.node.on(NodeEventType.COMPONENT_ADDED, this.__onComponentAdded, this);
        this.node.on(NodeEventType.COMPONENT_REMOVED, this.__onComponentRemoved, this);

        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.Mouse)) {
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
        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.Touch)) {
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

    private __tryGetUITransform(): void {
        const uiTransform = this.getComponent(UITransform);
        if (uiTransform === null) {
            return console.error("Component2D: UITransform 不存在");
        }
        this._uiTransform = uiTransform;
    }

    private __onComponentAdded(component: Component): void {
        if (this._uiRendererComponent === null) {
            if (component instanceof UIRenderer) {
                this._uiRendererComponent = component;
                this._applyColor();
            }
        }
    }

    /************************************ 注销 ************************************/
    private __unregisterEvents(): void {
        this.node.off(NodeEventType.COMPONENT_ADDED, this.__onComponentAdded, this);
        this.node.off(NodeEventType.COMPONENT_REMOVED, this.__onComponentRemoved, this);

        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.Mouse)) {
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
        if (getEventTypeEnabled(this, COMPONENT_2D_EVENT_TYPE_MAP.Touch)) {
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

    private __onComponentRemoved(component: Component): void {
        if (this._uiRendererComponent === component) {
            this._uiRendererComponent = null;
        }
    }

    /************************************ 属性 ************************************/

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
     * 旋转角度(角度)
     */
    public get angle() {
        return this.node.angle;
    }
    public set angle(value: number) {
        this.node.angle = value;
    }

    /**
     * 旋转角度(弧度)
     */
    public get rotation() {
        return math.toRadian(this.angle);
    }
    public set rotation(value: number) {
        this.angle = math.toDegree(value);
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
        if (this.uiRendererComponent) {
            this.uiRendererComponent.color = this.color;
        }
    }

    private _uiRendererComponent: UIRenderer | null = null;
    /**
     * 获取UI渲染器组件
     */
    public get uiRendererComponent() {
        if (this._uiRendererComponent === null) {
            this._uiRendererComponent = this.getComponent(UIRenderer);
        }
        return this._uiRendererComponent;
    }

    /**
     * 将世界坐标转换为本地坐标 (convertToNodeSpaceAR)
     * @param worldPoint
     * @param out
     * @returns
     */
    public toLocal(worldPoint: Vec3, out?: Vec3): Vec3 {
        return this._uiTransform.convertToNodeSpaceAR(worldPoint, out);
    }
    /**
     * 将本地坐标转换为世界坐标 (convertToWorldSpaceAR)
     * @param localPoint
     * @param out
     * @returns
     */
    public toWorld(localPoint: Vec3, out?: Vec3) {
        return this._uiTransform.convertToWorldSpaceAR(localPoint, out);
    }

    /************************************ 轮询调用方法 ************************************/

    /**
     * 是否有任意按键按下(只在按下那一帧有效)
     */
    public isGlobalKeyDown(): boolean;
    /**
     * 指定按键是否按下(只在按下那一帧有效)
     * @param keyCode
     */
    public isGlobalKeyDown(keyCode: KeyCode): boolean;
    public isGlobalKeyDown(keyCode?: KeyCode): boolean {
        if (keyCode !== undefined) {
            return Component2D._keyDownCodeSet.has(keyCode);
        }
        return Component2D._keyDownCodeSet.size > 0;
    }

    /**
     * 是否有任意按键按住
     */
    public isGlobalKeyHold(): boolean;
    /**
     * 指定按键是否按住
     * @param keyCode
     */
    public isGlobalKeyHold(keyCode: KeyCode): boolean;
    public isGlobalKeyHold(keyCode?: KeyCode): boolean {
        if (keyCode !== undefined) {
            return Component2D._keyHoldCodeSet.has(keyCode);
        }
        return Component2D._keyHoldCodeSet.size > 0;
    }

    /**
     * 是否有任意按键松开(只在松开的那一帧有效)
     */
    public isGlobalKeyUp(): boolean;
    /**
     * 指定按键是否松开(只在松开的那一帧有效)
     * @param keyCode
     */
    public isGlobalKeyUp(keyCode: KeyCode): boolean;
    public isGlobalKeyUp(keyCode?: KeyCode): boolean {
        if (keyCode !== undefined) {
            return Component2D._keyUpCodeSet.has(keyCode);
        }
        return Component2D._keyUpCodeSet.size > 0;
    }

    /**
     * 是否有任意鼠标按钮按下(只在按下那一帧有效)
     */
    public isGlobalMouseDown(): boolean;
    /**
     * 指定鼠标按钮是否按下(只在按下那一帧有效)
     * @param button
     */
    public isGlobalMouseDown(button: number): boolean;
    public isGlobalMouseDown(button?: number): boolean {
        if (button !== undefined) {
            return Component2D._mouseButtonDownSet.has(button);
        }
        return Component2D._mouseButtonDownSet.size > 0;
    }

    /**
     * 是否有任意鼠标按钮按住
     */
    public isGlobalMouseHold(): boolean;
    /**
     * 指定鼠标按钮是否按住
     * @param button
     */
    public isGlobalMouseHold(button: number): boolean;
    public isGlobalMouseHold(button?: number): boolean {
        if (button !== undefined) {
            return Component2D._mouseButtonHoldSet.has(button);
        }
        return Component2D._mouseButtonHoldSet.size > 0;
    }

    /**
     * 是否有任意鼠标按钮松开(只在松开那一帧有效)
     */
    public isGlobalMouseUp(): boolean;
    /**
     * 指定鼠标按钮是否松开(只在松开的那一帧有效)
     * @param button
     */
    public isGlobalMouseUp(button: number): boolean;
    public isGlobalMouseUp(button?: number): boolean {
        if (button !== undefined) {
            return Component2D._mouseButtonUpSet.has(button);
        }
        return Component2D._mouseButtonUpSet.size > 0;
    }

    /**
     * 是否有任意触摸按下(只在按下那一帧有效)
     */
    public isGlobalTouchDown(): boolean;
    /**
     * 指定触摸ID是否按下(只在按下那一帧有效)
     * @param touchId
     */
    public isGlobalTouchDown(touchId: number): boolean;
    public isGlobalTouchDown(touchId?: number): boolean {
        if (touchId !== undefined) {
            return Component2D._touchIdDownSet.has(touchId);
        }
        return Component2D._touchIdDownSet.size > 0;
    }

    /**
     * 是否有任意触摸按住
     */
    public isGlobalTouchHold(): boolean;
    /**
     * 指定触摸ID是否按住
     * @param touchId
     */
    public isGlobalTouchHold(touchId: number): boolean;
    public isGlobalTouchHold(touchId?: number): boolean {
        if (touchId !== undefined) {
            return Component2D._touchIdHoldSet.has(touchId);
        }
        return Component2D._touchIdHoldSet.size > 0;
    }

    /**
     * 是否有任意触摸松开(只在松开那一帧有效)
     */
    public isGlobalTouchUp(): boolean;
    /**
     * 指定触摸ID是否松开(只在松开那一帧有效)
     * @param touchId
     */
    public isGlobalTouchUp(touchId: number): boolean;
    public isGlobalTouchUp(touchId?: number): boolean {
        if (touchId !== undefined) {
            return Component2D._touchIdUpSet.has(touchId);
        }
        return Component2D._touchIdUpSet.size > 0;
    }

    /************************************ 可选注册事件方法 ************************************/

    /**
     * 鼠标在节点区域内按下时触发
     * @param event
     */
    public onMouseDown?(event: EventMouse): void;
    /**
     * 鼠标在节点区域内移动时触发(不论是否按下)
     * @param event
     */
    public onMouseMove?(event: EventMouse): void;
    /**
     * 鼠标在节点区域内松开时触发
     * @param event
     */
    public onMouseUp?(event: EventMouse): void;
    /**
     * 鼠标在节点区域内滚轮滚动时触发(不论是否按下)
     * @param event
     */
    public onMouseWheel?(event: EventMouse): void;
    /**
     * 鼠标移入目标节点区域内时触发(不论是否按下)
     * @param event
     */
    public onMouseEnter?(event: EventMouse): void;
    /**
     * 鼠标移出目标节点区域内时触发(不论是否按下)
     * @param event
     */
    public onMouseLeave?(event: EventMouse): void;

    /**
     * 手指在节点区域内触摸开始时触发
     * @param event
     */
    public onTouchStart?(event: EventTouch): void;
    /**
     * 手指在节点区域内触摸移动时触发
     * @param event
     */
    public onTouchMove?(event: EventTouch): void;
    /**
     * 手指在节点区域内触摸结束时触发
     * @param event
     */
    public onTouchEnd?(event: EventTouch): void;
    /**
     * 手指在节点区域外触摸取消时触发
     * @param event
     */
    public onTouchCancel?(event: EventTouch): void;

    /**
     * 碰撞体开始接触时触发(只在两个碰撞体开始接触时触发一次)
     * @param selfCollider
     * @param otherCollider
     * @param contact
     */
    public onBeginContact?(
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
    public onEndContact?(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void;
    /**
     * 每次将要处理碰撞体接触逻辑时被调用
     * @param selfCollider
     * @param otherCollider
     * @param contact
     */
    public onPreSolve?(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void;
    /**
     * 每次处理完碰撞体接触逻辑时被调用
     * @param selfCollider
     * @param otherCollider
     * @param contact
     */
    public onPostSolve?(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void;

    /**
     * 按键按下时触发(持续触发)
     * @param event
     */
    public onGlobalKeyDown?(event: EventKeyboard): void;
    /**
     * 按键松开时触发
     * @param event
     */
    public onGlobalKeyUp?(event: EventKeyboard): void;

    /**
     * 鼠标按下时触发
     * @param event
     */
    public onGlobalMouseDown?(event: EventMouse): void;
    /**
     * 鼠标移动时触发(不论是否按下)
     * @param event
     */
    public onGlobalMouseMove?(event: EventMouse): void;
    /**
     * 鼠标在松开时触发
     * @param event
     */
    public onGlobalMouseUp?(event: EventMouse): void;
    /**
     * 鼠标在滚轮滚动时触发(不论是否按下)
     * @param event
     */
    public onGlobalMouseWheel?(event: EventMouse): void;

    /**
     * 手指在触摸开始时触发
     * @param event
     */
    public onGlobalTouchStart?(event: EventTouch): void;
    /**
     * 手指在触摸移动时触发
     * @param event
     */
    public onGlobalTouchMove?(event: EventTouch): void;
    /**
     * 手指在触摸结束时触发
     * @param event
     */
    public onGlobalTouchEnd?(event: EventTouch): void;
    /**
     * 手指在触摸取消时触发
     * @param event
     */
    public onGlobalTouchCancel?(event: EventTouch): void;
}

export interface Component2D {
    EVENT_TYPE_TO_ENABLED_MAP: Record<COMPONENT_2D_EVENT_TYPE_MAP, boolean>;
}

/**
 * Component2D事件类型枚举
 */
export const COMPONENT_2D_EVENT_TYPE_MAP = {
    Mouse: "Mouse",
    Touch: "Touch",
    Collision: "Collision",

    GlobalMouse: "GlobalMouse",
    GlobalTouch: "GlobalTouch",
    GlobalKeyboard: "GlobalKeyboard",
} as const;
export type COMPONENT_2D_EVENT_TYPE_MAP =
    (typeof COMPONENT_2D_EVENT_TYPE_MAP)[keyof typeof COMPONENT_2D_EVENT_TYPE_MAP];

function getEventTypeEnabled(
    component2D: Component2D,
    eventType: (typeof COMPONENT_2D_EVENT_TYPE_MAP)[keyof typeof COMPONENT_2D_EVENT_TYPE_MAP]
): boolean {
    return component2D.EVENT_TYPE_TO_ENABLED_MAP?.[eventType] ?? false;
}

/**
 * 设置Component2D事件类型启用状态
 * @param eventTypeToEnabledMap
 * @returns
 */
export function setComponent2DEventTypeEnabledMap(
    eventTypeToEnabledMap?: Partial<Record<COMPONENT_2D_EVENT_TYPE_MAP, boolean>>
): Function {
    return function (target: typeof Component2D) {
        target.prototype.EVENT_TYPE_TO_ENABLED_MAP = {
            ...(target.prototype.EVENT_TYPE_TO_ENABLED_MAP ?? {}),
            ...(eventTypeToEnabledMap ?? {}),
        };
    };
}
