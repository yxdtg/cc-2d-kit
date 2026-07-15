import { _decorator, CCBoolean, CCFloat, EventTouch, math, Node, UITransform, Vec2, Vec3 } from "cc";
import { Component2D, registerComponent2D } from "@/core/Component2D";

const { ccclass, property } = _decorator;

@registerComponent2D({
    enableEvents: ["GlobalTouch"],
})
export class _Joystick extends Component2D {
    @property({ type: Node, tooltip: "摇杆节点" })
    public rocker: Node = null!;

    @property({ type: CCBoolean, tooltip: "使用半宽作为最大半径" })
    public halfWidthAsMaxRadius = true;

    @property({
        type: CCFloat,
        visible: function () {
            const self = this as _Joystick;
            return !self.halfWidthAsMaxRadius;
        },
        tooltip: "最大半径",
    })
    public maxRadius = 75;

    private _lastTouchId = -1;
    private _isDragging = false;
    public get isDragging(): boolean {
        return this._isDragging;
    }

    private _tempTouchPosition = new Vec2();
    private _tempTouchPositionV3 = new Vec3();

    protected onGlobalTouchStart(event: EventTouch): void {
        const rockerUITransform = this.getTargetNodeCacheComponent(this.rocker, UITransform);
        if (!rockerUITransform) return;

        event.getUILocation(this._tempTouchPosition);
        this._tempTouchPositionV3.set(this._tempTouchPosition.x, this._tempTouchPosition.y, 0);

        rockerUITransform.convertToNodeSpaceAR(this._tempTouchPositionV3, this._tempTouchPositionV3);
        this._tempTouchPosition.set(this._tempTouchPositionV3.x, this._tempTouchPositionV3.y);

        const width = rockerUITransform.width;
        const height = rockerUITransform.height;
        const anchorX = rockerUITransform.anchorX;
        const anchorY = rockerUITransform.anchorY;

        const minX = -width * anchorX;
        const maxX = width * anchorX;
        const minY = -height * anchorY;
        const maxY = height * anchorY;

        const isContained =
            this._tempTouchPosition.x >= minX &&
            this._tempTouchPosition.x <= maxX &&
            this._tempTouchPosition.y >= minY &&
            this._tempTouchPosition.y <= maxY;
        if (!isContained) return;

        const touchId = event.getID();
        if (touchId === null) return;

        this._lastTouchId = touchId;
        this._isDragging = true;
    }

    private _vector = new Vec2();
    public get vector(): Readonly<Vec2> {
        return this._vector;
    }

    private _vectorRotation = 0;
    public get vectorRotation(): number {
        return this._vectorRotation;
    }
    private _vectorAngle = 0;
    public get vectorAngle(): number {
        return this._vectorAngle;
    }

    protected onGlobalTouchMove(event: EventTouch): void {
        const touchId = event.getID();
        if (touchId === null || touchId !== this._lastTouchId) return;

        if (!this._isDragging) return;

        event.getUILocation(this._tempTouchPosition);
        this._tempTouchPositionV3.set(this._tempTouchPosition.x, this._tempTouchPosition.y, 0);
        this.toLocal(this._tempTouchPositionV3, this._tempTouchPositionV3);

        this._vector.set(this._tempTouchPositionV3.x, this._tempTouchPositionV3.y);

        const maxRadius = this.halfWidthAsMaxRadius ? this.width / 2 : this.maxRadius;
        const distance = Math.min(this._vector.length(), maxRadius);

        this._vector.normalize();
        this._vectorRotation = Math.atan2(this._vector.y, this._vector.x);
        this._vectorAngle = math.toDegree(this._vectorRotation);

        this.rocker.setPosition(this._vector.x * distance, this._vector.y * distance);
    }

    protected onGlobalTouchEnd(event: EventTouch): void {
        const touchId = event.getID();
        if (touchId === null || touchId !== this._lastTouchId) return;

        this._lastTouchId = -1;
        this._isDragging = false;
        this.rocker.setPosition(0, 0);
    }

    protected onGlobalTouchCancel(event: EventTouch): void {
        const touchId = event.getID();
        if (touchId === null || touchId !== this._lastTouchId) return;

        this._lastTouchId = -1;
        this._isDragging = false;
        this.rocker.setPosition(0, 0);
    }
}
