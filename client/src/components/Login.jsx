import { useState } from "react"

// eslint-disable-next-line react/prop-types
export function Login({ onSubmit }) {
    const [username, setUsername] = useState("")
    return (
        <>
        <h1>Welcome</h1>
        <p>What should people call you?</p>
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(username)
            }}
        >
            <input
                type="text"
                value={username}
                placeholder="username"
                onChange={(e) => setUsername(e.target.value)}
            />
            <input type="submit" />
        </form>
        </>
    )
}