import React, { useEffect, useRef } from "react"
import { defaultSettings } from "../App"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faXmark,
    faSquare,
    faSquareCheck,
    faCircleNotch,
    faCircleArrowRight,
    faPalette,
    faHammer,
    faEraser,
    faEarthAmerica,
    faClockRotateLeft,
    faGear,
    faTrashCan,
    faEye,
    faArrowsUpDownLeftRight,
} from '@fortawesome/free-solid-svg-icons'

import '../styles/menu.scss'

const Menu = ({settings, setSettings}) => {

    const setSetting = (key, value) => {
        setSettings({ ...settings, [key]: value })
    }

    const settingsOptions = [{
        text: `Control Mode: ${settings.controlMode}`,
        type: 'spacer',
        header: true,
    }, {
        text: 'Spawn',
        type: 'button',
        icon: <FontAwesomeIcon icon={faHammer} />,
        func: () => setSetting('controlMode', 'Spawn'),
    }, {
        text: 'Erase',
        type: 'button',
        icon: <FontAwesomeIcon icon={faEraser} />,
        func: () => setSetting('controlMode', 'Erase'),
    }, {
        text: 'Set Focus',
        type: 'button',
        icon: <FontAwesomeIcon icon={faEye} />,
        func: () => setSetting('controlMode', 'Set Focus'),
    }, {
        text: 'Pan',
        type: 'button',
        icon: <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />,
        func: () => setSetting('controlMode', 'Pan'),
    }, {
        text: `Spawner Options`,
        type: 'spacer',
        header: true,
    }, {
        id: 'moveable',
        text: 'Moveable Planets',
        type: 'bool',
        icon: <FontAwesomeIcon icon={faCircleArrowRight} />,
    }, {
        id: 'randomColor',
        text: 'Randomized Color',
        type: 'bool',
        icon: <FontAwesomeIcon icon={faPalette} />,
    }, {
        id: 'perfectOrbits',
        text: 'Perfect Orbit',
        type: 'bool',
        icon: <FontAwesomeIcon icon={faCircleNotch} />,
    }, {
        text: `Settings`,
        type: 'spacer',
        header: true,
    }, {
        id: 'gravity',
        text: `Gravity (${Math.round(settings.gravity * 1000) / 10})`,
        type: 'slider',
        value: settings.gravity ** (1/3),
        func: (e) => setSetting('gravity',
            0.00001 + ( document.getElementById('gravity').value ) ** 3
        ),
    }, {
        id: 'startVelocity',
        text: `Start Velocity (${Math.round(settings.startVelocity * 1000) / 10})`,
        type: 'slider',
        value: settings.startVelocity ** (1/3),
        func: (e) => setSetting('startVelocity',
            document.getElementById('startVelocity').value ** 3
        ),
    }, {
        id: 'simulationSpeed',
        text: `Simulation Speed (${Math.round(settings.simulationSpeed * 100) / 100}x)`,
        type: 'slider',
        step: 0.025,
        value: settings.simulationSpeed ** (1/3) / 2,
        func: (e) => setSetting('simulationSpeed',
            0.00001 + (2 * document.getElementById('simulationSpeed').value) ** 3
        ),
    }, {
        text: ``,
        type: 'spacer',
    }, {
        text: 'Generate Dust',
        type: 'button',
        icon: <FontAwesomeIcon icon={faEarthAmerica} />,
        func: () => setSetting('buttonPressed', 'generateDust'),
    }, {
        text: 'Reset Settings',
        type: 'button',
        icon: <FontAwesomeIcon icon={faGear} />,
        func: () => setSettings({ ...defaultSettings, menuOpen: true }),
    }, {
        text: 'Reset Simulation',
        type: 'button',
        icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
        func: () => setSetting('buttonPressed', 'resetSimulation'),
    }, {
        text: 'Clear All',
        type: 'button',
        icon: <FontAwesomeIcon icon={faTrashCan} />,
        func: () => setSetting('buttonPressed', 'clearAll'),
    }]
    
    return (
        <div id='menu-container' className={`menu-container ${settings.menuOpen ? 'menu-open' : 'menu-closed'}`}>
            <div className='menu-button' onPointerDown={() => setSetting('menuOpen', !settings.menuOpen)}>
                { settings.menuOpen ? <FontAwesomeIcon icon={faXmark} /> : 'Menu' }
            </div>
            { settings.menuOpen && <div className={'settings-grid'}>
                {settingsOptions.map(setting => {
                    if (setting.type == 'spacer') return (
                        <div key={setting.text} className={`settings-spacer-option ${setting.header ? 'spacer-header' : ''}`}>
                            { setting.icon }
                            <span className='settings-spacer-text'>
                                { setting.text }
                            </span>
                        </div>
                    )
                    if (setting.type == 'bool') return (
                        <div key={setting.text} className='settings-bool-option' onPointerDown={() => setSetting(setting.id, !settings[setting.id])}>
                            { setting.icon }
                            <span className='settings-bool-text'>
                                { setting.text }
                            </span>
                            <FontAwesomeIcon icon={ settings[setting.id] ? faSquareCheck : faSquare} />
                        </div>
                    )
                    if (setting.type == 'button') return (
                        <div key={setting.text} className='settings-button-option' onPointerDown={setting.func}>
                            { setting.icon }
                            <span className='settings-button-text'>
                                { setting.text}
                            </span> 
                        </div>
                    )
                    if (setting.type == 'slider') return (
                        <div key={setting.text} className='settings-slider-option'>
                            <div className='settings-slider-text'>
                                { setting.text }
                            </div>
                            <input id={setting.id} className='settings-slider' type="range" step={setting.step || "any"} min={0} max={1} defaultValue={setting.value} onPointerUp={setting.func}/>
                        </div>
                    )
                })}
            </div>}
        </div>
    );
}

export default Menu
