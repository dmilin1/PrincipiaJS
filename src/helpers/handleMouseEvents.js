import { Composite, Body, MouseConstraint, Events, Vector, Vertices, Query, Render } from "matter-js"
import { toEditorSettings } from "typescript"
import { createBody, deleteBody, spawnIndicators } from "./spawners"
import { changeDrawPosition, drawNormalIndicator } from "./drawers"

function mouseInElement(pos, elem) {
    const { top, bottom, left, right} = elem.getBoundingClientRect()
    const { x, y } = pos
    return (
        y < bottom
        && y > top
        && x > left
        && x < right
    )
}

function correctMousePositions(sim, mouse) {
    var renderPos = Vector.create(sim.render.bounds.min.x, sim.render.bounds.min.y)
    var correctedMouse = {}
    if (mouse.absolute) correctedMouse.absolute = Vector.add(mouse.absolute, renderPos)
    if (mouse.mousedownPosition) correctedMouse.mousedownPosition = Vector.add(mouse.mousedownPosition, renderPos)
    if (mouse.mouseupPosition) correctedMouse.mouseupPosition = Vector.add(mouse.mouseupPosition, renderPos)
    if (mouse.position) correctedMouse.position = Vector.add(mouse.position, renderPos)
    return correctedMouse
}

export function mouseUp(sim) {
    const { engine } = sim
    Events.on(MouseConstraint.create(engine), "mouseup", (e) => {
        sim.mouseLastUp = Date.now()
        var { mouse } = e
        var uncorrectedMouse = mouse
        mouse = correctMousePositions(sim, mouse)
        mouse.mousedownPosition = sim.mouseLastDownPosition

        if (mouseInElement(uncorrectedMouse.mousedownPosition, document.getElementById('menu-container'))) {
            return
        }

        if (sim.settings.controlMode == 'Spawn') {
            const body = sim.indicatorPlanet

            if (body?.custom?.type != 'indicatorPlanet') {
                return
            }
            
            if (!sim.settings.perfectOrbits || sim.interactibleBodies < 1) {
                var velocity = Vector.div(Vector.sub(mouse.mouseupPosition, mouse.mousedownPosition), 50)
                velocity = Vector.mult(velocity, sim.settings.startVelocity * 8)
            } else {
                var targetBody = sim.indicatorNearestGravBody
                var targetGrav = sim.indicatorNearestGravForce
                var direction = Vector.perp(Vector.sub(targetBody.position, mouse.mousedownPosition))
                var distance = Vector.magnitude(direction)
                var unitVec = Vector.normalise(direction)
                // The 0.97 is to account for planet growth. I think?
                var velocity = Vector.mult(unitVec, 0.97 * ( targetGrav * distance / body.custom.mass / 0.00001 ) ** 0.5)
                velocity = Vector.add(velocity, targetBody.velocity)
            }
            
            body.custom.type = 'planet'
            createBody(sim, {
                shape: 'circle',
                position: mouse.mousedownPosition,
                moveable: true,
                interactible: true,
                velocity,
                mass: body.custom.mass,
                color: body.render.fillStyle,
                type: 'planet',
            })
            deleteBody(sim, body, false)
            deleteBody(sim, sim.indicatorRectangle)
            sim.indicatorPlanet = null
            sim.indicatorRectangle = null
        } else if (sim.settings.controlMode == 'Pan') {
            sim.renderCenter = Vector.add(
                sim.renderCenter,
                Vector.sub(
                    uncorrectedMouse.mousedownPosition,
                    uncorrectedMouse.mouseupPosition
                )
            )
        }
    })
}

export function mouseMove(sim) {
    const { engine } = sim
    Events.on(MouseConstraint.create(engine), "mousemove", (e) => {
        var { mouse } = e
        mouse = correctMousePositions(sim, mouse)
        if (sim.mouseLastUp < sim.mouseLastDown) {
            if (sim.settings.controlMode == 'Spawn' && (!sim.settings.perfectOrbits  || sim.interactibleBodies < 1)) {
                drawNormalIndicator(sim, mouse)
            } else if (sim.settings.controlMode == 'Pan') {
                changeDrawPosition(sim,
                    Vector.add(
                        sim.renderCenter,
                        Vector.sub(
                            mouse.mousedownPosition,
                            mouse.position
                        )
                    )
                )
            }
        }
    })
}

export function mouseDown(sim) {
    const { engine } = sim
    Events.on(MouseConstraint.create(engine), "mousedown", (e) => {
        var { mouse } = e
        var uncorrectedMouse = mouse
        mouse = correctMousePositions(sim, mouse)
        if (mouseInElement(uncorrectedMouse.mousedownPosition, document.getElementById('menu-container'))) {
            return
        }
        sim.mouseLastDown = Date.now()
        sim.mouseLastDownPosition = {
            x: mouse.mousedownPosition.x,
            y: mouse.mousedownPosition.y
        }
        if (sim.settings.controlMode == 'Spawn') {
            if (sim.indicatorPlanet) {
                return
            }
            spawnIndicators(sim, mouse)
        } else if (sim.settings.controlMode == 'Erase') {
            var target = Query.point(engine.world.bodies, mouse.mousedownPosition)[0]
            if (target) deleteBody(sim, target)
        } else if (sim.settings.controlMode == 'Set Focus') {
            var target = Query.point(engine.world.bodies, mouse.mousedownPosition)[0]
            sim.viewTarget = target
        } else if (sim.settings.controlMode == 'Pan') {
            
        }
    })
}

export default function handleMouseEvents(sim) {
    [
        mouseUp,
        mouseMove,
        mouseDown,
    ].forEach(func => func(sim))
}