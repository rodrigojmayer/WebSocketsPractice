import { useEffect, useRef } from 'react'
import useWebSocket from 'react-use-websocket'
import throttle from 'lodash.throttle'

import { Cursor } from './components/Cursor'


const renderCursors = users => {
    return Object.keys(users).map(uuid => {
        const user = users[uuid]

        return (
            <Cursor key={uuid} point={[user.state.x, user.state.y]} />
        )
    })
}

// eslint-disable-next-line react/prop-types
export function Home ({ username }) {


    const WS_URL = import.meta.env.VITE_WS_URL
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username }
    })


    const THROTTLE = 50
    const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE))



    useEffect(() => {
        sendJsonMessage({
            x: 0,
            y: 0
        })
        window.addEventListener("mousemove", e => {
            sendJsonMessageThrottled.current({
                x: e.clientX,
                y: e.clientY
            })
        })
    }, [])


    if (lastJsonMessage) {
        return <>
            {renderCursors(lastJsonMessage)}
        </>
    }

    return <h1>Hello, {username} </h1>
}