import { Server } from "@xy/server";


const server: Server = new Server({});

server.register("/", {
  models: [],
  views: [],
});


server.start("localhost", 8080, () => {
});

console.log("test 01")
