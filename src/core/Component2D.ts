import {
    Collider2D,
    Color,
    Component,
    Contact2DType,
    EventKeyboard,
    EventMouse,
    EventTouch,
    Input,
    input,
    math,
    Node,
    NodeEventType,
    PhysicsSystem2D,
    UIRenderer,
    UITransform,
    Vec3,
    type IPhysics2DContact,
} from "cc";

export class Component2D extends Component {
    private static _initd = false;
    private static _init(): void {
        if (this._initd) return;

        this._initd = true;

        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);

        if (PhysicsSystem2D.instance) {
            PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
            PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this._onEndContact, this);
            PhysicsSystem2D.instance.on(Contact2DType.PRE_SOLVE, this._onPreSolve, this);
            PhysicsSystem2D.instance.on(Contact2DType.POST_SOLVE, this._onPostSolve, this);
        }
    }

    private static _keyboardComponent2Ds: Component2D[] = [];
    private static _addToKeyboardComponent2Ds(component2D: Component2D): void {
        this._keyboardComponent2Ds.push(component2D);
    }
    private static _removeFromKeyboardComponent2Ds(component2D: Component2D): void {
        this._keyboardComponent2Ds.splice(this._keyboardComponent2Ds.indexOf(component2D), 1);
    }

    private static _onKeyDown(event: EventKeyboard): void {
        for (const component2D of this._keyboardComponent2Ds) {
            component2D.onKeyDown?.(event);
        }
    }
    private static _onKeyUp(event: EventKeyboard): void {
        for (const component2D of this._keyboardComponent2Ds) {
            component2D.onKeyUp?.(event);
        }
    }

    private static _collisionNodeToComponent2DsWeakMap = new WeakMap<Node, Component2D[]>();
    private static _getCollisionNodeComponent2DsWeakMap(node: Node) {
        return this._collisionNodeToComponent2DsWeakMap.get(node);
    }
    private static _addToCollisionNodeComponent2DsWeakMap(component2D: Component2D): void {
        const component2Ds = this._collisionNodeToComponent2DsWeakMap.get(component2D.node);
        if (component2Ds !== undefined) {
            component2Ds.push(component2D);
        } else {
            this._collisionNodeToComponent2DsWeakMap.set(component2D.node, [component2D]);
        }
    }
    private static _removeFromCollisionNodeComponent2DsWeakMap(component2D: Component2D): void {
        const component2Ds = this._collisionNodeToComponent2DsWeakMap.get(component2D.node);
        if (component2Ds !== undefined) {
            component2Ds.splice(component2Ds.indexOf(component2D), 1);
        }
    }

    private static _onBeginContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {
        const selfColliderComponent2Ds = this._getCollisionNodeComponent2DsWeakMap(selfCollider.node);
        if (selfColliderComponent2Ds !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2Ds) {
                selfColliderComponent2D.onBeginContact?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2Ds = this._getCollisionNodeComponent2DsWeakMap(otherCollider.node);
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
        const selfColliderComponent2Ds = this._getCollisionNodeComponent2DsWeakMap(selfCollider.node);
        if (selfColliderComponent2Ds !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2Ds) {
                selfColliderComponent2D.onEndContact?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2Ds = this._getCollisionNodeComponent2DsWeakMap(otherCollider.node);
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
        const selfColliderComponent2Ds = this._getCollisionNodeComponent2DsWeakMap(selfCollider.node);
        if (selfColliderComponent2Ds !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2Ds) {
                selfColliderComponent2D.onPreSolve?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2Ds = this._getCollisionNodeComponent2DsWeakMap(otherCollider.node);
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
        const selfColliderComponent2Ds = this._getCollisionNodeComponent2DsWeakMap(selfCollider.node);
        if (selfColliderComponent2Ds !== undefined) {
            for (const selfColliderComponent2D of selfColliderComponent2Ds) {
                selfColliderComponent2D.onPostSolve?.(selfCollider, otherCollider, contact);
            }
        }

        const otherColliderComponent2Ds = this._getCollisionNodeComponent2DsWeakMap(otherCollider.node);
        if (otherColliderComponent2Ds !== undefined) {
            for (const otherColliderComponent2D of otherColliderComponent2Ds) {
                otherColliderComponent2D.onPostSolve?.(otherCollider, selfCollider, contact);
            }
        }
    }

    private _uiTransform: UITransform = null!;
    public get uiTransform() {
        return this._uiTransform;
    }

    protected onLoad(): void {
        Component2D._init();

        if (getEventTypeEnabled(this, EVENT_TYPE_MAP.Keyboard)) {
            Component2D._addToKeyboardComponent2Ds(this);
        }

        if (getEventTypeEnabled(this, EVENT_TYPE_MAP.Collision)) {
            Component2D._addToCollisionNodeComponent2DsWeakMap(this);
        }

        this.__tryGetUITransform();
        this.__registerEvents();
    }
    private __onComponentAdded(component: Component): void {
        if (this._renderableComponent === null) {
            if (component instanceof UIRenderer) {
                this._renderableComponent = component;

                this._applyColor();
            }
        }
    }
    private __onComponentRemoved(component: Component): void {
        if (this._renderableComponent === component) {
            this._renderableComponent = null;
        }
    }

    protected onDestroy(): void {
        if (getEventTypeEnabled(this, EVENT_TYPE_MAP.Keyboard)) {
            Component2D._removeFromKeyboardComponent2Ds(this);
        }

        if (getEventTypeEnabled(this, EVENT_TYPE_MAP.Collision)) {
            Component2D._removeFromCollisionNodeComponent2DsWeakMap(this);
        }

        this.__unregisterEvents();
    }

    private __tryGetUITransform(): void {
        const uiTransform = this.getComponent(UITransform);
        if (uiTransform === null) {
            return console.error("Component2D: UITransform 不存在");
        }

        this._uiTransform = uiTransform;
    }

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
    public get color(): Readonly<Color> {
        return this._color;
    }
    public set color(value: Color) {
        this._color.set(value);
        this._applyColor();
    }

    public setColor(r: number = 255, g: number = 255, b: number = 255, a: number = 255): void {
        this._color.set(r, g, b, a);
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

    private _applyColor() {
        if (this.renderableComponent) {
            this.renderableComponent.color = this.color;
        }
    }

    private _renderableComponent: UIRenderer | null = null;
    public get renderableComponent() {
        if (this._renderableComponent === null) {
            this._renderableComponent = this.getComponent(UIRenderer);
        }

        return this._renderableComponent;
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

    private __registerEvents(): void {
        this.node.on(NodeEventType.COMPONENT_ADDED, this.__onComponentAdded, this);
        this.node.on(NodeEventType.COMPONENT_REMOVED, this.__onComponentRemoved, this);

        if (getEventTypeEnabled(this, EVENT_TYPE_MAP.Mouse)) {
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

        if (getEventTypeEnabled(this, EVENT_TYPE_MAP.Touch)) {
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
    private __unregisterEvents(): void {
        this.node.off(NodeEventType.COMPONENT_ADDED, this.__onComponentAdded, this);
        this.node.off(NodeEventType.COMPONENT_REMOVED, this.__onComponentRemoved, this);

        if (getEventTypeEnabled(this, EVENT_TYPE_MAP.Mouse)) {
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

        if (getEventTypeEnabled(this, EVENT_TYPE_MAP.Touch)) {
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

    /**
     * 当鼠标按下时触发一次。
     * @param event
     */
    public onMouseDown?(event: EventMouse): void;
    /**
     * 当鼠标在目标节点在目标节点区域中移动时，不论是否按下。
     * @param event
     */
    public onMouseMove?(event: EventMouse): void;
    /**
     * 当鼠标从按下状态松开时触发一次。
     * @param event
     */
    public onMouseUp?(event: EventMouse): void;
    /**
     * 鼠标滚轮事件。
     * @param event
     */
    public onMouseWheel?(event: EventMouse): void;
    /**
     * 当鼠标移入目标节点区域时，不论是否按下.
     * @param event
     */
    public onMouseEnter?(event: EventMouse): void;
    /**
     * 当鼠标移出目标节点区域时，不论是否按下。
     * @param event
     */
    public onMouseLeave?(event: EventMouse): void;

    /**
     * 手指开始触摸事件。
     * @param event
     */
    public onTouchStart?(event: EventTouch): void;
    /**
     * 当手指在屏幕上移动时。
     * @param event
     */
    public onTouchMove?(event: EventTouch): void;
    /**
     * 手指结束触摸事件。
     * @param event
     */
    public onTouchEnd?(event: EventTouch): void;
    /**
     * 当手指在目标节点区域外离开屏幕时。
     * @param event
     */
    public onTouchCancel?(event: EventTouch): void;

    /**
     * 当按下按键时触发的事件, 该事件在按下状态会持续派发
     * @param event
     */
    public onKeyDown?(event: EventKeyboard): void;
    /**
     * 当松开按键时触发的事件
     * @param event
     */
    public onKeyUp?(event: EventKeyboard): void;

    /**
     * 只在两个碰撞体开始接触时被调用一次
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
     * 只在两个碰撞体结束接触时被调用一次
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
}

export interface Component2D {
    EVENT_TYPE_TO_ENABLED_MAP: Record<EVENT_TYPE_MAP, boolean>;
}

export const EVENT_TYPE_MAP = {
    Mouse: "Mouse",
    Touch: "Touch",
    Keyboard: "Keyboard",
    Collision: "Collision",
} as const;
export type EVENT_TYPE_MAP = (typeof EVENT_TYPE_MAP)[keyof typeof EVENT_TYPE_MAP];

function getEventTypeEnabled(
    component2D: Component2D,
    eventType: (typeof EVENT_TYPE_MAP)[keyof typeof EVENT_TYPE_MAP]
): boolean {
    return component2D.EVENT_TYPE_TO_ENABLED_MAP?.[eventType] ?? false;
}

export function enableComponent2DEventType(eventTypeToEnabledMap?: Partial<Record<EVENT_TYPE_MAP, boolean>>): Function {
    return function (target: typeof Component2D) {
        target.prototype.EVENT_TYPE_TO_ENABLED_MAP = {
            ...(target.prototype.EVENT_TYPE_TO_ENABLED_MAP ?? {}),
            ...(eventTypeToEnabledMap ?? {}),
        };
    };
}
