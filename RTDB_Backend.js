

class RTDB_Backend {
    // fHJQowZSpq_RTDB
    #app
    #cno = 0
    #clients = {}
    #client_listen_func = undefined

    // functions
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    listen(func) {
        this.#client_listen_func = func
    }

    emit(client_id, data) {
        if (this.#clients[client_id]["res"]) {
            const res = this.#clients[client_id]["res"]
            this.#clients[client_id]["res"] = null
            console.log("server emitted", data)
            res.send(data)
        }
    }

    broadcast(data) {
        const arr = Object.keys(this.#clients)
        arr.forEach((key) => {
            this.emit(key, data)
        })
    }

    constructor(app) {
        this.#app = app
        this.#app.get("/fHJQowZSpq_RTDB/connect", (req, res) => {
            this.#cno = this.#cno + 1
            const client_id = this.generateUUID() + `-${this.#cno}`
            this.#clients[client_id] = {
                "res": null
            }
            res.send({ "id": client_id });
        });
        this.#app.post("/fHJQowZSpq_RTDB/client_emit", (req, res) => {
            console.log("client emmited")
            const client_data = req.body
            if (this.#client_listen_func != undefined) {
                this.#client_listen_func(client_data)
            }
            res.send({ "received": true })
        });
        this.#app.post("/fHJQowZSpq_RTDB/server_emit", (req, res) => {
            const client_data = req.body
            const client_id = client_data["client_id"]
            console.log(client_id, "is listening")
            if (client_id in this.#clients) {
                this.#clients[client_id]["res"] = res
            } else {
                res.send({ "message": "client does not exist" })
            }
        });
    }

}


module.exports = RTDB_Backend