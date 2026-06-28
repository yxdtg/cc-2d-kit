# cc-2d-kit

## CocosCreator2D游戏开发工具包🚀

- Component2D: 继承Component, 用于提升2D游戏开发体验
- ...

## 安装

```bash
npm install cc-2d-kit
```

## 快速开始(简单的移动例子)

```typescript
import { _decorator, Node, CCFloat, KeyCode } from "cc";
import { Component2D, registerComponent2D } from "cc-2d-kit";

const { ccclass, property } = _decorator;

@registerComponent2D({
    enableEvents: ["GlobalKeyboard"],
})
@ccclass("Player")
export class Player extends Component2D {
    @property(CCFloat)
    public speed = 200;

    protected update(dt: number): void {
        let vx = 0;
        let vy = 0;

        if (this.isGlobalKeyHold(KeyCode.KEY_W)) {
            vy += 1;
        }
        if (this.isGlobalKeyHold(KeyCode.KEY_S)) {
            vy -= 1;
        }
        if (this.isGlobalKeyHold(KeyCode.KEY_A)) {
            vx -= 1;
        }
        if (this.isGlobalKeyHold(KeyCode.KEY_D)) {
            vx += 1;
        }

        this.x += vx * this.speed * dt;
        this.y += vy * this.speed * dt;
    }
}
```

## 详细使用

