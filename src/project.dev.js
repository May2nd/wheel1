window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  Game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "329d6osB/BO2rGhMkWlDbGd", "Game");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        wheel: require("LuckyWheel"),
        label: cc.Label,
        labelFrame: cc.Label,
        est: cc.Label,
        frame: 0
      },
      start: function start() {
        this.updateEST();
      },
      onBtnStart: function onBtnStart() {
        var value = 8 * Math.random() | 0;
        this.wheel.startRotate(value);
        this.label.string = value + 1;
      },
      update: function update(dt) {},
      onChangeIncAcc: function onChangeIncAcc(value, eb) {
        var v = Math.max(1, parseInt(value) || 1);
        eb.string = v;
        this.wheel.incAcc = v;
        this.updateEST();
      },
      onChangeDecAcc: function onChangeDecAcc(value, eb) {
        var v = Math.max(1, parseInt(value) || 1);
        eb.string = v;
        this.wheel.decAcc = v;
        this.updateEST();
      },
      onChangeMaxSpeed: function onChangeMaxSpeed(value, eb) {
        var v = Math.max(1, parseInt(value) || 1);
        eb.string = v;
        this.wheel.maxSpeed = v;
        this.updateEST();
      },
      updateEST: function updateEST() {
        var _wheel$getEST = this.wheel.getEST(), min = _wheel$getEST.min, max = _wheel$getEST.max;
        this.est.string = min.toFixed(2) + "~" + max.toFixed(2);
      }
    });
    cc._RF.pop();
  }, {
    LuckyWheel: "LuckyWheel"
  } ],
  LuckyWheel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "57a58JceFhFlLmZZT3C3om6", "LuckyWheel");
    "use strict";
    var STATE = {
      STOP: 0,
      START: 1,
      FLOAT: 2,
      SLOW: 3
    };
    cc.Class({
      extends: cc.Component,
      properties: {
        startAngle: 231,
        angleCount: 8,
        direction: {
          default: 1,
          type: cc.Enum({
            1: 1,
            "-1": 2
          })
        },
        incAcc: 200,
        decAcc: 200,
        maxSpeed: 360,
        result: 5,
        _angleResult: [],
        _state: 0,
        _acc: 0,
        _speed: 0,
        _slowTime: 0,
        _toStopTime: 0,
        _direction: 1,
        _lastAngle: 0
      },
      start: function start() {
        this.node.angle = this.startAngle;
        2 == this.direction && (this._direction = -1);
        this.setupAngleResult();
      },
      roundAngle: function roundAngle(angle) {
        angle > 180 && (angle -= 360);
        angle < -180 && (angle += 360);
        angle = (100 * angle | 0) / 100;
        return angle;
      },
      setupAngleResult: function setupAngleResult() {
        var angle = 360 / this.angleCount;
        for (var i = 0; i < this.angleCount; ++i) this._angleResult[i] = this.roundAngle(this.startAngle - i * angle);
      },
      startRotate: function startRotate() {
        var value = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 4;
        this._state = STATE.START;
        this._acc = this.incAcc;
        this._speed = 0;
        this._time = 0;
        this.result = value;
        console.log("=================START");
      },
      update: function update(dt) {
        this._time += dt;
        switch (this._state) {
         case STATE.START:
          this.updateSpeed(dt);
          this.updatePositionBySpeed(dt);
          break;

         case STATE.FLOAT:
          this.updatePositionBySpeed(dt);
          this.result >= 0 && this.slowDown();
          break;

         case STATE.SLOW:
          this.updatePositionSlow(dt);
        }
        this._lastAngle = this.node.angle;
      },
      slowDown: function slowDown() {
        this._state = STATE.SLOW;
        this._slowTime = 0;
        this._acc = -this._direction * this.decAcc;
        var t = -this._speed / this._acc;
        this._toStopTime = t;
        var stopDistance = Math.abs(this._speed * t + .5 * this._acc * t * t);
        var distance = this.distanceBetween2Angle(this.node.angle, this._angleResult[this.result]);
        while (distance < stopDistance) distance += 360;
        this.startSlowAngle = this.roundAngle(this.node.angle + (distance - stopDistance) * this._direction);
        this.floatTimeExtend = (distance - stopDistance) / this._speed * this._direction;
      },
      distanceBetween2Angle: function distanceBetween2Angle(start, end) {
        start < 0 && (start += 360);
        end < 0 && (end += 360);
        var angle = (end - start) * this._direction;
        angle < 0 && (angle += 360);
        return angle;
      },
      updateSpeed: function updateSpeed(dt) {
        this._speed += this._direction * this._acc * dt;
        if (this._direction * this._speed >= this.maxSpeed) {
          this._speed = this.maxSpeed * this._direction;
          this._state = STATE.FLOAT;
        }
      },
      updatePositionBySpeed: function updatePositionBySpeed(dt) {
        this.node.angle = this.roundAngle(this.node.angle + this._speed * dt);
      },
      updatePositionSlow: function updatePositionSlow(dt) {
        if (this.floatTimeExtend > 0) if (this.floatTimeExtend - dt > 0) {
          this.updatePositionBySpeed(dt);
          this.floatTimeExtend -= dt;
        } else {
          this._slowTime = dt - this.floatTimeExtend;
          this.floatTimeExtend = 0;
          this.updatePositionOnSlow();
        } else {
          this._slowTime += dt;
          if (this._slowTime >= this._toStopTime) {
            this._slowTime = this._toStopTime;
            this._state = STATE.STOP;
            cc.log(this._time);
          }
          this.updatePositionOnSlow();
        }
      },
      updatePositionOnSlow: function updatePositionOnSlow() {
        this.node.angle = this.roundAngle(this.startSlowAngle + this._speed * this._slowTime + .5 * this._acc * this._slowTime * this._slowTime);
      },
      getEST: function getEST() {
        var t0 = this.maxSpeed / this.incAcc;
        var t1 = this.maxSpeed / this.decAcc;
        var t2 = 360 / this.maxSpeed;
        console.log("------------------------------------");
        console.log("Th\u1eddi gian \u0111\u1ec3 \u0111\u1ea1t t\u1ed1c \u0111\u1ed9 t\u1ed1i \u0111a: " + t0);
        console.log("Th\u1eddi gian d\u1eebng: " + t1);
        console.log("Th\u1eddi gian ch\xeanh l\u1ec7ch: " + t2);
        return {
          min: t0 + t1,
          max: t0 + t1 + t2
        };
      }
    });
    cc._RF.pop();
  }, {} ],
  WheelGraphics: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "520d11nX+9FWon4pIwcYrI7", "WheelGraphics");
    "use strict";
    var COLOR = [ new cc.Color(195, 46, 48, 255), new cc.Color(65, 104, 224, 255), new cc.Color(68, 150, 57, 255), new cc.Color(229, 180, 65, 255) ];
    cc.Class({
      extends: cc.Component,
      properties: {
        arcCount: 8,
        radius: 275
      },
      start: function start() {
        var g = this.getComponent(cc.Graphics);
        g.moveTo(0, 0);
        var arcAngle = 2 * Math.PI / this.arcCount;
        for (var i = 0; i < this.arcCount; ++i) {
          g.fillColor = COLOR[i % COLOR.length];
          var angle0 = arcAngle * i;
          var angle1 = arcAngle * (i + 1);
          g.arc(0, 0, this.radius, angle0, angle1, true);
          var x0 = this.radius * Math.cos(angle0);
          var y0 = this.radius * Math.sin(angle0);
          var x1 = this.radius * Math.cos(angle1);
          var y1 = this.radius * Math.sin(angle1);
          g.moveTo(0, 0);
          g.lineTo(x0, y0);
          g.lineTo(x1, y1);
          g.lineTo(0, 0);
          g.close();
          g.fill();
          var label = new cc.Node();
          label.parent = this.node;
          label.setPosition((x0 + x1) / 3, (y0 + y1) / 3);
          label.angle = (angle0 + angle1) / 2 * 180 / Math.PI - 90;
          label = label.addComponent(cc.Label);
          label.string = i + 1;
        }
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "Game", "LuckyWheel", "WheelGraphics" ]);
//# sourceMappingURL=project.dev.js.map