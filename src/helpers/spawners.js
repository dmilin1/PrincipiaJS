import { Body, Bodies, Composite, Detector, Vector } from "matter-js"
import { calculateRadius } from "./physics"


export function initializeStartPosition(sim) {
    createBody(sim, {
        position: Vector.create(window.innerWidth / 2, window.innerHeight / 2),
        mass: 300,
        moveable: false,
        color: 'yellow'
    })
    // createBody(sim, {
    //     position: Vector.create(600, 400),
    //     size: 20,
    //     moveable: true,
    //     color: 'green',
    // })
}

export function reloadDetector({ detector, engine }) {
    Detector.setBodies(detector, engine.world.bodies.filter(body => body.custom.interactible))
}

export function createBody(sim, {
        shape='circle',
        position,
        mass,
        velocity,
        width=10,
        height=10,
        moveable=true,
        interactible=true,
        color,
        type='planet',
    }) {
    const { engine, settings } = sim
    if (shape == 'circle') {
        var params = [ position.x, position.y, calculateRadius(mass) ]
    } else if (shape == 'rectangle') {
        var params = [ position.x, position.y, width, height ]
    }
    if (!color) {
        if (settings.randomColor) {
            color = `hsla(${Math.random() * 360}, 100%, ${Math.round(95 - Math.random() * 25)}%, 1)`
        } else {
            color = (moveable || settings.moveable) ? 'lightblue' : 'yellow'
        }
    }
    let body = Bodies[shape](...params, {
        restitution: 0.0,
        friction: 1,
        frictionAir: 0,
        isStatic: !settings.moveable,
        isSensor: true,
        collisionFilter: interactible ? {} : {
            category: 0x0001,
            mask: 0x00000000,
        },
        render: {
            fillStyle: color,
        },
        custom: {
            type,
            moveable: moveable && settings.moveable,
            interactible,
            mass: mass,
        },
    })
    if (velocity && settings.moveable) {
        Body.setVelocity(body, velocity)
    }
    Composite.add(engine.world, body);
    if (interactible) {
        reloadDetector(sim)
    }
    return body
}

export function deleteBody(sim, body, reload=true) {
    const { engine } = sim
    Composite.remove(engine.world, body)
    if (sim.viewTarget == body) sim.viewTarget = null
    if (reload) reloadDetector(sim)
}

export function spawnIndicators(sim, mouse) {
    sim.indicatorPlanet = createBody(sim, {
        shape: 'circle',
        position: mouse.mousedownPosition,
        moveable: false,
        interactible: false,
        mass: 2,
        type: 'indicatorPlanet',
    })
    sim.indicatorRectangle = createBody(sim, {
        shape: 'rectangle',
        width: 1,
        height: 4,
        position: mouse.mousedownPosition,
        moveable: false,
        interactible: false,
        mass: 2,
        color: 'green',
        type: 'indicatorRectangle',
    })
}