import { Popup, PopupOptions } from "nativescript-popup"
import { Label } from "tns-core-modules/ui/label";
import * as dialogs from "tns-core-modules/ui/dialogs";
import levelTwo from "./App_Resources/levelTwo";


const Page = require("tns-core-modules/ui/page").Page;
var Physics = require("nativescript-physics-js");
var accelerometer = require("nativescript-accelerometer");
var page = Page;
var init = false;



export function pageLoaded(args) {
    if (init) {
        return;
    }

    var page = args.object;
    var container = page.getViewById("container");
    var metaText = page.getViewById("meta");
    var world = Physics({ sleepDisabled: true });


    world.add(Physics.renderer('ns', {
        container: container,
        metaText: metaText,
        meta: true
    }));


    world.add([
        Physics.behavior('edge-collision-detection', { aabb: Physics.aabb(0, 0, 300, 400) }), // Scene bounds
        Physics.behavior('body-collision-detection'), // Collision related
        Physics.behavior('body-impulse-response'), // Collision related
        Physics.behavior('sweep-prune'), // Collision related
        Physics.behavior('constant-acceleration') // Gravity
    ]);


    world.on('step', function () { world.render() });
    setInterval(function () { world.step(Date.now()); }, 20);

    addBall(world, 50, 150);

    function addBall(world, x, y) {
        var ball = Physics.body('circle', {
            label: "ball",
            x: x,
            y: y,
            radius: 30,
            styles: { image: "~/loveBall.png" },
        });
        ball.restitution = 0.3;

        world.add(ball);
    }


    var gravity = Physics.behavior('constant-acceleration', { acc: { x: 0, y: 0 } });
    world.add([
        gravity
    ]);

    setTimeout(function () {
        accelerometer.startAccelerometerUpdates((data) => {
            var xAcc = -data.x * 0.003;
            var yAcc = data.y * 0.003;
            gravity.setAcceleration({ x: xAcc, y: yAcc });
        })
    }, 1000);

    const gravity_scale = 0.003;

    function addWall(world, x, y, width, height, angle) {
        world.add(Physics.body('rectangle', {
            treatment: 'static',
            x: x,
            y: y,
            width: width,
            height: height,
            angle: 0,
            styles: { color: "black" }
        }));
    }

    function addTarget(world, x, y) {
        world.add(Physics.body('circle', {
            label: 'target',
            treatment: 'static',
            x: x,
            y: y,
            radius: 20,
            styles: { image: "~/target.png" }
        }));
    }

    var query = Physics.query({
        $or: [
            { bodyA: { label: 'ball' }, bodyB: { label: 'target' } }
            , { bodyB: { label: 'target' }, bodyA: { label: 'ball' } }
        ]
    });


    function goToNextLevel(){
        this.$navigateTo(levelTwo, {
            clearHistory: true
        });
    }


    world.on('collisions:detected', function (data, e) {
        if (Physics.util.find(data.collisions, query)) {
            world.pause();

            dialogs.confirm({
                title: "You WIN!",
                okButtonText: "GO TO NEXT LEVEL",


            }).then(result => {
                // result argument is boolean
                console.log("Dialog result: " + result);
                goToNextLevel();
            });


        }
    });

    addWall(world, 0, 150, 20, 300, 0);
    addWall(world, 300, 150, 20, 300, 0);
    addWall(world, 150, 0, 300, 20, 0);
    addWall(world, 150, 300, 300, 20, 0);
    addWall(world, 150, 250, 10, 200, 0);

    addTarget(world, 225, 225);




}