```typescript
import { _decorator, Collider2D, EventKeyboard, EventMouse, EventTouch, IPhysics2DContact, KeyCode, Sprite } from "cc";
import { Component2D, registerComponent2D, MOUSE_BUTTON } from "cc-2d-kit";

const { ccclass, property } = _decorator;

@registerComponent2D({
    enableEvents: ["Mouse", "Touch", "Collision", "GlobalKeyboard", "GlobalMouse", "GlobalTouch"],
})
@ccclass("NewComponent2D")
export class NewComponent2D extends Component2D {
    // 属性、方法介绍
    protected update(dt: number): void {
        // 位置
        this.x = 0;
        this.y = 0;

        // 尺寸
        this.width = 100;
        this.height = 100;

        // 缩放
        this.scaleX = 1;
        this.scaleY = 1;

        // 旋转
        this.rotation = Math.PI / 4;
        this.angle = 45;

        // 锚点
        this.anchorX = 0.5;
        this.anchorY = 0.5;

        // 颜色(有UI渲染器组件会自动设置颜色，动态添加UI渲染器组件也会自动设置颜色)
        this.colorR = 255;
        this.colorG = 255;
        this.colorB = 255;
        this.colorA = 255;
        this.colorHex = "#ffffffff";
        this.setColor(255, 255, 255, 255);

        // 批量设置属性
        this.setProps({ x: 100, y: 100 });
        // 链式调用
        this.setProps({ width: 200, height: 200 }).setProps({ angle: 45 });

        // 从缓存中获取组件O(1)
        console.log(this.getCacheComponent(Sprite));
        console.log(this.getCacheComponent("Sprite"));

        // 当前组件所属节点的UITransform组件
        console.log(this.uiTransform);
        // 当前组件所属节点的UI渲染器组件(Sprite。Label、等)
        console.log(this.uiRenderer);

        // event.getLocation()
        console.log(this.mousePosition);
        // Vec3(方便坐标系转换)
        console.log(this.mousePositionV3);

        // event.getUILocation()
        console.log(this.mouseUIPosition);
        // Vec3(方便坐标系转换)
        console.log(this.mouseUIPositionV3);

        // 任意按键
        if (this.isGlobalKeyDown()) {
            console.log("任意键按下");
        }
        if (this.isGlobalKeyHold()) {
            console.log("任意键按住");
        }
        if (this.isGlobalKeyUp()) {
            console.log("任意键松开");
        }

        // 指定按键
        if (this.isGlobalKeyDown(KeyCode.KEY_A)) {
            console.log("按下A键");
        }
        if (this.isGlobalKeyHold(KeyCode.KEY_A)) {
            console.log("按住A键");
        }
        if (this.isGlobalKeyUp(KeyCode.KEY_A)) {
            console.log("松开A键");
        }

        // 任意鼠标按键
        if (this.isGlobalMouseDown()) {
            console.log("鼠标按下");
        }
        if (this.isGlobalMouseHold()) {
            console.log("鼠标按住");
        }
        if (this.isGlobalMouseUp()) {
            console.log("鼠标松开");
        }

        // 指定鼠标按键
        if (this.isGlobalMouseDown(MOUSE_BUTTON.Left)) {
            console.log("鼠标左键按下");
        }
        if (this.isGlobalMouseHold(MOUSE_BUTTON.Left)) {
            console.log("鼠标左键按住");
        }
        if (this.isGlobalMouseUp(MOUSE_BUTTON.Left)) {
            console.log("鼠标左键松开");
        }

        // 任意触摸ID
        if (this.isGlobalTouchDown()) {
            console.log("触摸按下");
        }
        if (this.isGlobalTouchHold()) {
            console.log("触摸按住");
        }
        if (this.isGlobalTouchUp()) {
            console.log("触摸松开");
        }

        // 指定触摸ID
        const touchId = 0;
        if (this.isGlobalTouchDown(touchId)) {
            console.log(`触摸按下, 触摸ID: ${touchId}`);
        }
        if (this.isGlobalTouchHold(touchId)) {
            console.log(`触摸按住, 触摸ID: ${touchId}`);
        }
        if (this.isGlobalTouchUp(touchId)) {
            console.log(`触摸松开, 触摸ID: ${touchId}`);
        }
    }

    // 装饰器加入指定类型事件后，会自动注册注销对应事件
    // enableEvents: ["Mouse", "Touch", "Collision", "GlobalKeyboard", "GlobalMouse", "GlobalTouch"],

    // Mouse 开启鼠标事件
    protected onMouseDown(event: EventMouse): void {}
    protected onMouseMove(event: EventMouse): void {}
    protected onMouseUp(event: EventMouse): void {}
    protected onMouseWheel(event: EventMouse): void {}
    protected onMouseEnter(event: EventMouse): void {}
    protected onMouseLeave(event: EventMouse): void {}

    // Touch 开启触摸事件
    protected onTouchStart(event: EventTouch): void {}
    protected onTouchMove(event: EventTouch): void {}
    protected onTouchEnd(event: EventTouch): void {}
    protected onTouchCancel(event: EventTouch): void {}

    // Collision 开启碰撞事件
    protected onBeginContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {}
    protected onEndContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {}
    protected onPreSolve(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {}
    protected onPostSolve(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ): void {}

    // GlobalKeyboard 开启全局键盘事件
    protected onGlobalKeyDown(event: EventKeyboard): void {}
    protected onGlobalKeyUp(event: EventKeyboard): void {}

    // GlobalMouse 开启全局鼠标事件
    protected onGlobalMouseDown(event: EventMouse): void {}
    protected onGlobalMouseMove(event: EventMouse): void {}
    protected onGlobalMouseUp(event: EventMouse): void {}
    protected onGlobalMouseWheel(event: EventMouse): void {}

    // GlobalTouch 开启全局触摸事件
    protected onGlobalTouchStart(event: EventTouch): void {}
    protected onGlobalTouchMove(event: EventTouch): void {}
    protected onGlobalTouchEnd(event: EventTouch): void {}
    protected onGlobalTouchCancel(event: EventTouch): void {}
}
```

## NewComponent2D脚本模版

### 用于在CocosCreator编辑器中快速创建脚本

```typescript
import { _decorator, Node } from "cc";
import { Component2D, registerComponent2D } from "cc-2d-kit";

const { ccclass, property } = _decorator;

@registerComponent2D({
    enableEvents: ["Mouse", "Touch", "Collision", "GlobalKeyboard", "GlobalMouse", "GlobalTouch"],
})
@ccclass("<%UnderscoreCaseClassName%>")
export class <%UnderscoreCaseClassName%> extends Component2D {

}

```
