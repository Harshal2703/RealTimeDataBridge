

class RTDB_Backend {
    // fHJQowZSpq_RTDB
    #app = null
    #cno = 0
    #clients = {}
    #client_to_server_function = undefined



    generateUUID() {
        return `xxxxxxxx-xxxx-${this.#cno}xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    listen(func) {
        this.#client_to_server_function = func
    }

    emmiter(client_id) {
        if (this.#clients[client_id]["res"] != null && this.#clients[client_id]["data_queue"].length > 0) {
            const res = this.#clients[client_id]["res"]
            this.#clients[client_id]["res"] = null
            const data = this.#clients[client_id]["data_queue"].shift()
            res.send(data)
        }
    }

    unicast(client_id, data) {
        if (this.#clients[client_id] != undefined) {
            data["type"] = "unicast"
            this.#clients[client_id]["data_queue"].push(data)
            this.emmiter(client_id)
        }
    }

    broadcast(data) {
        const arr = Object.keys(this.#clients)
        arr.forEach((key) => {
            data["type"] = "broadcast"
            this.#clients[key]["data_queue"].push(data)
            this.emmiter(key)
        })
    }

    constructor(app) {
        this.#app = app
        this.#app.get("/fHJQowZSpq_RTDB/connect", (req, res) => {
            this.#cno ++
            const client_id = this.generateUUID()
            this.#clients[client_id] = {
                "res": null,
                "data_queue": []
            }
            res.send({ "client_id": client_id });
        });
        this.#app.post("/fHJQowZSpq_RTDB/client_to_server", (req, res) => {
            const client_data = req.body
            if (this.#clients[client_data["client_id"]] != undefined && this.#client_to_server_function != undefined) {
                this.#client_to_server_function(client_data)
                res.send({ "status": "received" })
            } else {
                res.send({ "status": "rejected" })
            }
        });
        this.#app.post("/fHJQowZSpq_RTDB/server_to_client", (req, res) => {
            const client_data = req.body
            const client_id = client_data["client_id"]
            console.log(client_id, "is listening")
            if (this.#clients[client_id] != undefined) {
                this.#clients[client_id]["res"] = res
                this.emmiter(client_id)
            } else {
                res.send({ "message": "client does not exist" })
            }
        });
        this.#app.post("/fHJQowZSpq_RTDB/disconnect", (req, res) => {
            const client_data = req.body
            const client_id = client_data["client_id"]
            if (this.#clients[client_id] != undefined) {
                delete this.#clients[client_id]
                res.send({ "status": "diconnected" })
            } else {
                res.send({ "message": "client does not exist" })
            }
        });
    }

}


module.exports = RTDB_Backend