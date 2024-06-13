class RTDB_Frontend {
    #id = null
    #url = null
    #server_to_client_function = null



    async connect(url) {
        this.#url = url
        const response = await fetch(this.#url + "/fHJQowZSpq_RTDB/connect")
        if (response.ok) {
            const data = await response.json();
            console.log(data["client_id"])
            this.#id = data["client_id"]
            return { "status": "connected" }
        }
        return { "status": "failed to connect" }
    }
    async emit(data) {
        if (this.#url != null && this.#id) {
            const payload = {
                "client_id": this.#id,
                "data": data
            }
            const url = this.#url + "/fHJQowZSpq_RTDB/client_to_server"
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            if (response.ok) {
                const data = await response.json()
                return data
            }
            return "failed to send data"
        }
    }
    async listen_server() {
        if (this.#url != null && this.#id && this.#server_to_client_function) {
            const payload = {
                "client_id": this.#id,
            }
            const url = this.#url + "/fHJQowZSpq_RTDB/server_to_client"
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            if (response.ok) {
                const data = await response.json()
                this.#server_to_client_function(data)
                this.listen_server()
            }
            return { "status": "disconnected" }
        }
    }
    listen(data) {
        this.#server_to_client_function = data
        this.listen_server()
    }
    async disconnect() {
        if (this.#id != null) {
            const payload = {
                "client_id": this.#id,
            }
            const url = this.#url + "/fHJQowZSpq_RTDB/disconnect"
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            if (response.ok) {
                const data = await response.json()
                return data
            }
            return "failed to disconnect"
        }
    }
}