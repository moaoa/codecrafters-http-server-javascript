const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });
  socket.on("data", (data) => {
    const requestLine = data.toString().split("\r\n")[0];
    const [requestMethod, path, httpVersion] = requestLine.split(" ");
    console.log("path: ", path);
    if (path === "/") {
      socket.write("HTTP/1.1  200 OK\r\n\r\n", console.error);
    } else if (path.startsWith("/echo")) {
      const data = path.slice("/echo/".length);
      console.log(data);
      socket.write("HTTP/1.1  200 OK\r\n");
      socket.write("Content-Type: text/plain\r\n");
      socket.write(`Content-Length:  ${data.length}\r\n\r\n`);
      socket.write(data);
    } else {
      socket.write("HTTP/1.1  404 Not Found\r\n\r\n", console.error);
    }
  });
});

server.listen(4221, "localhost");
