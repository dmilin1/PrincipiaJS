import { Body, Composite, Detector, Render, Vector } from "matter-js"
import { changeDrawPosition, drawStrongestGravIndicator } from "./drawers"
import { createBody, deleteBody, initializeStartPosition } from "./spawners"

// Helpers

export function scaleMass(body, scaling) {
    body.custom.mass *= scaling
    var radiusScaling = calculateRadius(scaling) / calculateRadius(1)
    Body.scale(body, radiusScaling, radiusScaling)
}

export function calculateRadius(mass) {
    return mass ** 0.5
}

// Returns the force on bodyA from gravity with bodyB in form of a force
// Vector representing F = G ( m_1 * m_2 ) / r^2 for a given draw cycle
export function calcGravity(sim, bodyA, bodyB) {
    var dir = Vector.sub(bodyB.position, bodyA.position)
    var distSqrd = Vector.magnitudeSquared(dir)
    var norm = Vector.normalise(dir)
    var grav = Vector.mult(norm, bodyA.custom.mass * bodyB.custom.mass / distSqrd )
    var gravMultiplier = 0.0001 * sim.settings.gravity
    grav = Vector.mult(grav, gravMultiplier)
    return grav
}


// Physics Implementation

export function resetSimulation(sim) {
    if (['clearAll', 'resetSimulation'].includes(sim.settings.buttonPressed)) {
        Composite.allBodies(sim.engine.world).forEach(body => {
            deleteBody(sim, body)
        })
        if (sim.settings.buttonPressed == 'resetSimulation') {
            initializeStartPosition(sim)
        }
        sim.renderCenter = {
            x: ( sim.render.bounds.max.x - sim.render.bounds.min.x ) / 2,
            y: ( sim.render.bounds.max.y - sim.render.bounds.min.y ) / 2,
        }
        changeDrawPosition(sim, sim.renderCenter)
        sim.settings.buttonPressed = null
    }
}

export function generateDust(sim) {
    if (sim.settings.buttonPressed == 'generateDust') {
        sim.settings.buttonPressed = null
        for (var _ of Array(100)) {
            var position = Vector.create(
                ( Math.random() - 0.5 ) * sim.render.options.width + sim.renderCenter.x,
                ( Math.random() - 0.5 ) * sim.render.options.height + sim.renderCenter.y,
            )
            var angle = Vector.angle(position, sim.renderCenter)
            var distance = Vector.magnitude(Vector.sub(position, sim.renderCenter))
            var rotation = Vector.div(Vector.rotate(Vector.create(0, 15), angle), distance ** 0.5)
            var velocity = Vector.create(
                2 * (Math.random() ** 4) * ( Math.random() > 0.5 ? 1 : -1 ),
                2 * (Math.random() ** 4) * ( Math.random() > 0.5 ? 1 : -1 ),
            )
            velocity = Vector.add(rotation, velocity)
            var mass = Math.max(1, Math.random() ** 4 * 10)
            createBody(sim, {
                shape: 'circle',
                position,
                velocity,
                moveable: true,
                interactible: true,
                mass,
                type: 'planet',
            })
        }
    }
}

export function calcAllForces(sim) {
    const { engine, frame } = sim
    engine.world.bodies.forEach(bodyA => {
        engine.world.bodies.forEach(bodyB => {
            if (
                !bodyA.custom.interactible
                || !bodyA.custom.moveable
                || !bodyB.custom.interactible
                || bodyA == bodyB
            ) {
                return
            }

            var grav = calcGravity(sim, bodyA, bodyB)
            Body.applyForce(
                bodyA,
                bodyA.position,
                grav
            )
            Body.setAngularVelocity(bodyA, 0)
            Body.setAngularVelocity(bodyB, 0)
        })
    })
}

export function growUnbornPlanets({ engine }) {
    engine.world.bodies.forEach(body => {
        if (body.custom.type != 'indicatorPlanet') {
            return
        }
        const scaling = calculateRadius(body.custom.mass + body.custom.mass ** 0.5) / calculateRadius(body.custom.mass)
        scaleMass(body, scaling)
    })
}

export function handleCollisions(sim) {
    const { engine, detector, frame } = sim
    Detector.collisions(detector).forEach(collision => {
        const [ bodyA, bodyB ] = [ collision.bodyA, collision.bodyB ].sort((a, b) => b.custom.mass - a.custom.mass)
        
        var totalMass = bodyA.custom.mass + bodyB.custom.mass
        var bodyAKinetic = Vector.mult(bodyA.velocity, bodyA.custom.mass)
        var bodyBKinetic = Vector.mult(bodyB.velocity, bodyB.custom.mass)
        var totalVelocity = Vector.div(Vector.add(bodyAKinetic, bodyBKinetic), totalMass)

        if (bodyA.custom.moveable) {
            Body.setVelocity(bodyA, totalVelocity)
        }
        scaleMass(bodyA, 1 + bodyB.custom.mass / bodyA.custom.mass)
        deleteBody(sim, bodyB)
    })
}

export function setRenderView(sim) {
    var target = sim.viewTarget
    if (!target) return
    changeDrawPosition(sim, target.position)
}

export default function handlePhysics(sim) {
    [
        resetSimulation,
        generateDust,
        handleCollisions,
        calcAllForces,
        growUnbornPlanets,
        growUnbornPlanets,
        drawStrongestGravIndicator,
        setRenderView,
    ].forEach(func => func(sim))
}