import React, { useState, useEffect, useRef } from "react"
import { Engine, Render, Detector } from "matter-js"

import Menu from "./components/menu"

import handlePhysics from "./helpers/physics"
import { initializeStartPosition } from "./helpers/spawners"
import handleMouseEvents from "./helpers/handleMouseEvents"

export const defaultSettings = {
    menuOpen: false,
    moveable: true,
    randomColor: false,
    perfectOrbits: false,
    controlMode: 'Spawn',
    gravity: 0.125,
    startVelocity: 0.125,
    simulationSpeed: 1,
    buttonPressed: null,

    // TODO - control:
    // (follow object) - make the camera follow an object Render.lookAt()
}

const App = () => {
    const sceneRef = useRef(null)
    const canvasRef = useRef(null)
    var simRef = useRef(null)

    const [ settings, setSettings ] = useState(defaultSettings)

    useEffect(() => {
        var sim = {
            frame: 0,
            mouseLastDown: 0,
            mouseLastDownPosition: {
                x: 0,
                y: 0,
            },
            mouseLastUp: 1,
            indicatorPlanet: null,
            indicatorRectangle: null,
            indicatorNearestGravBody: null,
            indicatorNearestGravForce: null,
            interactibleBodies: null,
            viewTarget: null,
            renderLoop: 0,
            renderCenter: null,
            settings: {},
        }
        sim.engine = Engine.create({
            constraintIterations: 1,
            positionIterations: 1,
            velocityIterations: 1,
            gravity: {
                scale: 0,
            }
        })
        sim.render = Render.create({
            element: sceneRef,
            engine: sim.engine,
            canvas: canvasRef.current,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                showVelocity: true,
                wireframes: false,
                showDebug: true,
                showPerformance: true,
                showStats: true,
            }
        })
        sim.renderCenter = {
            x: ( sim.render.bounds.max.x - sim.render.bounds.min.x ) / 2,
            y: ( sim.render.bounds.max.y - sim.render.bounds.min.y ) / 2,
        }
        sim.detector = Detector.create()

        handleMouseEvents(sim)

        initializeStartPosition(sim)

        simRef.current = sim
    }, [])

    useEffect(() => {
        (async () => {
            if (simRef.current) {
                const renderHash = Math.random()
                simRef.current.renderLoop = renderHash
                var sim = simRef.current
                var { engine, render } = sim
                sim.settings = settings
                const renderLoop = async () => {
                    if (simRef.current.renderLoop !== renderHash) {
                        return
                    }
                    sim.frame += 1
                    handlePhysics(sim)
                    Engine.update(engine)
                    Render.world(render)
                    await new Promise(res => setTimeout(() => res(), 1000 / 60 / settings.simulationSpeed))
                    window.requestAnimationFrame(() => renderLoop())
                }
                window.requestAnimationFrame(renderLoop)
                simRef.current = sim
            }
        })()
    }, [ settings ])

    return (
        <div ref={sceneRef}>
            <Menu settings={settings} setSettings={setSettings}/>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default App
