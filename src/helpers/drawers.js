import { Body, Render, Vector, Vertices } from "matter-js"
import { calcGravity } from "./physics"

export function drawNormalIndicator(sim, mouse) {
    const { engine } = sim
    const body = sim.indicatorRectangle

    const mouseAngle = Vector.angle(sim.mouseLastDownPosition, mouse.position)
    const mouseDelta = Vector.sub(mouse.position, sim.mouseLastDownPosition)
    const length = Vector.magnitude(mouseDelta)
    const lineThickness = 2
    const verts = Vertices.create([
        Vector.rotate(Vector.create(0, 0), mouseAngle),
        Vector.rotate(Vector.create(0, lineThickness), mouseAngle),
        Vector.rotate(Vector.create(length, lineThickness), mouseAngle),
        Vector.rotate(Vector.create(length, 0), mouseAngle),
    ], body)

    Body.setPosition(body, Vector.add(sim.mouseLastDownPosition, Vector.div(mouseDelta, 2)))
    Body.setVertices(body, verts)
}

export function drawStrongestGravIndicator(sim) {
    const { engine } = sim
    const rect = sim.indicatorRectangle
    const body = sim.indicatorPlanet

    if (!sim.indicatorRectangle || !sim.settings.perfectOrbits) {
        return
    }

    var potentialBodies = engine.world.bodies.filter(bodyB => {
        return bodyB.custom.interactible
    })

    sim.interactibleBodies = potentialBodies.length
    
    if (potentialBodies.length < 1) {
        return
    }

    var bestBody = null
    var bestGravity = null

    potentialBodies.forEach(bodyB => {
        var currGravity = Vector.magnitude(calcGravity(sim, body, bodyB))
        if (currGravity > bestGravity) {
            bestGravity = currGravity
            bestBody = bodyB
        }
    }, null)

    sim.indicatorNearestGravBody = bestBody
    sim.indicatorNearestGravForce = bestGravity

    const bodyAngle = Vector.angle(sim.mouseLastDownPosition, bestBody.position)
    const bodyDelta = Vector.sub(bestBody.position, sim.mouseLastDownPosition)
    const length = Vector.magnitude(bodyDelta)
    const lineThickness = 2
    const verts = Vertices.create([
        Vector.rotate(Vector.create(0, 0), bodyAngle),
        Vector.rotate(Vector.create(0, lineThickness), bodyAngle),
        Vector.rotate(Vector.create(length, lineThickness), bodyAngle),
        Vector.rotate(Vector.create(length, 0), bodyAngle),
    ], rect)

    Body.setPosition(rect, Vector.add(sim.mouseLastDownPosition, Vector.div(bodyDelta, 2)))
    Body.setVertices(rect, verts)
}

export function changeDrawPosition(sim, pos) {
    var width = sim.render.bounds.max.x - sim.render.bounds.min.x
    var height = sim.render.bounds.max.y - sim.render.bounds.min.y
    Render.lookAt(sim.render, [{
        bounds: {
            max: {
                x: pos.x + width / 2,
                y: pos.y + height / 2,
            },
            min: {
                x: pos.x - width / 2,
                y: pos.y - height / 2,
            }
        },
    }])
}