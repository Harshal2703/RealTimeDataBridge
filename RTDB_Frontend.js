class RTDB_Frontend {
    #id = null
    #url = null
    #listen_server_func = null
    async connect(url) {
        this.#url = url
        const response = await fetch(this.#url + "/fHJQowZSpq_RTDB/connect")
        if (response.ok) {
            const data = await response.json();
            console.log(data["id"])
            this.#id = data["id"]
            return "connected"
        }
        return "connection failed"
    }
    async emit(data) {
        if (this.#url != null && this.#id) {
            const payload = {
                "client_id": this.#id,
                "data": data
            }
            const client_emit_url = this.#url + "/fHJQowZSpq_RTDB/client_emit"
            const response = await fetch(client_emit_url, {
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
        if (this.#url != null && this.#id && this.#listen_server_func) {
            const payload = {
                "client_id": this.#id,
            }
            const url = this.#url + "/fHJQowZSpq_RTDB/server_emit"
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            if (response.ok) {
                const data = await response.json()
                this.#listen_server_func(data)
                this.listen_server()
            }
            return "failed to listen data"
        }
    }
    listen(data) {
        this.#listen_server_func = data
        this.listen_server()
    }
}